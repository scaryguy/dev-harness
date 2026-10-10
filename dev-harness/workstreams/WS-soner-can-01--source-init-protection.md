---
{
  "id": "WS-soner-can-01--source-init-protection",
  "kind": "workstream",
  "title": "Source init protection",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 1,
  "created": "2026-10-10T20:08:51.176Z",
  "updated": "2026-10-10T20:34:33.000Z",
  "next": "Commit reviewed revision 1, merge WS into ARC, and smoke-test ARC.",
  "arc": "2026-10-10-soner-can--self-hosted-harness-safety",
  "sequence": 1,
  "gate": "USER CONFIRM"
}
---

# Source init protection

## Arc

[2026-10-10-soner-can--self-hosted-harness-safety](../arcs/2026-10-10-soner-can--self-hosted-harness-safety.md)

## Checkout

WS branch: `ws/WS-soner-can-01--source-init-protection` from
`arc/2026-10-10-soner-can--self-hosted-harness-safety` @ `94cb347`.
External worktree: `../dev-harness-worktrees/WS-soner-can-01--source-init-protection/`.
The ARC checkout owns these records; copies in the WS worktree are not authoritative.

## Scope and approach

An external packaged CLI currently refreshes built-in files when `init` targets
this package's source checkout. Add a source-checkout preflight before the first
mkdir, rename, copy, AGENTS edit, or link write. Identify source by package
identity/bin and tracked runtime paths; reject when packaged source differs
from that checkout. Same-checkout local invocation and ordinary user-project
init/re-init keep their existing behavior. Do not change record creation or
package contents. Likely files: `dev-harness/.harness/cli.mjs` and its tests.

## Handoff

Owner: GPT-6 Sol High. User approved revision 1 IMPLEMENT on 2026-10-10.
Do not touch normal installation state, user ARC/WS records, model
defaults, or the playground project.

## Decisions

- Locked · User, 2026-10-10: protect the source repo without changing normal
  user-project onboarding.
- Locked · Reviewer, 2026-10-10: guard runs before every write; old packages
  already distributed cannot receive this guard retroactively.
- Open: none. Detection details are implementation choices if the acceptance
  tests remain satisfied.

## Gate

Current: `USER CONFIRM`. Next action: commit approved revision 1, merge WS into
the ARC, and run its smoke tests; delegated CLI UAT passed.
Add a modifier when relevant. RESEARCH Exited stays `—` until user authorizes IMPLEMENT.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-10-10 | 2026-10-10 | PASS |
| IMPLEMENT | 2026-10-10 | 2026-10-10 | — |
| REVIEW | 2026-10-10 | 2026-10-10 | CHANGES-REQUESTED |
| IMPLEMENT | 2026-10-10 | 2026-10-10 | — |
| REVIEW | 2026-10-10 | 2026-10-10 | PASS |
| USER CONFIRM | 2026-10-10 | — | — |

## Verification

- Pack an external build, run `init` against a disposable source clone, and
  verify refusal leaves the checkout byte-for-byte unchanged.
- Verify normal tarball init/re-init preserves configuration, knowledge, ARC/WS
  records, and unrelated entrypoint instructions.
- Verify same-source local init remains safe; run the full test suite and
  `check`. No preview server is relevant; provide exact fixture commands for UAT.
- Owner-reported, 2026-10-10: `npm test` 15/15 PASS;
  `node dev-harness/.harness/cli.mjs check` PASS; `git diff --check` PASS.
  Independent review is pending. Worktree:
  `../dev-harness-worktrees/WS-soner-can-01--source-init-protection/`.
- Owner-reported revision after review finding, 2026-10-10: same three checks
  PASS; regressions cover edited/malformed working package metadata and staged
  deletion without bypassing the guard. Independent re-review pending.
- Independent reviewer, 2026-10-10: PASS; `npm test` 15/15 PASS, structural
  `check` PASS, `git diff --check` PASS. No server is applicable to this CLI
  change. For user UAT, from
  `/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-01--source-init-protection`
  run `npm test`; the package-install test exercises external source refusal,
  dirty-source cases, normal user init/re-init, and same-source init. Review
  the unstaged revision with `git diff`. Do not run external-package `init` on
  the actual source repo.
- User-requested delegated UAT, 2026-10-10: an offline tarball of the unstaged
  WS code matched the candidate CLI hash. External `init` in a disposable
  source clone exited 1 with the expected refusal; Git status stayed clean
  and the non-Git file digest was unchanged. Normal `init` and re-init in a
  disposable project both exited 0; only `.harness/`, `arcs/`, and
  `workstreams/` appeared under `dev-harness/`, Cursor links resolved, and
  config/knowledge markers survived re-init. No real source checkout was
  targeted by the external package.

## User confirm checklist

- [x] External-package init refuses the source checkout before mutation.
- [x] Normal user init/re-init and same-source local init still work.
- [x] User approves merge of the reviewed revision into the parent ARC.

## Approvals

- 2026-10-10 · ARC plan review PASS-with-notes; this is not per-WS RESEARCH
  review or implementation approval.
- 2026-10-10 · Independent per-WS RESEARCH review PASS on revision 1;
  implementation still requires user go.
- 2026-10-10 · User approved revision 1 IMPLEMENT only; no commit or merge
  authorization.
- 2026-10-10 · Independent code REVIEW PASS on revision 1; USER CONFIRM
  pending user testing or explicit waiver and separate merge approval.
- 2026-10-10 · At user's request, GPT-6 Sol High subagents ran both CLI UAT
  trials in disposable repositories; PASS. This is not merge approval.
- 2026-10-10 · User approved committing reviewed revision 1 and ARC/WS
  records, WS→ARC merge, and ARC smoke tests. No ARC→main merge or push.

## Progress ledger

Append actor/date for gate transitions, review outcomes, decisions, code/harness
commits, merge SHAs, and arc smoke-test results.
- 2026-10-10T20:08:51.176Z · Soner Can · Created.
- 2026-10-10 · Reviewed ARC plan saved as WS revision 1; no code authorized.
- 2026-10-10 · RESEARCH outcome PASS; awaiting-user-go. Exited remains open.
- 2026-10-10 · User go; RESEARCH exited and IMPLEMENT entered. Branch
  `ws/WS-soner-can-01--source-init-protection` created from ARC @ 94cb347;
  external worktree prepared. No implementation result yet.
- 2026-10-10 · Owner implementation ready in two unstaged files. IMPLEMENT
  exited; REVIEW entered. Owner-reported tests 15/15 PASS, structural check
  PASS, diff check PASS; independent reviewer assigned. No commit or merge.
- 2026-10-10 · Independent REVIEW CHANGES-REQUESTED: live or staged edits to
  source `package.json`/tracked runtime paths can evade the guard. Returned
  to IMPLEMENT for HEAD-based identity detection and regression tests.
- 2026-10-10 · Owner revised guard and regression coverage; IMPLEMENT exited,
  REVIEW re-entered. No commit or merge.
- 2026-10-10 · Independent REVIEW PASS; REVIEW exited, USER CONFIRM entered.
  Unstaged changes remain in WS worktree for user UAT. No commit or merge.
- 2026-10-10 · User-requested delegated UAT PASS on source refusal and normal
  install/re-init. Awaiting explicit commit and WS→ARC merge approval.
- 2026-10-10 · User confirmed acceptance checklist and authorized WS-01
  commit/merge to ARC plus ARC smoke test. USER CONFIRM exits at MERGED.
