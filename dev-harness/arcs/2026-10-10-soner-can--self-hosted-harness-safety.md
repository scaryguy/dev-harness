---
{
  "id": "2026-10-10-soner-can--self-hosted-harness-safety",
  "kind": "arc",
  "title": "Self-hosted harness safety",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 1,
  "created": "2026-10-10T20:08:46.209Z",
  "updated": "2026-10-10T20:56:18.000Z",
  "next": "Present the ARC confirm checklist and request separate approval to integrate into main.",
  "status": "in-progress",
  "branch": "arc/2026-10-10-soner-can--self-hosted-harness-safety",
  "integrationBranch": "main",
  "baseSha": "94cb347b640dd301ee1718d79e1a96be3a496a8f"
}
---

# Self-hosted harness safety

## Outcome and scope

Prevent this repository's harness from overwriting itself or letting changed
workflow code govern its own approval. WS-01 protects `init`; WS-02 pins
self-hosted ARC governance to this ARC's `baseSha`. WS-02 starts only after
WS-01 is MERGED into the ARC. Normal user-project `init → start` stays intact.

In: source-checkout detection, early `init` refusal, source-ARC pinning,
bootstrap instructions, and focused fixture/package tests. Out: a global pin
for user projects, new tracked runtime copies, packaged model changes,
automatic commits/merges/pushes, and retroactive fixes to older packages.

## Decisions

- 2026-10-10 · User: source-repo-only pinning; do not require a scaffold commit
  before a normal user's first ARC.
- 2026-10-10 · User: use GPT-6 Sol High for this effort's agents; leave the
  packaged Grok default unchanged.
- 2026-10-10 · Reviewer: plan PASS-with-notes. The pin is an operational rule,
  not tamper-proof enforcement; mutable entrypoints and older published packages
  cannot be made safe retroactively. Validate the full SHA and baseline inputs;
  forbid `init` as a pinned source-ARC governance command.
- This first self-hosted ARC uses its committed starting rules by explicit
  session bootstrap because those rules do not yet describe pinning. No
  implementation scope was locked before user approval of this reviewed draft.
- 2026-10-10 · User: approved revision 1 scope and WS-01 IMPLEMENT. This did
  not approve WS-02 IMPLEMENT, WS merge, ARC integration, commit, or push.
- 2026-10-10 · User: approved WS-02 revision 1 IMPLEMENT after WS-01 merged.
  No commit, merge, ARC integration, or push approval was given.
- 2026-10-10 · User: accepted reviewed WS-02 revision 1 and approved its
  code/ARC/WS record commits, WS→ARC merge, and ARC smoke test. No ARC→main
  merge or push was authorized.

## Branch and rollup

Branch: `arc/2026-10-10-soner-can--self-hosted-harness-safety` from `main` at
`94cb347b640dd301ee1718d79e1a96be3a496a8f`. Final merge SHA: pending.
Keep this rollup aligned with WS records:

| WS | Gate | Depends on | WS branch | Merge SHA |
|----|------|------------|-----------|-----------|
| [WS-01](../workstreams/WS-soner-can-01--source-init-protection.md) | MERGED | — | `ws/WS-soner-can-01--source-init-protection` | `e5fe224da80201c8ecd54051579e6704b9c936fb` |
| [WS-02](../workstreams/WS-soner-can-02--pinned-self-hosted-arc-governance.md) | MERGED | WS-01 MERGED | `ws/WS-soner-can-02--pinned-self-hosted-arc-governance` | `88438f996bfe2286f34b70faf04b83513b22d6a5` |

## Integration checklist

- [x] Workstreams completed or explicitly deferred.
- [x] Arc smoke tests after each WS merge and final integration checks passed.
- [x] External-package init cannot overwrite the source checkout; normal
      user-project init/re-init and first ARC still work.
- [ ] Source ARC remains governed by its starting rules through final approval;
      missing baseline or changed companion inputs fail closed.
- [ ] User approved integration of the reviewed revision.

## Progress ledger

Record dated gate changes, reviews, integration-branch syncs, and Git commit/merge SHAs.
- 2026-10-10T20:08:46.209Z · Soner Can · Created.
- 2026-10-10 · Planner drafted two dependent WSes; reviewer PASS-with-notes.
- 2026-10-10 · User chose source-only pinning; draft revision 1 saved for
  implementation approval. No code, commit, merge, or push authorized yet.
