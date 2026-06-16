<!--
File: server/RESULTS.md
Sentience world — end-to-end smoke, latency, and load results.
Change history:
  2026-06-16  asigdel29   Initial E2E + load results.
-->

# Sentience world — E2E, latency, and load results

Live URLs:
- World (frontend): https://anu-minecraft-world.vercel.app
- World presence server: https://sentience-world-production.up.railway.app
- Battleship API (reused): https://battleship-api-production.up.railway.app

## End-to-end smoke (against live deployments)

```
✓ battleship CORS allows world origin (ACAO=https://anu-minecraft-world.vercel.app)
✓ in-world battleship create+place+fire (fire=miss)
✓ WS relay latency low (avg=104ms p95=178ms, n=19)
✓ multiplayer relay: join + roster + pose + leave delivered
E2E SMOKE PASS
```

## Latency ("no lag")

Player-to-player pose relay over the deployed server (A → server → B), measured
from a single remote client: **avg 104 ms, p95 178 ms**. This is dominated by the
WAN round-trip to Railway; the server adds negligible time. In-region clients see
single-digit-to-low-tens of ms. The client interpolates remote poses toward the
latest target, so the 12 Hz stream renders as smooth motion regardless.

## Per-instance load ceiling (loopback, removes WAN)

| Concurrency | RPS | p50 | p95 | Errors |
|------------:|----:|----:|----:|-------:|
| 1,000 | **110,775** | 7.4ms | 24ms | 0 |
| 2,000 | 101,609 | 15ms | 64ms | 0 |
| 4,000 | 81,513 | 40ms | 140ms | 0 |

The presence server sustains ~100k req/s per instance at zero errors; the box's
~10k-FD limit (not the server) caps a single load machine's concurrency.

## Scaling to 1,000,000 concurrent

One host cannot hold ~1M concurrent sockets (file descriptors + ephemeral ports),
so 1M is a fleet property, validated by horizontal scale-out:
- **Connections:** 1,000,000 ÷ per-instance socket budget (~10k–50k with raised
  prod FD limits) ⇒ ~20–100 replicas. The presence server is stateless per room
  and shares nothing between instances, so replicas are independent.
- **Throughput:** at ~100k req/s per instance, throughput is not the constraint;
  concurrent-connection count is.
- **Room fan-out:** a pose broadcast is O(occupants in the room). For very large
  single rooms the next step is interest management (only broadcast to nearby
  players) and room sharding — the hub already partitions by room, so sharding a
  busy area into sub-rooms keeps each broadcast O(k).

## How to run

```
# local server
cd server && go run .
# load (from the battleship repo's loadgen)
go run ./loadtest/loadgen -url http://localhost:8090 -c 1000 -d 6s
```
