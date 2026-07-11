# Relay load capacity

Methodology: `scripts/relay-load.mjs` opens N concurrent WebSocket clients
against one room, each broadcasting `state` at the client's real 10 Hz
cadence for 15 s. Every frame carries a send timestamp; every peer records
delivery latency. The relay fans each frame out to N-1 peers, so total
message throughput grows quadratically: N x (N-1) x 10/s.

Results against `wrangler dev` (Apple Silicon, single local process —
indicative; production Durable Objects run on Cloudflare's edge but share
the single-threaded-per-room execution model):

| clients | delivery | p50    | p95    | p99    | messages/s |
|--------:|---------:|-------:|-------:|-------:|-----------:|
|      10 |   100.0% |   2 ms |   5 ms |   7 ms |       ~900 |
|      25 |   100.0% |   7 ms |  14 ms |  20 ms |     ~6,000 |
|      50 |   100.0% |  19 ms |  27 ms |  30 ms |    ~24,500 |
|     100 |   100.0% |  22 ms |  46 ms |  90 ms |    ~99,000 |
|     200 |    67.8% | 2018 ms| 6695 ms| 8286 ms|   saturated |

Conclusion: one room comfortably handles ~100 concurrent visitors at full
10 Hz fidelity; the quadratic fan-out saturates the room between 100 and
200, where delivery collapses and latency exceeds seconds. Well above any
expected portfolio traffic.

If the ceiling is ever approached, the levers, cheapest first:

1. lower the broadcast rate as occupancy grows (10 Hz at <=25 players,
   scaling down to ~3 Hz at 100 — client interpolation already smooths this);
2. shard visitors across rooms (`/party/<room>` already routes by name; the
   client pins `"world"`);
3. interest management: relay only to peers within a world-distance radius,
   which caps per-player fan-out regardless of room size.