- 2026-10-10 · Independent per-WS RESEARCH review: WS-01 PASS, WS-02 PASS.
  Both remain RESEARCH pending user implementation approval; WS-02 also waits
  for WS-01 MERGED.
- 2026-10-10 · User approved revision 1 scope and WS-01 IMPLEMENT. WS-01
  branch/worktree created from ARC @ 94cb347; WS-02 stays RESEARCH.
- 2026-10-10 · WS-01 owner reported implementation ready: two CLI/test files,
  15 tests PASS, structural check PASS, diff check PASS; independent code review
  opened. No code committed or merged.
- 2026-10-10 · Independent WS-01 REVIEW outcome CHANGES-REQUESTED: derive
  source checkout identity from committed Git state so temporary working-tree
  manifest edits cannot bypass the guard. Returned to IMPLEMENT; no merge.
- 2026-10-10 · WS-01 owner revised guard to use committed HEAD metadata and
  added dirty-checkout regressions. Owner-reported checks PASS; independent
  re-review opened. No commit or merge.
- 2026-10-10 · Independent WS-01 REVIEW PASS, 15 tests PASS. USER CONFIRM
  entered; code remains unstaged in its worktree for user CLI UAT. No commit
  or merge authorized.
- 2026-10-10 · User-requested delegated CLI UAT PASS: external-package init
  refused a disposable source clone without file changes; ordinary init and
  re-init succeeded in a disposable project. WS-01 awaits explicit commit and
  WS→ARC merge approval.
- 2026-10-10 · User explicitly approved committing reviewed WS-01 code and
  ARC/WS records, merging WS-01 into this ARC, and running ARC smoke tests.
  No ARC→main merge or push was authorized.
- 2026-10-10 · Approved ARC/WS records committed as `f9123e4`; WS-01 code
  committed as `726e962` and merged to ARC as
  `e5fe224da80201c8ecd54051579e6704b9c936fb`. ARC `npm test` passed
  15/15; baseline CLI `check` reported 3 structurally valid records.
  Companion config, templates, and adapters still match the ARC base SHA.
  WS-02 remains RESEARCH pending user implementation approval.
- 2026-10-10 · User approved WS-02 revision 1 IMPLEMENT. WS branch/worktree
  created from ARC @ `b066e00`; RESEARCH exited and IMPLEMENT entered.
- 2026-10-10 · WS-02 owner reported implementation ready in four unstaged
  files; `npm test` 24/24 PASS, original-baseline ARC `check` PASS,
  `git diff --check` PASS. IMPLEMENT exited; independent REVIEW opened.
- 2026-10-10 · Independent WS-02 REVIEW CHANGES-REQUESTED: documented
  future-ARC startup invokes the mutable candidate `pinned` dispatcher.
  Disposable reproduction bypassed baseline governance. Returned to IMPLEMENT
  for baseline-first dispatch and regression; no commit or merge.
- 2026-10-10 · Owner revised documented bootstrap and added a regression
  that tampers with candidate `pinned()` after WS→ARC merge. Owner checks:
  `npm test` 25/25 PASS, original-baseline ARC `check` PASS, diff check PASS.
  IMPLEMENT exited; independent re-review opened.
- 2026-10-10 · Independent WS-02 re-review PASS; prior mutable-dispatcher
  finding resolved. Reviewer ran 25/25 tests, diff check, and manual original-
  baseline status/check with companion verification; all PASS. REVIEW exited;
  USER CONFIRM entered. Four changes remain unstaged in WS worktree. No commit,
  merge, ARC integration, or push authorized.
- 2026-10-10 · User confirmed reviewed WS-02 revision 1 after the CLI test
  handoff and authorized commit, WS→ARC merge, and ARC smoke tests only.
- 2026-10-10 · WS-02 acceptance records committed as `911f806`; code committed
  as `6313d9c` and merged to ARC as
  `88438f996bfe2286f34b70faf04b83513b22d6a5`. Integrated ARC `npm test`
  passed 25/25; extracted original-baseline CLI `check` reported 3 valid
  records; baseline SHA is an ancestor commit and companion files match it.
  Both workstreams are MERGED. No ARC→main merge or push.
