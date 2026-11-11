---
{
  "id": "WS-soner-can-05--claude-code-platform-support",
  "kind": "workstream",
  "title": "Claude Code platform support",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 1,
  "created": "2026-10-14T04:41:32.529Z",
  "updated": "2026-11-11T07:33:00.000Z",
  "next": "Commit accepted revision 1, merge WS-05 into the ARC, and run the integrated smoke check.",
  "arc": "2026-10-13-soner-can--modular-coding-agent-support",
  "sequence": 5,
  "gate": "USER CONFIRM",
  "dependencies": [
    "WS-soner-can-04--codex-platform-support"
  ],
  "agentModels": {
    "orchestrator": "gpt-6.1-sol[effort=high]",
    "owner": "gpt-6.1-sol[effort=low]",
    "reviewer": "gpt-6.1-sol[effort=high]"
  },
  "platformScope": {
    "coexistence": true,
    "installation": "explicit-additive",
    "codexSurfaces": [
      "cli"
    ]
  },
  "codexRoleDefaults": {
    "orchestrator": {
      "model": "gpt-6.1-sol",
      "effort": "high"
    },
    "planner": {
      "model": "gpt-6.1-sol",
      "effort": "high"
    },
    "reviewer": {
      "model": "gpt-6.1-sol",
      "effort": "high"
    },
    "owner": {
      "model": "gpt-6.1-sol",
      "effort": "low"
    }
  },
  "dependencyVerification": {
    "workstream": "WS-soner-can-04--codex-platform-support",
    "mergeCommit": "140affaa3e6d3f3bb58af924df814e6142a39a1d",
    "date": "2026-10-14T09:35:00.000Z",
    "smoke": "40/40 PASS"
  },
  "researchState": "approved",
  "researchReview": {
    "revision": 1,
    "outcome": "PASS-with-notes",
    "reviewer": "grok-4.7[effort=high]",
    "date": "2026-10-14T09:52:00.000Z",
    "notes": "Family-specific marker predicates. Claude agents require a leading --- and the managed comment on the first body line. Project CLAUDE.md bytes are exactly @AGENTS.md plus LF. Path is CLAUDE.md, not ./CLAUDE.md."
  },
  "implementationApproval": {
    "revision": 1,
    "actor": "User",
    "date": "2026-10-14T09:25:00.000Z",
    "scope": "WS-05 IMPLEMENT only, after contract review PASS",
    "evidence": "merge and continue with 05, run contract review, implement and have it ready till I wake up"
  },
  "implementationState": "reviewed",
  "implementationEvidence": {
    "revision": 1,
    "reportedBy": "grok-4.7[effort=high]",
    "date": "2026-10-14T10:14:00.000Z",
    "worktree": "/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-05--claude-code-platform-support",
    "startingSha": "9cf4128ec697e903be34b1a82b63831224848de2",
    "npmTest": "46/46 PASS; original 40 retained",
    "diffCheck": "PASS",
    "frozenCompanions": "empty diff and no untracked files",
    "index": "unchanged",
    "cliMjs": "unchanged; existing assertReady gate reused",
    "liveClaude": "not run"
  },
  "codeReview": {
    "revision": 1,
    "outcome": "PASS-with-notes",
    "reviewer": "grok-4.7[effort=high]",
    "date": "2026-10-14T10:23:00.000Z",
    "worktree": "/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-05--claude-code-platform-support",
    "startingSha": "9cf4128ec697e903be34b1a82b63831224848de2",
    "limits": "Reviewer read the uncommitted tree. Shell was blocked, so npm test and the frozen diff were not re-run by the reviewer. Orchestrator re-ran npm test 46/46 PASS, git diff --check PASS, and an empty frozen diff at 2026-10-14T10:28:00.000Z. No live Claude UAT."
  },
  "userTesting": {
    "revision": 1,
    "state": "offered",
    "worktree": "/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-05--claude-code-platform-support",
    "command": "npm test",
    "expected": "46 tests PASS",
    "nativeRuntime": "not verified",
    "server": "not applicable; CLI/package fixtures",
    "acceptedDate": "2026-11-11T07:33:00.000Z"
  },
  "acceptance": {
    "revision": 1,
    "actor": "User",
    "date": "2026-11-11T07:33:00.000Z",
    "evidence": "confirm and close the arc and merge to main",
    "scope": "Accept reviewed revision 1 fixture evidence and authorize code/record commits, WS-to-ARC merge, ARC smoke checks, ARC close, and merge into main. Live Claude Code UAT was not run. No push or worktree cleanup."
  },
  "checkout": {
    "branch": "ws/WS-soner-can-05--claude-code-platform-support",
    "parentBranch": "arc/2026-10-13-soner-can--modular-coding-agent-support",
    "parentSha": "9cf4128ec697e903be34b1a82b63831224848de2",
    "worktree": "../dev-harness-worktrees/WS-soner-can-05--claude-code-platform-support/"
  },
  "cursorSessionLaunch": {
    "platform": "cursor",
    "orchestrator": "grok-4.7[effort=high]",
    "planner": "grok-4.7[effort=high]",
    "reviewer": "grok-4.7[effort=high]",
    "owner": "grok-4.7[effort=high]",
    "source": "harness models.orchestrator and models.subagents"
  }
}
---

