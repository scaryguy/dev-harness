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
  "updated": "2026-10-10T20:10:20.000Z",
  "next": "Wait for WS-01 MERGED, then request user go for IMPLEMENT of revision 1.",
  "arc": "2026-10-10-soner-can--self-hosted-harness-safety",
  "sequence": 2,
  "gate": "RESEARCH"
}
---

# Pinned self-hosted arc governance

## Arc

[2026-10-10-soner-can--self-hosted-harness-safety](../arcs/2026-10-10-soner-can--self-hosted-harness-safety.md)

## Checkout

Fill after implementation approval: WS branch, parent arc branch, and worktree path
relative to the repository root (`../<repo-name>-worktrees/<ws-id>/`).

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

Current: `RESEARCH` · `awaiting-user-go`. Next action: wait for WS-01 MERGED, then request user go for IMPLEMENT of revision 1.
Add a modifier when relevant. RESEARCH Exited stays `—` until user authorizes IMPLEMENT.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-10-10 | — | PASS |

## Verification

- Source fixture: committed baseline A, then candidate skill/CLI B on WS
  branch and ARC merge; confirm governance still uses A through final approval.
- Reject missing/malformed base SHA, absent blobs, modified companion inputs,
  and pinned `init`; never silently use live files.
- User-project fixture: init/re-init and first ARC before committing scaffold
  still work. Run package/test suite and `check`; provide CLI UAT commands.

## User confirm checklist

- [ ] Source ARC reads and runs the pinned baseline through final approval.
- [ ] Invalid baselines/companion changes fail closed; pinned init is refused.
- [ ] Normal user-project first ARC is unaffected.
- [ ] User approves merge of the reviewed revision into the parent ARC.

## Approvals

- 2026-10-10 · ARC plan review PASS-with-notes; this is not per-WS RESEARCH
  review or implementation approval.
- 2026-10-10 · Independent per-WS RESEARCH review PASS on revision 1;
  implementation still requires user go after WS-01 MERGED.

## Progress ledger

Append actor/date for gate transitions, review outcomes, decisions, code/harness
commits, merge SHAs, and arc smoke-test results.
- 2026-10-10T20:08:56.365Z · Soner Can · Created.
- 2026-10-10 · Reviewed ARC plan saved as WS revision 1; no code authorized.
- 2026-10-10 · RESEARCH outcome PASS; awaiting-user-go and WS-01 MERGED.
  Exited remains open.
