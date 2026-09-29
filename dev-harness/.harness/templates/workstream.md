# {{title}}

## Arc

[{{arc}}](../arcs/{{arc}}.md)

## Checkout

Fill after implementation approval: WS branch, parent arc branch, and worktree path
relative to the repository root (`../<repo-name>-worktrees/<ws-id>/`).

## Scope and approach

Record problem, in/out scope, solution, dependencies, likely files, and files not to touch.

## Handoff

Record implementation owner, blockers, likely files, and explicit do-not-touch boundaries.

## Decisions

Separate repository conventions, user decisions, and explicitly accepted defaults;
record the source of each consequential choice. Keep locked and open choices separate.

## Gate

Current: `RESEARCH`. Next action: agree scope, decisions, and verification.
Add a modifier when relevant. RESEARCH Exited stays `—` until user authorizes IMPLEMENT.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | {{date}} | — | — |

## Verification

Record checks and results, plus the local run command, worktree path, and user test
checklist with expected results. A preview offer is not user approval.

## User confirm checklist

List testable acceptance outcomes and require explicit approval to merge this WS
into its parent arc. Check items only after the user confirms them.

## Approvals

Record the actor, date, revision, and exact scope of each approval and review.

## Progress ledger

Append actor/date for gate transitions, review outcomes, decisions, code/harness
commits, merge SHAs, and arc smoke-test results.