# Claude Code platform support

## Arc

[Modular coding agent support](../arcs/2026-10-13-soner-can--modular-coding-agent-support.md)

## Checkout

WS branch: `ws/WS-soner-can-05--claude-code-platform-support`.
Parent: `arc/2026-10-13-soner-can--modular-coding-agent-support` at
`9cf4128ec697e903be34b1a82b63831224848de2`.
External worktree: `../dev-harness-worktrees/WS-soner-can-05--claude-code-platform-support/`.
Resolved: `/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-05--claude-code-platform-support`.
Created after RESEARCH PASS-with-notes and user IMPLEMENT approval.

The ARC checkout owns authoritative records under
`/Users/scaryguy/Projects/dev-harness/dev-harness/`; owner-worktree record copies
are not authoritative.

## Scope and approach

Add Claude Code through the adapter contract validated by Cursor and Codex.
Implementation begins only after Codex is MERGED and verified in this ARC,
as requested by the user. Reuse shared records, gates, approval policy, worktree
rules, and role responsibilities.

Likely candidate files: a new adapters/claude-code/ subtree, adapter registration,
focused CLI/package tests, and Claude Code installation/start/resume documentation.
Do not alter the completed Codex scope or introduce another workflow policy copy.

Dependencies: [WS-soner-can-04--codex-platform-support](./WS-soner-can-04--codex-platform-support.md) MERGED.

## Handoff

Requested development-agent assignments, user decision on 2026-10-13:
- Orchestrator: GPT-6.1 Sol, high effort.
- Implementation owner: GPT-6.1 Sol, low effort.
- Independent reviewer: GPT-6.1 Sol, high effort.

These are ARC/session overrides, not changes to packaged platform defaults.
The orchestrator's model/effort is user-selected; runtime identity is not claimed
as independently verified. Owner and reviewer launches must request the exact
model and effort. Do not substitute silently if unavailable.

Before launching the low-effort owner, the orchestrator must supply the reviewed
revision and locked decisions, a file/function edit map, exact expected artifacts
and behavior, dependency state, absolute worktree and authoritative record paths,
baseline command procedure, fixture/check commands, and a short user UAT checklist.
This draft is not sufficient authorization to start implementation.

Detailed owner steps after approval:

1. Wait for verified WS-04 MERGED into the ARC, then read the final shared
   contract and the Codex integration findings. Branch from that ARC tip only
   after this WS receives IMPLEMENT approval.
2. Research current official Anthropic Claude Code documentation. Verify project
   instruction discovery, skills, subagent configuration/invocation, model and
   effort settings, background execution, and external-worktree operation.
   Record supporting links and verification dates; do not reuse Cursor or Codex
   artifact syntax without evidence.
3. Return a capability/support matrix and unresolved product choices to the
   orchestrator. Any limitation affecting independent review, owner permissions,
   model selection, or installation must be resolved before RESEARCH PASS.
4. After review and approval, register Claude Code using the shared adapter
   contract. Generate the approved native entrypoints/configuration and reuse
   shared role responsibilities. Preserve unrelated user files and fail before
   mutation on collisions.
