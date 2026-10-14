---
{
  "id": "WS-soner-can-04--codex-platform-support",
  "kind": "workstream",
  "title": "Codex platform support",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 1,
  "created": "2026-10-14T04:41:28.335Z",
  "updated": "2026-10-14T06:26:17.770Z",
  "next": "WS-03 MERGED and verified; review Codex CLI artifacts/version/UAT scope and obtain revision 1 IMPLEMENT approval.",
  "arc": "2026-10-13-soner-can--modular-coding-agent-support",
  "sequence": 4,
  "gate": "RESEARCH",
  "dependencies": [
    "WS-soner-can-03--modular-adapter-foundation"
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
    "workstream": "WS-soner-can-03--modular-adapter-foundation",
    "mergeCommit": "6394b4807544b20842aba6748bdbe86ca36a6018",
    "date": "2026-10-14T06:26:17.770Z",
    "smoke": "36/36 PASS"
  }
}
---

# Codex platform support

## Arc

[Modular coding agent support](../arcs/2026-10-13-soner-can--modular-coding-agent-support.md)

## Checkout

Planned WS branch: `ws/WS-soner-can-04--codex-platform-support`.
Parent: `arc/2026-10-13-soner-can--modular-coding-agent-support`.
Planned external worktree: `../dev-harness-worktrees/WS-soner-can-04--codex-platform-support/`.
Resolved planned path: `/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-04--codex-platform-support`.
These are planned locations; no WS branch or worktree has been created.
Create them only after RESEARCH review PASS, user IMPLEMENT approval, and dependency
merges. Record the actual parent tip then.

The ARC checkout owns authoritative records under
`/Users/scaryguy/Projects/dev-harness/dev-harness/`; owner-worktree record copies
are not authoritative.

## Scope and approach

Add Codex as the first new platform using the WS-03 contract. Reuse the shared
ARC/workstream records and planner/reviewer/owner responsibilities. Do not add
Claude Code here or rewrite the shared workflow.

Likely candidate files: a new adapters/codex/ subtree, adapter registration,
focused CLI/package tests, and Codex installation/start/resume documentation.
Shared CLI changes are limited to a reviewed contract gap; return broader changes
to the orchestrator. Initial support is limited to Codex CLI. App, IDE extension, and cloud support
are deferred. Exact artifacts and runtime acceptance criteria require review.

Dependencies: [WS-soner-can-03--modular-adapter-foundation](./WS-soner-can-03--modular-adapter-foundation.md) MERGED.

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

1. Wait for WS-03 MERGED into this ARC. Read its final contract, accepted
   decisions, tests, and authoritative records before proposing the Codex adapter.
2. Research current official OpenAI documentation and locally available Codex
   configuration/interfaces. Use the openai-docs skill for product specifics.
   Record source links and verification dates. Target Codex CLI only. Do not expand this workstream to app, IDE, or cloud
   surfaces or claim those are supported.
3. Return a support matrix to the orchestrator covering instruction discovery,
   skill loading, independent planner/reviewer/owner invocation, role-specific
   model and effort settings, worktree isolation, and background execution.
   Honor the locked CLI-only scope and resolve unsupported-capability behavior
   before RESEARCH PASS or implementation.
4. After review and IMPLEMENT approval, register Codex through the shared adapter
   contract. Generate only the approved platform artifacts and preserve existing
   user instructions/configuration. Install collision checks must run before writes.
5. Keep workflow policy shared; render Codex-specific role/invocation instructions
   from the shared responsibilities. Do not copy Cursor frontmatter or assume
   Cursor model identifiers are accepted by Codex.
6. Apply the approved model configuration separately for orchestration, planner,
   owners, and reviewers. Provide explicit native CLI launch/config guidance for
   the orchestrator and verify role model/effort defaults without overwriting user
   Codex configuration. Configured intent is not an observed running model.
   Do not silently lower review effort or collapse independent review into owner
   self-review when a surface lacks required capabilities.
7. Exercise installation, re-init, start/status, planning/delegation, isolated owner
   work, independent review, and resume on every declared supported surface.
   Keep automated fixture validation separate from observed platform smoke tests.
8. Package and document the adapter. Report actual commands/artifacts, test
   evidence, exact runtime versions/surfaces, and any unsupported cases.

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

