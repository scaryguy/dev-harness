---
{
  "id": "2026-10-13-soner-can--modular-coding-agent-support",
  "kind": "arc",
  "title": "Modular coding agent support",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 2,
  "created": "2026-10-14T04:37:05.516Z",
  "updated": "2026-10-14T06:19:42.740Z",
  "next": "Commit reviewed WS-03 and ARC records, merge WS-03 into ARC, and run smoke checks; WS-04/05 remain RESEARCH.",
  "status": "in-progress",
  "branch": "arc/2026-10-13-soner-can--modular-coding-agent-support",
  "integrationBranch": "main",
  "baseSha": "718d5b4f3729df96761ef99b63adbcfec2013bae",
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
    ],
    "unqualifiedStatus": "all-installed",
    "statusModelDisplay": "configured-orchestrator-per-platform"
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
  "planReview": {
    "revision": 2,
    "outcome": "PASS-with-notes",
    "reviewer": "gpt-6.1-sol[effort=high]",
    "date": "2026-10-14T05:22:34.229Z"
  }
}
---

# Modular coding agent support

## Outcome and scope

Extend Dev Harness beyond its current Cursor integration through a modular
platform adapter boundary. Add Codex support first, then Claude Code support.
Preserve the shared ARC/workstream workflow and existing Cursor behavior.

Current adapter files are separated by platform, but the CLI still hardcodes
Cursor configuration, discovery links, agent-model rendering, validation, and
source-runtime identity. The shared skill also assumes Cursor delegation.
The detailed contract remains to be researched and reviewed. Three draft
workstreams are allocated in RESEARCH.

Intended sequence:
1. WS-03: define and implement the modular adapter foundation, preserving Cursor.
2. WS-04: add Codex after WS-03 MERGED.
3. WS-05: add Claude Code after WS-04 MERGED and verified.

Locked scope: all platform integrations coexist; installation is explicit and
additive; initial Codex support is CLI-only, using the approved per-role defaults.
WS-03 revision 2 proposes lazy built-in integration modules, preserving current
baseline companions and existing migration/collision policy. Unqualified
status is locked to all installed integrations. ARC revision 2 plan review and
WS-03 revision 2 RESEARCH review are PASS-with-notes; user approved WS-03
revision 2 IMPLEMENT. WS-04
will verify native Codex artifact discovery/version support; WS-05 will resolve
Claude native model/capability choices before its IMPLEMENT gate.

Research must also account for this ARC's existing baseline governance: its
committed dispatcher verifies config/templates/adapters as an exact file set.
Candidate adapter changes must not replace or bypass the baseline governing this
ARC. Resolve how to verify candidate integrations while preserving those rules
before implementation.

## Decisions

- 2026-10-14T06:19:42.740Z · User · "ok merge" accepts reviewed WS-03 revision 2 and
  authorizes its code/ARC/WS record commits, WS-to-ARC merge, and ARC smoke checks.
  No ARC-to-main merge, push, WS-04/05 IMPLEMENT, or worktree cleanup approval.

- 2026-10-14T05:27:28.768Z · User · "start 03" approves reviewed ARC revision 2 foundation
  scope and WS-03 revision 2 IMPLEMENT. WS-04/05 still require their own review
  and IMPLEMENT approval; no commit/merge/push is authorized.

- 2026-10-14T05:22:34.229Z · Independent reviewer · ARC revision 2 plan review PASS-with-notes;
  WS-03 revision 2 RESEARCH review PASS-with-notes. These permit presenting the
  proposal, not implementation or Git integration. No WS-04/05 review is claimed.

- 2026-10-13 · User: unqualified status shows all installed integrations and
  each configured orchestrator model; --platform narrows the view. Shared ARC/WS
  records appear once, with no platform-based duplication.

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


- 2026-10-13 · User: continue developing Dev Harness itself, make platform
  integrations modular, and support Codex followed by Claude Code.
- 2026-10-13 · User: create the ARC first. This explicitly precedes detailed
  planning and plan review; no reviewer PASS is claimed.
- 2026-10-13 · User: orchestrator and reviewer use GPT-6.1 Sol High;
  implementation owners use GPT-6.1 Sol Low with detailed orchestrator instructions.
  These per-role assignments override session delegation defaults.
- Repository constraint · Baseline companion verification prevents changing this
  ARC's governing config in place. The orchestrator records these assignments in
  ARC/WS metadata as session overrides. Codex shipped defaults were subsequently
  approved separately; Cursor defaults are preserved and Claude Code defaults
  remain open.
- 2026-10-13 · User: create WSes now. Draft specifications precede detailed
  clarification/review; this is not IMPLEMENT authorization.
- ARC/WS creation and recording the sequence/model assignments are authorized. Detailed scope,
  IMPLEMENT, commits, merges, and pushes are not yet approved.

## Branch and rollup

Branch: `arc/2026-10-13-soner-can--modular-coding-agent-support` from `main` at
`718d5b4f3729df96761ef99b63adbcfec2013bae`. No integration merge yet.
Workstreams were created at the user's explicit request before detailed plan
review. WS-03 branch/worktree is created after user IMPLEMENT go; WS-04/05
remain RESEARCH with no branch/worktree yet.