5. Map the user's approved platform model policy to capabilities actually
   supported by Claude Code. The GPT-6.1 assignments for the agents developing
   this ARC do not imply Claude Code can run those models. Do not invent model
   identifiers or silently replace an approved model.
6. Validate start, plan/delegate, isolated implementation, independent review,
   confirmation handoff, and resume in a disposable project. Identify required
   runtime/authentication and never alter real user projects just to run UAT.
7. Confirm Cursor and Codex remain usable under the locked coexistence policy
   and explicit additive installation behavior. If Claude Code exposes a shared-contract gap, return
   the consequential change for review before implementing it.
8. Report tested versions, commands/artifacts, real platform smoke evidence,
   package results, limitations, and exact user testing instructions.

Common owner boundaries: work only in the assigned worktree; verify its branch
and starting SHA; preserve existing index/work; do not stage, commit, push, merge,
modify authoritative ARC/WS records, change unrelated model defaults, or claim
review PASS. Return consequential choices to the orchestrator. Never run candidate
governance on this source ARC or initialize the real source repo from an external
package. Candidate installs run in disposable repositories.

Deliver a concise report with reviewed revision, exact worktree/starting SHA,
files changed, checks actually run and outcomes, remaining issues, and runnable
user test commands. The orchestrator updates records and manages the testing handoff.

## Decisions

Locked user decisions:
- 2026-10-13 · User: Cursor, Codex, and Claude Code integrations coexist in one
  repository; their ARC/workstream records remain shared.
- 2026-10-13 · User: initial Codex support targets Codex CLI only; desktop app,
  IDE extension, and cloud support are deferred.
- 2026-10-13 · User: installation is explicit and additive. Adding Codex preserves
  Cursor; adding Claude Code preserves both. No automatic installation of every
  platform.
- 2026-10-13 · User: installed Codex defaults use GPT-6.1 Sol High for
  orchestrator/planner/reviewer and GPT-6.1 Sol Low for owner. Existing Cursor
  defaults remain separate; Claude Code defaults still require native-model decisions.
- Make platform integrations modular; add Codex before Claude Code.
- Use GPT-6.1 Sol High for orchestration/review and GPT-6.1 Sol Low for owners,
  with detailed orchestrator handoffs.

Repository conventions: shared Markdown records/gates; external WS worktrees;
independent review; explicit implementation/integration approval; source governance
pinned to ARC baseSha. Existing shipped Grok defaults are not changed by this
session's agent assignments.

Accepted contract, revision 1, after CHANGES-REQUESTED and re-review PASS-with-notes:
- CLI floor Claude Code 2.1.44 or newer. IDE, desktop, Chrome, and cloud are out.
- Project `CLAUDE.md` bytes are exactly `@AGENTS.md` plus LF. Any other project file is refused. Ancestor instruction files stay.
- Claude agents start with `---` and the first body line is exactly `<!-- dev-harness-managed -->`.
- Codex files still refresh only when they start with `# dev-harness-managed` and a line ending. The HTML comment does not authorize a Codex write.
- Defaults are the documented alias `opus` with high effort for orchestrator, planner, and reviewer, and low for owner.

Open decisions blocking IMPLEMENT: none. User accepted reviewed revision 1 fixture evidence on 2026-11-11 and authorized the WS-to-ARC merge, ARC close, and merge to main. Live Claude Code UAT was not run. No push or worktree cleanup is authorized.

## Gate

Current: `USER CONFIRM`. Revision: 1. Independent code review PASS-with-notes. User accepted reviewed fixture evidence. Live Claude Code UAT was not run.
Next: Commit accepted revision 1, merge WS-05 into the ARC, and run the integrated smoke check.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-10-13 | 2026-10-14 | PASS-with-notes; user go |
| IMPLEMENT | 2026-10-14 | 2026-10-14 | ready-for-review |
| REVIEW | 2026-10-14 | 2026-10-14 | PASS-with-notes |
| USER CONFIRM | 2026-10-14 | — | testing offered |

## Verification

Planned checks; none of these implementation checks has been run for this draft:

- Disposable Claude Code fresh install/re-init preserves existing user
  instructions, configuration, knowledge, and records.
