# Ketchup Plan: Fix Pipeline Diagram Wrong Status for Retried Commands

### Bottle: RetryStatusFix

## TODO

## DONE

- [x] Burst 1: Fix `addStatusToCommandNode` to use `nodeStatus.status` when no extractor exists and pendingCount is 0 [depends: none] (cf3f1034)
- [x] Burst 2: Add `autoRegisterItemKeyExtractor` and call from `registerCommandHandlers` [depends: Burst 1] (0bd4e2a7)
- [x] Burst 3: Covered by Bursts 1+2 tests [depends: Burst 2]
- [x] Burst 4: Test manual extractor takes precedence over auto-derived [depends: Burst 2]
- [x] Burst 5: Add `batchId` field to `ItemStatusDocument` and `ItemStatusChangedEvent`, preserve via `evolve` fallback [depends: none] (752e1329)
- [x] Burst 6: Scope `computeCommandStats` to latest batch — filter items by highest `batchId` with backward compat fallback [depends: Burst 5] (a34a7e6a)
- [x] Burst 7+8: Wire sync `resolveBatchId` with pending counter, update test expectations for batch-scoped counts [depends: Burst 6] (7e33cf98)