| WS | Gate | Depends on | WS branch | Merge SHA |
|----|------|------------|-----------|-----------|
| [WS-03](../workstreams/WS-soner-can-03--modular-adapter-foundation.md) | USER CONFIRM | — | `ws/WS-soner-can-03--modular-adapter-foundation` | — |
| [WS-04](../workstreams/WS-soner-can-04--codex-platform-support.md) | RESEARCH | WS-03 MERGED | Planned; not created | — |
| [WS-05](../workstreams/WS-soner-can-05--claude-code-platform-support.md) | RESEARCH | WS-04 MERGED and verified | Planned; not created | — |

## Integration checklist

- [ ] Workstreams completed or explicitly deferred.
- [ ] Arc smoke tests after each WS merge and final integration checks passed.
- [ ] Codex support verified before Claude Code implementation begins.
- [ ] Existing Cursor behavior and source baseline governance remain verified.
- [ ] User approved integration of the reviewed revision.

## Progress ledger

- 2026-10-14T04:37:05.516Z · Soner Can · Created.
- 2026-10-13 · Orchestrator · Created the draft ARC at the user's explicit
  request and recorded Codex → Claude Code order. Validated the full base SHA,
  ancestor relationship, and regular committed CLI/skill blobs; read the skill
  from Git and invoked its independently extracted, byte-verified baseline CLI
  outside the repository. No implementation or plan review performed.

- 2026-10-14T04:44:13.671Z · Orchestrator · Created WS-03, WS-04, and WS-05 with the
  independently extracted baseline CLI. Saved revision 1 draft handoffs and
  dependencies; all remain RESEARCH without review or implementation approval.

- 2026-10-14T04:50:49.728Z · Orchestrator · Recorded user decisions: coexistence, Codex CLI-only, explicit additive installation, and installed Codex per-role model/effort defaults. ARC remains draft; workstreams remain unreviewed in RESEARCH; no IMPLEMENT authorization.
- 2026-10-14T04:58:55.320Z · Planner/Orchestrator · Saved draft adapter contract and detailed owner handoff in WS-03 revision 2. No plan PASS, implementation, commit, or merge.

- 2026-10-14T05:02:27.910Z · Independent reviewer · WS-03 revision 2 review DEFER pending status display choice; technical contract viable and no further consequential user choice found. RESEARCH remains open.

- 2026-10-14T05:20:18.490Z · User/Orchestrator · User selected all installed integrations for unqualified status. Decision and display scope recorded; final WS-03 revision 2 plan review requested. No IMPLEMENT authorization.

- 2026-10-14T05:22:34.229Z · Independent reviewer · ARC revision 2 plan and WS-03 revision 2 RESEARCH review PASS-with-notes. WS-03 awaits user IMPLEMENT go; WS-04 waits WS-03 MERGED and WS-05 waits verified WS-04 MERGED. No implementation or Git writes authorized.

- 2026-10-14T05:27:28.768Z · User/Orchestrator · WS-03 IMPLEMENT authorized and entered after RESEARCH PASS-with-notes. ARC in-progress; WS-04/05 remain RESEARCH and dependency-gated.

- 2026-10-14T05:29:25.690Z · Orchestrator · WS-03 external worktree created and detailed owner handoff saved. Owner uses GPT-6.1 Sol Low; reviewer GPT-6.1 Sol High. Frozen source companions remain unchanged.

- 2026-10-14T05:38:24.870Z · Owner/Orchestrator · WS-03 implementation ready; owner reports 33/33 tests PASS and frozen companions unchanged. Independent High review opened on actual unstaged/untracked worktree. No commit/merge/push.

- 2026-10-14T05:44:34.076Z · Independent reviewer/Orchestrator · WS-03 revision 2 code review CHANGES-REQUESTED; returned to IMPLEMENT to fix three concrete findings within approved scope. No native UAT/acceptance or Git integration.

- 2026-10-14T05:53:12.091Z · Owner/Orchestrator · WS-03 three findings corrected; owner 36/36 tests PASS with unchanged frozen companions/index. Independent High re-review opened; no integration authorized.

- 2026-10-14T05:57:33.008Z · Independent reviewer/Orchestrator · WS-03 revision 2 code re-review PASS; 36/36 independent tests and frozen companions PASS. USER CONFIRM entered with executable test handoff. WS-04/05 stay RESEARCH; no staging/commit/merge/push or user acceptance.

- 2026-10-14T06:17:47.932Z · Orchestrator · WS-03 final disposable CLI readiness smoke PASS. No user acceptance, commit, or merge authorization inferred from readiness question; USER CONFIRM remains open.

- 2026-10-14T06:19:42.740Z · User/Orchestrator · WS-03 revision 2 acceptance and commit/WS-to-ARC merge approval recorded. Draft WS-04/05 and parent ARC records persist as part of the accepted record set; their gates/approval remain unchanged.