- Supported CLI version floor and native capability checks. CLI-only scope is locked.
- Native discovery, delegation, background execution, and model/effort capabilities.
- Settings scope, additive-install collision handling, and unsupported-capability behavior
  as established in WS-03 and confirmed for Codex.
- Live platform smoke-test environment and precise acceptance workflow.

The adapter split and implementation steps remain a draft proposal. The user
decisions above are locked; remaining defaults are unapproved. No plan-review
PASS or per-WS RESEARCH PASS is asserted.

## Gate

Current: `RESEARCH`. Revision: 1. Review pending; implementation not authorized.
Next: WS-03 MERGED and verified; review Codex CLI artifacts/version/UAT scope and obtain revision 1 IMPLEMENT approval.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-10-13 | — | Review pending |

## Codex CLI research evidence

Verified 2026-10-13: local executable reports `codex-cli 0.162.1`.
`codex --help` was inspected; no live model request or platform UAT was run.
A minimum supported version is not established by this observation.

Official documentation supports these candidate integration artifacts:
- Repository skill discovery under `.agents/skills/`, including symlinked folders;
  the shared harness skill can have a small discovery link. See
  [Build skills](https://learn.chatgpt.com/docs/build-skills).
- Project instruction discovery via `AGENTS.md`, with override precedence; keep
  one shared harness block and detect when an override prevents it loading. See
  [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
- Project-scoped custom agents as standalone TOML files under `.codex/agents/`,
  with model and reasoning-effort fields. Permissions inherit from the parent;
  review-only instructions do not establish a separate read-only sandbox. See
  [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).

Proposed Codex artifacts for review: `.agents/skills/dev-harness` discovery link
and namespaced planner/reviewer/owner TOML files. Keep native files as small
platform entrypoints/configuration referring to shared harness responsibilities.
Do not overwrite user-level configuration or loosen parent permissions.

## Verification

Planned checks; none of these implementation checks has been run for this draft:

- Disposable fresh install and re-init preserve unrelated project instructions,
  platform configuration, knowledge, records, and other installed integrations
  according to the approved coexistence policy.
- Missing/colliding artifacts, invalid model settings, and unsupported required
  capabilities are detected with the approved failure behavior.
- Installed package contains Codex artifacts and resolves instructions correctly.
- Supported Codex surfaces demonstrably load the instructions and perform the
  approved role/delegation workflow in external worktrees.
- Resume reads the same shared records; Cursor regression suite still passes.
- Run npm test and git diff --check from the approved WS worktree. Record real
  Codex smoke-test results separately; fixture success is not platform UAT.

No application server is required for this CLI/package work. After independent
code-review PASS, offer exact fixture commands and platform-specific manual UAT
from the actual WS worktree before asking for acceptance of the reviewed revision.

## User confirm checklist

- [ ] Codex installation and re-init work on the approved surfaces.
- [ ] Codex discovers the shared workflow and resumes shared records.
- [ ] Approved delegation, model/effort settings, and worktree isolation are verified.
- [ ] Cursor and source governance regressions remain verified.
- [ ] User confirms reviewed revision 1 and separately authorizes WS-to-ARC merge.

## Approvals

- 2026-10-13 · User authorized WS record creation and the development-agent
  model/effort assignments above.
- Revision 1 is a draft in RESEARCH. No implementation, commit, merge, push,
  or reviewed-revision acceptance has been authorized. No review outcome exists.

## Progress ledger

- 2026-10-14T04:41:28.335Z · Soner Can · Created.
- 2026-10-14T04:44:13.671Z · Orchestrator · Drafted revision 1 scope, dependencies, detailed owner guidance, and user-requested agent assignments. RESEARCH review pending; no implementation.

- 2026-10-14T04:50:49.728Z · Orchestrator · Recorded user decisions: coexistence, Codex CLI-only, explicit additive installation, and installed Codex per-role model/effort defaults. Draft remains unreviewed in RESEARCH; no IMPLEMENT authorization.

- 2026-10-14T06:26:17.770Z · Orchestrator · WS-03 prerequisite satisfied at ARC merge 6394b4807544b20842aba6748bdbe86ca36a6018, smoke36/36 PASS. This WS remains RESEARCH; no per-WS research review or IMPLEMENT approval yet.