- Native instructions and role artifacts are discovered on the declared supported
  runtime; independent review and owner worktree isolation are observed.
- Capability/configuration errors and entrypoint collisions follow approved behavior.
- Package contents include required artifacts; shared record resume works.
- Cursor, Codex, source-init protection, and pinned-governance regressions pass.
- Run npm test and git diff --check in the approved worktree; distinguish automated
  fixtures from real Claude Code UAT and report untested behavior explicitly.

No application server is required for this CLI/package work. After independent
code-review PASS, offer exact fixture commands and platform-specific manual UAT
from the actual WS worktree before asking for acceptance of the reviewed revision.

## User confirm checklist

- [ ] Claude Code installation/re-init and discovery work as approved.
- [ ] Shared workflow, role invocation, worktree isolation, and resume are verified.
- [ ] Platform model/capability behavior matches approved decisions.
- [ ] Cursor, Codex, and source governance remain verified.
- [ ] User confirms reviewed revision 1 and separately authorizes WS-to-ARC merge.

## Approvals

- 2026-10-13 · User authorized WS record creation and the development-agent
  model/effort assignments above.
- 2026-10-14T09:52:00.000Z · Independent reviewer · Grok 4.7 High · Revision 1
  contract re-review PASS-with-notes after CHANGES-REQUESTED. Implementation
  still requires the user go-ahead below. No commit, merge, or push.
- 2026-10-14T09:25:00.000Z · User · "implement and have it ready" approves WS-05
  revision 1 IMPLEMENT after contract review PASS. No WS-to-ARC merge, push, or
  main integration.
- 2026-11-11T07:33:00.000Z · User · "confirm and close the arc and merge to main"
  accepts reviewed revision 1 fixture evidence and authorizes code/record commits,
  WS-to-ARC merge, ARC smoke checks, ARC close, and merge into main. Live Claude
  Code UAT was not run. No push or worktree cleanup.

## Progress ledger

- 2026-10-14T04:41:32.529Z · Soner Can · Created.
- 2026-10-14T04:44:13.671Z · Orchestrator · Drafted revision 1 scope, dependencies, detailed owner guidance, and user-requested agent assignments. RESEARCH review pending; no implementation.

- 2026-10-14T04:50:49.728Z · Orchestrator · Recorded user decisions: coexistence, Codex CLI-only, explicit additive installation, and installed Codex per-role model/effort defaults. Draft remains unreviewed in RESEARCH; no IMPLEMENT authorization.
- 2026-10-14T09:35:00.000Z · Orchestrator · WS-04 prerequisite satisfied at ARC merge 140affaa3e6d3f3bb58af924df814e6142a39a1d, smoke 40/40 PASS. This WS remains RESEARCH. User asked for contract review and, after PASS, implementation left ready. No review outcome or IMPLEMENT entry yet.
- 2026-10-14T09:53:03.000Z · Independent reviewer/Orchestrator · Revision 1 contract re-review PASS-with-notes. User IMPLEMENT approval applied. Worktree created at parent 9cf4128ec697e903be34b1a82b63831224848de2. No commit, merge, or push.
- 2026-10-14T10:14:00.000Z · Owner/Orchestrator · Revision 1 implementation reported ready. Owner 46/46 tests PASS, diff check PASS, frozen companions unchanged, index unchanged. Independent code review opened on the uncommitted worktree. No commit, merge, push, or live Claude UAT.
- 2026-10-14T10:28:00.000Z · Independent reviewer/Orchestrator · Revision 1 code review PASS-with-notes on the uncommitted worktree. Reviewer did not re-run tests; orchestrator re-ran npm test 46/46 PASS, diff check PASS, and an empty frozen diff. USER CONFIRM entered. No commit, merge, push, or live Claude UAT.
- 2026-11-11T07:33:00.000Z · User/Orchestrator · User "confirm and close the arc and merge to main" accepted reviewed revision 1 fixture evidence and approved code/record commits, WS-to-ARC merge, ARC smoke checks, ARC close, and merge into main. USER CONFIRM remains until the merge commit. Live Claude Code UAT was not run. No push or worktree cleanup.
