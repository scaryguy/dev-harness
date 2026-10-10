---
{
  "id": "WS-soner-can-02--pinned-self-hosted-arc-governance",
  "kind": "workstream",
  "title": "Pinned self-hosted arc governance",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 1,
  "created": "2026-10-10T20:08:56.365Z",
  "updated": "2026-10-10T20:56:18.000Z",
  "next": "Integrated into ARC; await separate ARC integration approval.",
  "arc": "2026-10-10-soner-can--self-hosted-harness-safety",
  "sequence": 2,
  "gate": "MERGED"
}
---

# Pinned self-hosted arc governance

## Arc

[2026-10-10-soner-can--self-hosted-harness-safety](../arcs/2026-10-10-soner-can--self-hosted-harness-safety.md)

## Checkout

WS branch: `ws/WS-soner-can-02--pinned-self-hosted-arc-governance` from
`arc/2026-10-10-soner-can--self-hosted-harness-safety` @ `b066e00`.
External worktree:
`../dev-harness-worktrees/WS-soner-can-02--pinned-self-hosted-arc-governance/`.
The ARC checkout owns these records; copies in the WS worktree are not authoritative.
Code commit: `6313d9c`. ARC merge:
`88438f996bfe2286f34b70faf04b83513b22d6a5`. The WS branch and worktree
remain in place pending separate cleanup approval.

## Scope and approach

After WS-01 merges into this ARC, changed CLI/skill files could govern their
own final approval. For this package source repo only, use the ARC's immutable
`baseSha` from creation until final ARC approval. Validate it as a full commit
SHA containing the governing skill and CLI; read that skill from Git before
live instructions. Run governance commands from an ephemeral extraction of the
baseline runtime outside the repo, with cwd at the ARC checkout. Verify live
companion config/templates/adapters against baseline before commands that read
them; fail closed on missing or changed inputs, with no live fallback. Do not
run `init` as a pinned ARC governance command. Candidate `init` is tested only
in disposable repositories. Document bootstrap in source AGENTS/skill. This
first ARC follows its committed rules by explicit manual bootstrap.

Depends on WS-01 MERGED. Likely files: source entrypoint, skill, CLI, tests.
Normal installed user repos retain `init → start` with no first-commit rule.

## Handoff

Owner: GPT-6 Sol High after WS-01 MERGED, per-WS research review, and user go.
Do not change packaged model defaults, user-project ARC creation, or state
layout. Do not claim tamper-proof enforcement from mutable repo instructions.

## Decisions

- Locked · User, 2026-10-10: pin only source-repo ARCs; keep normal user
  onboarding without a first scaffold commit.
- Locked · Reviewer, 2026-10-10: full SHA and baseline blob checks, no live
  fallback, baseline companion verification, and no pinned `init`.
- Known limit: AGENTS/bootstrap is mutable, so this is operational pinning,
  not a tamper-proof security boundary. Older npx builds cannot be fixed
  retroactively. No open product decision remains.

## Gate

Current: `MERGED`. User accepted reviewed revision 1; ARC smoke checks passed.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-10-10 | 2026-10-10 | PASS |
| IMPLEMENT | 2026-10-10 | 2026-10-10 | Owner checks PASS |
| REVIEW | 2026-10-10 | 2026-10-10 | CHANGES-REQUESTED |
| IMPLEMENT | 2026-10-10 | 2026-10-10 | Owner checks PASS |
| REVIEW | 2026-10-10 | 2026-10-10 | PASS |
| USER CONFIRM | 2026-10-10 | 2026-10-10 | User approved |
| MERGED | 2026-10-10 | — | ARC smoke PASS |

## Verification

- Source fixture: committed baseline A, then candidate skill/CLI B on WS
  branch and ARC merge; confirm governance still uses A through final approval.
- Reject missing/malformed base SHA, absent blobs, modified companion inputs,
  and pinned `init`; never silently use live files.
- User-project fixture: init/re-init and first ARC before committing scaffold
  still work. Run package/test suite and `check`; provide CLI UAT commands.
- Owner-reported, 2026-10-10: `npm test` 24/24 PASS (nine new pinning tests),
  original-baseline ARC `check` PASS with 3 valid records, and
  `git diff --check` PASS. Four code/instruction files remain unstaged for
  independent review. This ARC was not governed by its candidate CLI.
- Independent reviewer, 2026-10-10: CHANGES-REQUESTED. A disposable
  future-ARC fixture demonstrated that a candidate edit to `pinned()` can
  make the documented live command print candidate governance, while an
  independently extracted baseline dispatcher returns valid baseline check.
  Add a dispatcher-tampering regression and require baseline-first startup.
