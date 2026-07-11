// Load harness for the multiplayer relay (worker.js). Opens N concurrent
// clients against one room, each broadcasting `state` at the game's real
// 10 Hz cadence, and measures delivery: every state frame carries a send
// timestamp, every other client records (receive time - send time). The
// relay fans each frame out to N-1 peers, so total message rate grows as
// N * (N-1) * 10/s — the quadratic curve this harness exists to chart.
//
//   node scripts/relay-load.mjs [host] [counts...]
//   node scripts/relay-load.mjs ws://localhost:8787 10 25 50 100
//
// Results are indicative only when run against `wrangler dev` (a single
// local process); production Durable Objects run on Cloudflare's edge.

import WebSocket from "ws";

const host = process.argv[2] || "ws://localhost:8787";
const counts = process.argv.slice(3).map(Number).filter(Boolean);
const RUN_SECONDS = 15;
const SEND_HZ = 10;

const percentile = (sorted, p) =>
  sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];

async function runWave(n) {
  const latencies = [];
  let sent = 0;
  let received = 0;
  let errors = 0;

  const clients = await Promise.all(
    Array.from({ length: n }, (_, i) => {
      return new Promise((resolve) => {
        const ws = new WebSocket(`${host}/party/world?pid=load-${i}`);
        ws.on("open", () => resolve(ws));
        ws.on("message", (raw) => {
          try {
            const msg = JSON.parse(raw.toString());
            if (msg.type === "state" && typeof msg.sentAt === "number") {
              received += 1;
              latencies.push(Date.now() - msg.sentAt);
            }
          } catch {
            /* count only valid frames */
          }
        });
        ws.on("error", () => {
          errors += 1;
          resolve(null);
        });
      });
    })
  );
  const open = clients.filter(Boolean);

  const timers = open.map((ws, i) =>
    setInterval(() => {
      if (ws.readyState !== WebSocket.OPEN) return;
      sent += 1;
      ws.send(
        JSON.stringify({
          type: "state",
          sentAt: Date.now(),
          pos: [i, 65, 0],
          yaw: 0,
          action: "walk",
          character: { username: `load-${i}` },
        })
      );
    }, 1000 / SEND_HZ)
  );

  await new Promise((r) => setTimeout(r, RUN_SECONDS * 1000));
  timers.forEach(clearInterval);
  await new Promise((r) => setTimeout(r, 1000));
  open.forEach((ws) => ws.close());

  const expected = sent * (open.length - 1);
  latencies.sort((a, b) => a - b);
  return {
    clients: n,
    connected: open.length,
    errors,
    sent,
    expected,
    received,
    deliveryPct: expected ? ((received / expected) * 100).toFixed(1) : "n/a",
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    max: latencies[latencies.length - 1],
  };
}

for (const n of counts.length ? counts : [10, 25, 50]) {
  const result = await runWave(n);
  console.log(JSON.stringify(result));
  await new Promise((r) => setTimeout(r, 2000));
}
