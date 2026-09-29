# {{title}}

## Outcome and scope

Record the problem, goal, boundary, in/out scope, WS split, dependencies, and
cross-cutting decisions. Add a today → target behavior table when it clarifies scope.

## Decisions

Record locked decisions, explicit deferrals, and scope changes with actor/date.

## Branch and rollup

Branch: `arc/{{id}}`. Record integration branch/base SHA and final merge SHA.
Keep this rollup aligned with WS records:

| WS | Gate | Depends on | WS branch | Merge SHA |
|----|------|------------|-----------|-----------|

## Integration checklist

- [ ] Workstreams completed or explicitly deferred.
- [ ] Arc smoke tests after each WS merge and final integration checks passed.
- [ ] User approved integration of the reviewed revision.

## Progress ledger

Record dated gate changes, reviews, integration-branch syncs, and Git commit/merge SHAs.
