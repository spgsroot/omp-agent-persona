# Performance work

## Measure first

1. Reproduce with a benchmark that calls the code the way production does (real payload sizes, real concurrency).
2. Profile to find where the time or memory goes. Do not guess.
3. Change one thing. Rerun the benchmark. Keep the change only if the number moves beyond noise.
4. Commit the benchmark with the fix. A human updates the baseline.

## Tools

| | benchmark (gate) | CPU profile | memory |
|---|---|---|---|
| Rust | gungraun (instruction counts, Valgrind, Linux), divan / criterion locally, CodSpeed | samply, cargo flamegraph, perf | DHAT (via gungraun), heaptrack |
| Python | pytest-benchmark, pytest-codspeed | py-spy (sampling, attaches to a live process), scalene | memray, tracemalloc |
| JS/TS | vitest bench, tinybench + `bench_compare.py`, CodSpeed | `node --cpu-prof`, 0x, clinic flame | `node --heap-prof`, heap snapshots |
| Serving | `vllm bench serve`, GuideLLM: TTFT / ITL / tokens per second at fixed concurrency | Nsight Systems, torch profiler | GPU memory via nvidia-smi / DCGM |

Deterministic metrics (instruction counts, allocations) gate well in CI. Wall-clock gating needs a dedicated
machine, pinned CPU frequency and repeated runs; budget 10% or more there.

## Rust patterns

- Clone only at ownership boundaries; pass `&str` / `&[T]`; `Cow` when ownership is conditional.
- Pre-size collections (`with_capacity`) on known lengths; `collect` once, not in a loop.
- Async: no blocking calls on the runtime (use `spawn_blocking`); keep futures small (`Box::pin` large state);
  bounded channels for back-pressure; never hold a `std::sync::Mutex` guard across `.await`.
- Serialization on hot paths: borrow from the input (`#[serde(borrow)]`), avoid `serde_json::Value` round trips.
- `#[inline]` and `unsafe` only with a benchmark that shows the gain, and a `// SAFETY:` comment.

## Python patterns

- I/O-bound serving: one event loop, async clients with connection pooling, `asyncio.gather` with a semaphore.
- No blocking calls in `async def` (ruff ASYNC catches common ones); run CPU work in a process pool or Rust (PyO3).
- Vectorize numeric work (NumPy / Polars) instead of Python loops; avoid pandas `apply` row by row.
- Pydantic: validate once at the boundary; inside, pass plain typed objects.
- Cache only with a bound and a key that includes everything the result depends on.

## JS/TS patterns

- Independent awaits run concurrently (`Promise.all` / bounded pool), never `await` in a loop over I/O.
- Streams for large payloads (LLM token streams, files); never buffer a whole response to transform it.
- Keep hot objects monomorphic (same shape, same field order); avoid `delete` on hot objects.
- Watch bundle size for anything shipped to browsers (`size-limit`).

## LLMOps specifics

- Gate cost and quality, not only speed: tokens per request and eval scores are numbers too. Add them as custom
  checks in `gates.toml` (`[check."llm.cost"]`, `[check."llm.eval"]`) with a committed baseline.
- Batch and cache on the provider side (prompt caching, batching APIs) before micro-optimising code.
- Measure p95 / p99, not the mean; TTFT and inter-token latency separately.
