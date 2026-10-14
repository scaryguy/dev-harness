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
  "updated": "2026-10-14T09:35:00.000Z",
  "next": "WS-04 MERGED and verified; review the Claude Code CLI contract, then implement only after that review passes.",
  "arc": "2026-10-13-soner-can--modular-coding-agent-support",
  "sequence": 5,
  "gate": "RESEARCH",
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
  }
}
---

# Claude Code platform support

## Arc

[Modular coding agent support](../arcs/2026-10-13-soner-can--modular-coding-agent-support.md)

## Checkout

Planned WS branch: `ws/WS-soner-can-05--claude-code-platform-support`.
Parent: `arc/2026-10-13-soner-can--modular-coding-agent-support`.
Planned external worktree: `../dev-harness-worktrees/WS-soner-can-05--claude-code-platform-support/`.
Resolved planned path: `/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-05--claude-code-platform-support`.
These are planned locations; no WS branch or worktree has been created.
Create them only after RESEARCH review PASS, user IMPLEMENT approval, and dependency
merges. Record the actual parent tip then.

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

Open decisions blocking IMPLEMENT:

- Supported Claude Code versions and interaction modes.
- Verified native discovery/delegation/model/effort capabilities and model defaults.
- Required capability behavior and platform-specific installation/conflicts.
- Live smoke-test environment and acceptance workflow.

The adapter split and implementation steps remain a draft proposal. The user
decisions above are locked; remaining defaults are unapproved. No plan-review
PASS or per-WS RESEARCH PASS is asserted.

## Gate

Current: `RESEARCH`. Revision: 1. Review pending; implementation not authorized.
Next: Await verified WS-04 MERGED; define Claude Code scope, review revision 1, and obtain IMPLEMENT approval.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-10-13 | — | Review pending |

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
- Revision 1 is a draft in RESEARCH. No implementation, commit, merge, push,
  or reviewed-revision acceptance has been authorized. No review outcome exists.

## Progress ledger

- 2026-10-14T04:41:32.529Z · Soner Can · Created.
- 2026-10-14T04:44:13.671Z · Orchestrator · Drafted revision 1 scope, dependencies, detailed owner guidance, and user-requested agent assignments. RESEARCH review pending; no implementation.

- 2026-10-14T04:50:49.728Z · Orchestrator · Recorded user decisions: coexistence, Codex CLI-only, explicit additive installation, and installed Codex per-role model/effort defaults. Draft remains unreviewed in RESEARCH; no IMPLEMENT authorization.
- 2026-10-14T09:35:00.000Z · Orchestrator · WS-04 prerequisite satisfied at ARC merge 140affaa3e6d3f3bb58af924df814e6142a39a1d, smoke 40/40 PASS. This WS remains RESEARCH. User asked for contract review and, after PASS, implementation left ready. No review outcome or IMPLEMENT entry yet.