- Owner-reported revision, 2026-10-10: independently validated baseline CLI
  extraction now precedes source-ARC `pinned` commands; new regression tampers
  with candidate dispatcher. `npm test` 25/25 PASS, original-baseline ARC
  `check` PASS with 3 records, `git diff --check` PASS. Re-review pending.
- Independent reviewer, 2026-10-10: PASS. Verified the documented bootstrap
  executes the committed dispatcher even when candidate `pinned()` is replaced
  after a WS→ARC merge. `npm test` 25/25 PASS, diff check PASS, and current
  ARC's manually extracted original-baseline status/check PASS with exact
  companion file-set/bytes. No app server is relevant; for user UAT run
  `npm test` from
  `/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-02--pinned-self-hosted-arc-governance`.
  The focused test is `node --test --test-name-pattern='documented independent bootstrap' dev-harness/.harness/cli.test.mjs`.
  Inspect the unstaged revision with `git diff`; do not use candidate
  `pinned` to govern the real ARC.
- After ARC merge, 2026-10-10: integrated `npm test` 25/25 PASS; original
  baseline CLI `check` reported 3 valid records; companion inputs still match
  the ARC base SHA. No candidate dispatcher governed this ARC.

## User confirm checklist

- [x] Source ARC reads and runs the pinned baseline through final approval.
- [x] Invalid baselines/companion changes fail closed; pinned init is refused.
- [x] Normal user-project first ARC is unaffected.
- [x] User approves merge of the reviewed revision into the parent ARC.

## Approvals

- 2026-10-10 · ARC plan review PASS-with-notes; this is not per-WS RESEARCH
  review or implementation approval.
- 2026-10-10 · Independent per-WS RESEARCH review PASS on revision 1;
  implementation still requires user go after WS-01 MERGED.
- 2026-10-10 · User approved revision 1 IMPLEMENT after WS-01 merged;
  no commit, merge, ARC integration, or push approval was given.
- 2026-10-10 · Independent code re-review PASS on revision 1; user accepted
  the CLI test handoff and approved code/ARC/WS record commits, WS→ARC merge,
  and ARC smoke tests. No ARC→main merge or push approval.

## Progress ledger

Append actor/date for gate transitions, review outcomes, decisions, code/harness
commits, merge SHAs, and arc smoke-test results.
- 2026-10-10T20:08:56.365Z · Soner Can · Created.
- 2026-10-10 · Reviewed ARC plan saved as WS revision 1; no code authorized.
- 2026-10-10 · RESEARCH outcome PASS; awaiting-user-go and WS-01 MERGED.
  Exited remains open.
- 2026-10-10 · Dependency satisfied by WS-01 ARC merge
  `e5fe224da80201c8ecd54051579e6704b9c936fb`; RESEARCH remains open
  pending user approval to implement revision 1.
- 2026-10-10 · User go: RESEARCH exited and IMPLEMENT entered. Branch
  `ws/WS-soner-can-02--pinned-self-hosted-arc-governance` created from ARC
  @ `b066e00`; external worktree prepared. No implementation result yet.
- 2026-10-10 · Owner reported revision 1 ready: four unstaged files,
  `npm test` 24/24 PASS, original-baseline ARC check PASS, diff check PASS.
  IMPLEMENT exited; independent REVIEW entered. No commit or merge.
- 2026-10-10 · Independent REVIEW CHANGES-REQUESTED: live candidate
  `pinned()` can bypass baseline rules even when following documented
  startup. REVIEW exited; returned to IMPLEMENT for baseline-first dispatch
  and regression. No commit or merge.
- 2026-10-10 · Owner revised bootstrap instructions and added tampered
  candidate dispatcher regression. IMPLEMENT exited; REVIEW re-entered.
  Owner checks PASS (25/25 tests, original-baseline ARC check, diff check).
  No commit or merge.
- 2026-10-10 · Independent re-review PASS; prior finding resolved. REVIEW
  exited; USER CONFIRM entered. Four files remain unstaged for user CLI UAT.
  No commit or merge authorization yet.
- 2026-10-10 · User confirmed reviewed revision 1 and authorized WS-02
  commit/merge to ARC plus ARC smoke test. USER CONFIRM exits at MERGED.
- 2026-10-10 · ARC/WS acceptance record commit `911f806`; WS code commit
  `6313d9c`; WS→ARC merge `88438f996bfe2286f34b70faf04b83513b22d6a5`.
  USER CONFIRM exited; MERGED entered. Integrated ARC `npm test` 25/25 PASS,
  baseline CLI `check` 3 valid records. No ARC→main merge or push.
