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
  "updated": "2026-10-14T09:25:00.000Z",
  "next": "Commit accepted revision 1, merge WS-04 into the ARC, and run the integrated smoke check.",
  "arc": "2026-10-13-soner-can--modular-coding-agent-support",
  "sequence": 4,
  "gate": "USER CONFIRM",
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
  },
  "researchState": "approved",
  "researchReview": {
    "revision": 1,
    "outcome": "PASS-with-notes",
    "reviewer": "grok-4.7[effort=high]",
    "date": "2026-10-14T07:11:30.000Z",
    "notes": "nativeFiles channel; capability gate, assertReady, and marker check before the first mkdirSync; replace only marker files; createRecord treats native paths as managed; dummy adapter sets all five capabilities; Cursor-only init does not spawn codex."
  },
  "implementationApproval": {
    "revision": 1,
    "actor": "User",
    "date": "2026-10-14T06:44:00.000Z",
    "scope": "WS-04 IMPLEMENT only",
    "evidence": "once the review pass, start the implementation and complete it then run code reviewer"
  },
  "implementationState": "reviewed",
  "implementationEvidence": {
    "revision": 1,
    "reportedBy": "grok-4.7[effort=high]",
    "date": "2026-10-14T07:49:00.000Z",
    "worktree": "/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-04--codex-platform-support",
    "startingSha": "76201c4e89dc2e7b879e98a4bfdd20bbc2878549",
    "npmTest": "40/40 PASS; original 36 retained",
    "diffCheck": "PASS",
    "frozenCompanions": "empty diff and no untracked files",
    "index": "unchanged",
    "codexHelp": "0.162.1 documents --config; no live session"
  },
  "codeReview": {
    "revision": 1,
    "outcome": "PASS",
    "reviewer": "grok-4.7[effort=high]",
    "date": "2026-10-14T08:00:00.000Z",
    "worktree": "/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-04--codex-platform-support",
    "startingSha": "76201c4e89dc2e7b879e98a4bfdd20bbc2878549",
    "limits": "Reviewer read the uncommitted tree and counted 40 tests. Shell was blocked, so npm test was not re-run by the reviewer. Orchestrator re-ran npm test 40/40 PASS at 2026-10-14T08:05:00.000Z. No live Codex UAT."
  },
  "userTesting": {
    "revision": 1,
    "state": "offered",
    "worktree": "/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-04--codex-platform-support",
    "command": "npm test",
    "expected": "40 tests PASS",
    "nativeRuntime": "not verified",
    "server": "not applicable; CLI/package fixtures",
    "acceptedDate": "2026-10-14T09:25:00.000Z"
  },
  "acceptance": {
    "revision": 1,
    "actor": "User",
    "date": "2026-10-14T09:25:00.000Z",
    "evidence": "merge",
    "scope": "Accept reviewed revision 1 fixture evidence and authorize code/record commits, WS-to-ARC merge, and ARC smoke checks. No ARC-to-main merge, push, or worktree cleanup. Live Codex CLI UAT was not run."
  },
  "checkout": {
    "branch": "ws/WS-soner-can-04--codex-platform-support",
    "parentBranch": "arc/2026-10-13-soner-can--modular-coding-agent-support",
    "parentSha": "76201c4e89dc2e7b879e98a4bfdd20bbc2878549",
    "worktree": "../dev-harness-worktrees/WS-soner-can-04--codex-platform-support/"
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

# Codex platform support

## Arc

[Modular coding agent support](../arcs/2026-10-13-soner-can--modular-coding-agent-support.md)

## Checkout

WS branch: `ws/WS-soner-can-04--codex-platform-support`.
Parent: `arc/2026-10-13-soner-can--modular-coding-agent-support` at
`76201c4e89dc2e7b879e98a4bfdd20bbc2878549`.
External worktree: `../dev-harness-worktrees/WS-soner-can-04--codex-platform-support/`.
Resolved: `/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-04--codex-platform-support`.
Created after RESEARCH PASS-with-notes and user IMPLEMENT approval.

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

## Reviewed specification

Revision 1 RESEARCH review PASS-with-notes on 2026-10-14T07:11:30.000Z by Grok 4.7 High.
Implementation notes from that review are part of this specification.

Add `dev-harness/.harness/integrations/codex.mjs` and register it after Cursor.
`init --platform codex` adds Codex and preserves Cursor. Project writes only:

- `.agents/skills/dev-harness` directory symlink to `dev-harness/.harness/skills/dev-harness`, with `legacyTargets: []`
- `.codex/agents/dev-harness-planner.toml`
- `.codex/agents/dev-harness-reviewer.toml`
- `.codex/agents/dev-harness-owner.toml`

Each TOML starts with `# dev-harness-managed` and sets `name`, `description`, `model`, `model_reasoning_effort`, and `developer_instructions`. Names match the filenames without `.toml`. First-install defaults are `gpt-6.1-sol` high for planner and reviewer, and low for owner. Orchestrator uses the same model and high effort in `adapters.codex.models` and in startup guidance, not a fourth file. Instructions point at the shared skill and role boundary. They do not set sandbox, approval, or feature keys.

`nativeFiles` is a new install channel. Run the capability gate, `assertReady`, and the marker check after `integrations.preflight` and the `AGENTS.md` read, and before the first `mkdirSync`. Create a missing native file. Replace a file that starts with the marker. Refuse a directory, symlink, or unmarked file before any write. Other files under `.codex/agents/` and `.agents/skills/` stay. `createRecord` treats these native paths as managed. `assertReady` runs `codex --version` with `spawnSync` and no shell, and accepts only `codex-cli` versions at least `0.162.1`. Call it only when that adapter defines it and is in the planned installed set. Cursor-only init does not spawn `codex`.

`codex.mjs` uses the restricted module syntax, including no regex literals, template strings, slash operators, or `import.meta`. Frozen `config.json`, `templates/**`, and `adapters/**` stay byte-identical to `718d5b4f3729df96761ef99b63adbcfec2013bae`.

Startup guidance is rendered from the configured orchestrator model and effort:

```text
codex --model gpt-6.1-sol --config model_reasoning_effort="high"
codex exec --model gpt-6.1-sol --config model_reasoning_effort="high"
```

The skill's `--platform codex` section tells the session to spawn the three names with no alternate model or effort, to stop a role whose parent label does not show that model and effort, and to use harness git worktrees. If `codex --help` on 0.162.1 rejects `--config`, stop and return that result.

Retain the existing 36 tests. Set the dummy adapter's five capabilities true so its install still succeeds, and add a separate false-capability refusal. Fixtures use a temp `HOME` and a PATH-first fake `codex`.

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
- 2026-10-14T06:44:00.000Z · User: this Cursor session launches planner, reviewer,
  and owner with the harness models, Grok 4.7 High. Codex product defaults stay
  GPT-6.1 Sol. After RESEARCH PASS, implement revision 1 and run the code reviewer.

Repository conventions: shared Markdown records/gates; external WS worktrees;
independent review; explicit implementation/integration approval; source governance
pinned to ARC baseSha. Existing shipped Grok defaults are not changed by the
Codex product defaults.

Accepted defaults, revision 1:
- CLI floor `codex-cli` 0.162.1 or newer. A missing or older binary fails before writes.
- Project artifacts only: `.agents/skills/dev-harness` symlink and three
  `.codex/agents/dev-harness-{planner,reviewer,owner}.toml` files. No `~/.codex` writes.
- In-session `/subagents` is the background behavior. Parent-label mismatch stops that role.
- Fixture `npm test` is separate from live Codex CLI acceptance after code-review PASS.

Open decisions blocking IMPLEMENT: none. Independent revision 1 RESEARCH review
PASS-with-notes. User IMPLEMENT approval is recorded below. No commit, merge, or push
is authorized.

## Gate

Current: `USER CONFIRM`. Revision: 1. Independent code review PASS. Changes remain uncommitted.
Next: User tests uncommitted revision 1 from the WS worktree, or chooses self-test or waiver. Acceptance is separate from commit and WS-to-ARC merge.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-10-13 | 2026-10-14 | PASS-with-notes; user go |
| IMPLEMENT | 2026-10-14 | 2026-10-14 | ready-for-review |
| REVIEW | 2026-10-14 | 2026-10-14 | PASS |
| USER CONFIRM | 2026-10-14 | — | testing offered |

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

Orchestrator re-ran `npm test` in the WS worktree on 2026-10-14T08:05:00.000Z: 40/40 PASS. Live Codex CLI acceptance has not been run.

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
- [x] User confirms reviewed revision 1 and authorizes WS-to-ARC merge. Live Codex CLI UAT was not run.

## Approvals

- 2026-10-13 · User authorized WS record creation and the development-agent
  model/effort assignments above.
- 2026-10-14T07:11:30.000Z · Independent reviewer · Grok 4.7 High · Revision 1
  RESEARCH review PASS-with-notes. This permits implementation only together with
  the user go-ahead below. No commit, merge, push, or reviewed-revision acceptance.
- 2026-10-14T06:44:00.000Z · User · "once the review pass, start the implementation
  and complete it then run code reviewer" approves WS-04 revision 1 IMPLEMENT after
  that review. No commit, WS-to-ARC merge, push, or main integration.
- 2026-10-14T09:25:00.000Z · User · "merge" accepts reviewed revision 1 fixture evidence
  and authorizes code/record commits, WS-to-ARC merge, and ARC smoke checks.
  No ARC-to-main merge, push, or worktree cleanup. Live Codex CLI UAT was not run.

## Progress ledger

- 2026-10-14T04:41:28.335Z · Soner Can · Created.
- 2026-10-14T04:44:13.671Z · Orchestrator · Drafted revision 1 scope, dependencies, detailed owner guidance, and user-requested agent assignments. RESEARCH review pending; no implementation.

- 2026-10-14T04:50:49.728Z · Orchestrator · Recorded user decisions: coexistence, Codex CLI-only, explicit additive installation, and installed Codex per-role model/effort defaults. Draft remains unreviewed in RESEARCH; no IMPLEMENT authorization.

- 2026-10-14T06:26:17.770Z · Orchestrator · WS-03 prerequisite satisfied at ARC merge 6394b4807544b20842aba6748bdbe86ca36a6018, smoke36/36 PASS. This WS remains RESEARCH; no per-WS research review or IMPLEMENT approval yet.
- 2026-10-14T07:11:30.000Z · Independent reviewer/Orchestrator · Revision 1 RESEARCH review PASS-with-notes. User IMPLEMENT approval applied. Gate entered IMPLEMENT. Worktree created at parent 76201c4e89dc2e7b879e98a4bfdd20bbc2878549. No commit, merge, or push.
- 2026-10-14T07:49:00.000Z · Owner/Orchestrator · Revision 1 implementation reported ready. Owner 40/40 tests PASS, diff check PASS, frozen companions unchanged, index unchanged. Independent code review opened on the uncommitted worktree. No commit, merge, push, or live Codex UAT.
- 2026-10-14T08:05:00.000Z · Independent reviewer/Orchestrator · Revision 1 code review PASS on the uncommitted worktree. Reviewer did not re-run tests; orchestrator re-ran npm test 40/40 PASS. USER CONFIRM entered. No commit, merge, push, or live Codex UAT.
- 2026-10-14T09:25:00.000Z · User/Orchestrator · User "merge" accepted reviewed revision 1 and approved code/record commits, WS-to-ARC merge, and smoke checks. USER CONFIRM remains until the merge commit. No ARC-to-main merge or push.
