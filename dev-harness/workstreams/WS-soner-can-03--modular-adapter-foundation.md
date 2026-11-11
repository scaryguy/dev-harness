---
{
  "id": "WS-soner-can-03--modular-adapter-foundation",
  "kind": "workstream",
  "title": "Modular adapter foundation",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 2,
  "created": "2026-10-14T04:41:24.136Z",
  "updated": "2026-10-14T06:26:17.770Z",
  "next": "Integrated into ARC with smoke PASS; WS-04 Codex CLI scope/review and IMPLEMENT approval are next.",
  "arc": "2026-10-13-soner-can--modular-coding-agent-support",
  "sequence": 3,
  "gate": "MERGED",
  "dependencies": [],
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
  "researchState": "approved",
  "researchReview": {
    "revision": 2,
    "outcome": "PASS-with-notes",
    "reviewer": "gpt-6.1-sol[effort=high]",
    "date": "2026-10-14T05:22:34.229Z",
    "notes": "Complete exact engineering shapes, fixtures, dependency inventory, starting SHA, approval evidence, and worktree paths before owner launch."
  },
  "implementationApproval": {
    "revision": 2,
    "actor": "User",
    "date": "2026-10-14T05:27:28.768Z",
    "scope": "WS-03 IMPLEMENT only",
    "evidence": "start 03"
  },
  "implementationState": "integrated",
  "checkout": {
    "branch": "ws/WS-soner-can-03--modular-adapter-foundation",
    "parentBranch": "arc/2026-10-13-soner-can--modular-coding-agent-support",
    "parentSha": "718d5b4f3729df96761ef99b63adbcfec2013bae",
    "worktree": "../dev-harness-worktrees/WS-soner-can-03--modular-adapter-foundation/"
  },
  "implementationEvidence": {
    "revision": 2,
    "reportedBy": "gpt-6.1-sol[effort=low]",
    "date": "2026-10-14T05:53:12.091Z",
    "npmTest": "36/36 PASS; original25 retained",
    "diffCheck": "PASS",
    "frozenCompanions": "no changed or extra files",
    "index": "unchanged",
    "reviewCorrections": "all three implemented with regressions; High re-review pending"
  },
  "codeReview": {
    "revision": 2,
    "outcome": "PASS",
    "reviewer": "gpt-6.1-sol[effort=high]",
    "date": "2026-10-14T05:57:33.008Z",
    "npmTest": "36/36 PASS; original25 retained",
    "diffCheck": "PASS",
    "frozenCompanions": "eight baseline files byte/file-set identical",
    "index": "empty",
    "priorFindings": "all three resolved",
    "limits": "No native Cursor/model verification or user acceptance."
  },
  "userTesting": {
    "revision": 2,
    "state": "accepted-reviewed-cli-evidence",
    "worktree": "/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-03--modular-adapter-foundation",
    "command": "npm test",
    "expected": "36 tests PASS",
    "nativeRuntime": "not verified",
    "server": "not applicable; CLI/package fixtures",
    "acceptedDate": "2026-10-14T06:19:42.740Z"
  },
  "mergeReadinessSmoke": {
    "date": "2026-10-14T06:17:47.932Z",
    "actor": "Orchestrator",
    "revision": 2,
    "outcome": "PASS",
    "checks": [
      "disposable explicit Cursor install",
      "installed CLI refresh",
      "configuration extension preservation",
      "knowledge marker preservation",
      "unrelated instructions preservation",
      "configured model status",
      "zero-record structural check"
    ],
    "nativeRuntime": "not verified",
    "userAcceptance": "pending"
  },
  "acceptance": {
    "revision": 2,
    "actor": "User",
    "date": "2026-10-14T06:19:42.740Z",
    "evidence": "ok merge",
    "scope": "Accept reviewed revision 2 and authorize code/ARC/WS record commits, WS-to-ARC merge, and ARC smoke checks. No ARC-to-main merge, push, or worktree cleanup."
  },
  "integration": {
    "codeCommit": "8629ababdf9949b797b2d1c1b143da0446e0f2e7",
    "acceptanceRecordsCommit": "df5c69eb02a589c9fa9b062b79f788b6f7822a3f",
    "mergeCommit": "6394b4807544b20842aba6748bdbe86ca36a6018",
    "targetBranch": "arc/2026-10-13-soner-can--modular-coding-agent-support",
    "date": "2026-10-14T06:26:17.770Z",
    "npmTest": "36/36 PASS",
    "testDurationMs": 257760.945625,
    "baselineCheck": "7 structurally valid records; original independently extracted baseline",
    "frozenCompanions": "unchanged"
  }
}
---

# Modular adapter foundation

## Arc

[Modular coding agent support](../arcs/2026-10-13-soner-can--modular-coding-agent-support.md)

## Checkout

Code commit: `8629ababdf9949b797b2d1c1b143da0446e0f2e7`.
Accepted ARC/WS records: `df5c69eb02a589c9fa9b062b79f788b6f7822a3f`.
WS-to-ARC merge: `6394b4807544b20842aba6748bdbe86ca36a6018`.
Branch/worktree retained; cleanup not authorized.

WS branch: `ws/WS-soner-can-03--modular-adapter-foundation`.
Parent: `arc/2026-10-13-soner-can--modular-coding-agent-support` at
`718d5b4f3729df96761ef99b63adbcfec2013bae`.
External worktree: `../dev-harness-worktrees/WS-soner-can-03--modular-adapter-foundation/`.
Resolved: `/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-03--modular-adapter-foundation`.
Created after RESEARCH PASS-with-notes and user IMPLEMENT approval.

The ARC checkout owns authoritative records under
`/Users/scaryguy/Projects/dev-harness/dev-harness/`; owner-worktree record copies
are not authoritative.

## Scope and approach

Extract the platform-specific integration boundary while preserving the existing
Cursor install and shared ARC/workstream behavior. This workstream prepares the
contract consumed by WS-04 and WS-05; it does not add either new platform.

Research the coupling in cli.mjs: config(), links(), init(), check dispatch,
isPackageSourceCheckout(), createRecord() managed-path handling, and pinned()
runtime extraction/required companion files. Inspect shared SKILL.md delegation
instructions and the three Cursor role files. Likely candidate files: cli.mjs, cli.test.mjs, skills/dev-harness/SKILL.md,
new integration-code modules, README.md, and package.json for packaging. Source
config.json, templates/, and adapters/cursor/ are read-only baseline companions.
Installed target configuration/artifacts may evolve through reviewed candidate
init in disposable repositories. Exact edits remain subject to plan review.

Proposed contract for review: adapter identity; supported capabilities; managed
discovery/instruction paths; agent configuration rendering; model-setting
validation; setup/check behavior; and startup guidance. Keep role responsibilities
and workflow policy shared. Platform-specific syntax belongs in adapters.
Decide whether a built-in registry is sufficient before considering external
plugins. Preserve Node 20+ support.

Dependencies: none.

## Proposed adapter contract

Planner: GPT-6.1 Sol High. Independent revision 2 plan/RESEARCH review:
PASS-with-notes; user approved IMPLEMENT revision 2.

### Shared core and adapters

Shared core owns records, gates, approvals, Git identity, branches/worktrees,
source protection, common AGENTS.md instructions, configuration preservation,
preflight, and filesystem writes. Adapters own native discovery/configuration
syntax, model rendering/validation, managed-artifact declarations, supported
capabilities, and startup/delegation guidance.

Use a closed built-in registry, not arbitrary user-supplied executable plugins.
New adapters require one module and registration; shared workflow code gains no
platform-specific branch. Node 20+ remains supported. No daemon, API integration,
or new permission/sandbox policy is introduced.

Proposed new runtime modules under `dev-harness/.harness/integrations/`:
- `registry.mjs`: built-in lookup and enumeration.
- `config.mjs`: pure v1/v2 normalization, preservation, additive settings plan.
- `install.mjs`: aggregate artifact plans, whole-plan preflight, managed writes.
- `cursor.mjs`: Cursor defaults, rendering, paths, validation, and guidance.

Adapter interface: id, label, defaults, capabilities, validateSettings(settings),
planArtifacts(context), checkArtifacts(context), startupGuidance(context).
Artifact planning returns data and performs no writes. Shared code checks safe
repository-relative paths, duplicate paths, cross-adapter collisions, ownership,
and parent-directory types before mutation. One artifact declaration supplies
installation, checks, and managed-path classification for new-ARC creation.

### Installation and configuration behavior

Proposed command syntax:
```text
init [repository] [--platform PLATFORM]...
status [--platform PLATFORM]
check [--platform PLATFORM]
```

Fresh unqualified init retains Cursor as the default. Unqualified re-init refreshes
the installed set. Explicit selection unions into that set; repeated flags/installs
are idempotent. Unknown/unregistered platforms fail before writes. WS-03 registers
only Cursor; a fixture-only second adapter tests extensibility without adding
product support early. Installation performs no authentication or model request.

A fresh target has no installed integrations: explicit selection installs only
the requested set. The shipped v1 Cursor configuration supplies legacy defaults,
not evidence that Cursor is already installed. An existing initialized v1 target
does have Cursor installed, which additive selection preserves.

Version 1 remains readable without mutation: normalize its Cursor orchestrator
string and unchanged subagent string (planner/reviewer/owner) in memory. Ordinary
status/check never migrate configuration. Explicit additive init may translate
into version 2 with an installedPlatforms list and adapters-by-ID settings map.
The exact keys are an implementation proposal. Preserve every existing model/Git/
checks/unknown-extension value; conflicting new schema fields fail before writes.
Ordinary Cursor-only refresh may retain version 1. New platforms receive defaults;
existing settings always win. Preserve unknown platform settings and never interpret
them as a request to uninstall.

Cursor identifiers remain opaque strings and current defaults stay unchanged.
Codex defaults are locked: gpt-6.1-sol with high effort for orchestrator/planner/
reviewer and low for owner. Claude Code defaults remain deferred to WS-05.

Native adapter instructions use explicit --platform selectors; no platform
autodetection. User-approved unqualified status shows every installed
integration's configured orchestrator model. Shared ARC/workstream records appear
once. Explicit --platform narrows platform settings/native artifact checks; it
does not filter out shared records or skip their validation. Record configured
values as configured, not observed runtime identity.

Capabilities cover instruction discovery, separate planner/reviewer/owner
delegation, role settings, external worktrees, and background execution.
Structural validity is distinct from observed native support. Existing policy
applies: if a required model/reviewer/capability is unavailable, stop the dependent
workflow step, report it, and do not silently downgrade or substitute self-review.
Parent permission policy remains authoritative.

### Preservation, ownership, and source governance

Refresh managed built-ins while preserving configuration, knowledge, records,
instructions outside the marked block, and unrelated native files. Native paths
must be absent or the exact expected current/legacy managed symlinks. Reject
occupied files/directories, malformed markers, migration conflicts, invalid
settings, unsafe parents, and conflicting declarations before any mutation.
Do not adopt or delete user files; refreshing one integration preserves the others.

Proposed Codex artifacts are small managed links to generated internal role TOMLs.
Skill symlink discovery is documented; agent TOML symlink discovery is not yet
observed. WS-04 must verify native discovery through UAT and return for reviewed
artifact design if unsupported.

For this ARC, config.json, templates/**, and adapters/** remain byte/path identical
to baseSha. New integration code must not relocate or replace frozen companions.
The Cursor module can read existing frozen role instructions and render target
artifacts in disposable projects. Preserve original source identity files and
external-package source-init refusal. Current baseline check continues to govern
shared records and frozen Cursor roles; candidate fixture checks validate new
runtime behavior separately.

First-stage extracted CLI must remain standalone: dispatch pinned before any
integration import. Keep source detection/bootstrap in Node built-ins. Ordinary
imports resolve lazily relative to executing runtime source, never cwd, arbitrary
environment paths, or candidate checkout files.

Future committed baseline dispatch verifies/extracts its CLI/skill, existing
companions, and the complete closed integration module dependency set from its
own baseSha, rejecting missing, nonregular, unsafe, or out-of-bounds dependencies.
Verify extracted bytes and invoke only that temp runtime outside the repo.
Executable candidate module changes never supply baseline code. Preserve exact
config/templates/adapters comparisons, CLI bootstrap compatibility, and no live
fallback or pinned init. Add integrations/ to package files; keep records,
knowledge, caches, worktrees, and native target entrypoints out of the package.

### Owner implementation map after approval

1. Add the four integration modules and the explicit adapter interface above.
2. Refactor CLI config(), links(), init(), status rendering, check dispatch, and
   createRecord() managed-path classification to consume that interface.
3. Build the full target install/preflight plan before creating/moving/copying
   files, rendering roles, updating AGENTS, or creating discovery links.
4. Keep standalone source protection and extend future pinned extraction without
   loading integration code before immutable extraction/verification.
5. Refactor shared skill delegation guidance to select adapter-specific native
   guidance while maintaining one gate/role policy. Keep frozen legacy role files
   unchanged; do not duplicate policy into competing platform instruction copies.
6. Update README, package files inclusion, and focused CLI/package fixtures.
7. Verify source companion file sets/bytes against the ARC baseline before review.

Acceptance evidence includes Cursor install/re-init/model-sync/migration regressions;
additive selection/idempotence/config-extension preservation; fixture-only second
adapter; whole-target snapshots for preflight failures; install/check/new-ARC
managed-path agreement; packed independent installation; standalone CLI bootstrap;
missing/nonregular/unsafe committed dependencies; ignored/tampered candidate
modules never executing as baseline; original-baseline structural check and
separate candidate fixtures. Run npm test and git diff --check in the actual
approved owner worktree. Completed implementation/review evidence is below.

Owner receives exact starting SHA, locked decisions, reviewed revision, approval
evidence, dependency state, absolute worktree/authoritative record paths, and
verified baseline command procedure. Do not stage/commit/push/merge/edit records,
run candidate governance on this ARC, init this real source checkout, or invoke
Codex for WS-03. After independent code review, provide disposable Cursor
install/refresh/status/check UAT with expected results. No server is required.

## Handoff

Final engineering specification: [WS-03 owner handoff](../.harness/knowledge/ws03-owner-handoff.md).
It supplies configuration/artifact shapes, module inventory, exact starting SHA,
branch/paths, file/function map, baseline procedure, fixtures/check commands,
and UAT requirements. This completes the pre-launch plan-review notes.

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
User approved IMPLEMENT revision 2 with "start 03". The final engineering
handoff is required before owner launch; commit/merge/push remain unauthorized.

Detailed owner steps after approval:

1. Map every Cursor-specific branch and path in the CLI and instructions.
   Produce a small before/after mapping showing which responsibilities stay
   shared and which move behind the adapter contract.
2. Return unresolved behavior decisions to the orchestrator: additive installation
   command/default behavior; version-1 configuration migration and per-platform
   role-specific settings; capability requirements and failure behavior. Preserve
   the locked coexistence policy and Codex CLI-only scope.
   Do not turn recommendations into accepted product behavior.
3. Before any edits, demonstrate how this source ARC remains governed by its
   original baseline when candidate adapter/configuration files differ. The
   baseline compares all companions and their file set. No candidate dispatcher,
   changed baseSha, weaker comparison, or pinned init may govern this ARC.
   If the proposed merge is incompatible, return the conflict for an explicit
   planning decision before implementation.
4. After decisions, review, and IMPLEMENT approval, implement the smallest
   contract that lets Cursor use the same extension path as later adapters.
   Centralize managed paths so installation, collision checks, validation, and
   new-ARC dirty-file classification agree.
5. Preserve preflight refusal before writes, unrelated instructions/files,
   re-init idempotence, knowledge/configuration/records, and committed source
   identity. Do not make Cursor artifacts the universal source-identity rule.
6. If extracting executable modules, explicitly include and verify every baseline
   runtime dependency in ephemeral governance extraction and package contents.
   Test future baselines separately; never use candidate modules for this ARC's
   governing CLI.
7. Add regression coverage for user-visible contract behavior and run the full
   existing package/CLI suite. Report concrete before/after results for review.

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
- Make platform integrations modular; add Codex before Claude Code.
- Use GPT-6.1 Sol High for orchestration/review and GPT-6.1 Sol Low for owners,
  with detailed orchestrator handoffs.

Repository conventions: shared Markdown records/gates; external WS worktrees;
independent review; explicit implementation/integration approval; source governance
pinned to ARC baseSha. Existing shipped Grok defaults are not changed by this
session's agent assignments.

Open decisions for WS-03: none. Independent revision 2 plan/RESEARCH review
PASS-with-notes; user IMPLEMENT approval is now recorded below.

CLI flag names and configuration map keys are implementation proposals, not new
user behavior decisions. Candidate Codex artifact discovery and version-floor
verification remain WS-04 prerequisites. Claude model choices remain in WS-05.

The user decisions above are locked. Revision 2 is independently reviewed
PASS-with-notes. User approved revision 2 IMPLEMENT; complete the engineering
handoff before owner launch. No commit/merge/push is authorized.

## Independent plan review

2026-10-13 · GPT-6.1 Sol High · ARC revision 2 plan review: PASS-with-notes.
WS-03 revision 2 RESEARCH review: PASS-with-notes, awaiting-user-go. The earlier
DEFER is resolved by the user selecting all-platform status and incorporation of
the handoff invariants. No consequential user choice remains for WS-03. Its gate
remains RESEARCH until explicit IMPLEMENT approval.

Required handoff invariants, incorporated into this draft:
- Active platform identity comes from explicit native startup/invocation guidance,
  not the installed set. startupGuidance identifies the --platform selector and
  native delegation instructions. Ask for clarification if identity is missing.
- status/check selectors must identify registered, installed integrations; they
  never install/migrate. Always validate shared records/configuration even when
  filtering native artifact checks.
- Preserve state/local/cache as well as configuration/knowledge/records and all
  unrelated user artifacts. Opaque unknown settings are not requests to install
  unknown platforms; preserve them. Requested unsupported installations fail.
- Resolve every integration import from the verified extracted runtime. Closed
  dependency inventory/registry must never come from cwd/candidate files, arbitrary
  environment paths, or unextracted packages.
- Before Low-effort owner launch, supply the final config/artifact data shapes and
  exact selector/error fixture commands. These are engineering specifications
  within the reviewed behavior; do not delegate vague choices to the owner.

WS-04 must distinguish Codex orchestrator High configured intent from its actual
native runtime. Provide explicit native launch/config guidance and verify role
model/effort behavior without overwriting user Codex configuration. No runtime
model verification or native UAT is claimed.

## Gate

Current: `MERGED`. Revision: 2. User accepted reviewed CLI evidence and
authorized code/record commits and WS-to-ARC merge. Integrated ARC npm test
36/36 PASS; original-baseline structural check PASS. Native Cursor/model
verification remains outside the evidence recorded here.
Next: User tests reviewed revision 2 from WS worktree or chooses delegated CLI UAT/waiver; then separate acceptance and commit/WS-to-ARC approval.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-10-13 | 2026-10-13 | PASS-with-notes; user go |
| IMPLEMENT | 2026-10-13 | 2026-10-13 | ready-for-review |
| REVIEW | 2026-10-13 | 2026-10-13 | CHANGES-REQUESTED |
| IMPLEMENT | 2026-10-13 | 2026-10-13 | review fixes ready |
| REVIEW | 2026-10-13 | 2026-10-13 | PASS |
| USER CONFIRM | 2026-10-13 | 2026-10-13 | user accepted revision 2 |
| MERGED | 2026-10-13 | — | ARC smoke PASS |

## Baseline compatibility research

2026-10-13 · Independent reviewer, GPT-6.1 Sol High · Read-only research;
this is not a plan-review PASS. The original baseline's pinned status/check
succeeded with seven structurally valid records.

- Baseline `pinned()` freezes every existing config/templates/adapters path and
  byte, not just Cursor files. New source adapter files in that frozen subtree
  would fail governance after a merge. Source config and Cursor role files must
  remain unchanged throughout this ARC.
- A genuinely new executable integration-code directory can be added without
  changing frozen companions: the original governing CLI never reads or imports
  candidate code there. Existing companion responsibilities must not be relocated
  into that directory to evade comparison.
- Proposed modular route: candidate-only `.harness/integrations/` modules with
  source-relative lazy imports; installed artifacts generated into disposable or
  normal target repositories. This route remains subject to plan review.
- Future baselines require complete regular committed module verification and
  extraction from their own baseSha. The first extracted CLI must remain standalone
  through pinned dispatch; the inner runtime may import only its verified extracted
  modules, never modules from the current checkout.
- Preserve source package identity, legacy required Cursor files, and exact
  config/templates/adapters checks. Include modules in package contents and test
  bootstrap/module tampering in disposable source fixtures.

Evidence: committed baseline CLI `pinned()` lines 337-362 (file set and bytes),
lines 371-377 (runtime extraction), `isPackageSourceCheckout()` lines 62-77,
and `check` lines 393-396. CLI/skill regular blobs and full ancestor SHA verified.
The planner is preparing the contract against these constraints; no exemption or
candidate-governed approval is proposed.

## Verification

Post-merge ARC verification, 2026-10-14T06:26:17.770Z: npm test 36/36 PASS
(~257.8s), original independently extracted baseline check seven valid records,
and config/templates/adapters unchanged against full base SHA. Code/records
committed and WS merged into ARC; no ARC-to-main merge or push.

Orchestrator final merge-readiness CLI smoke, 2026-10-14T06:17:47.932Z: PASS in an OS
temporary disposable repository. Explicit install, installed-CLI refresh, opaque
configuration/knowledge/unrelated instruction preservation, configured status,
and zero-record structural check passed. Original-baseline check also reports
seven valid records. This is independent readiness verification, not a recorded
user testing choice or acceptance; native Cursor runtime remains unverified.

Independent GPT-6.1 Sol High re-review, 2026-10-14T05:57:33.008Z: PASS on revision 2.
Reviewer ran npm test 36/36 PASS (~58.6s), diff check PASS, unchanged empty index,
and verified all eight frozen companion files/bytes. Previously failing nested
copy conflicts now refuse before mutation; commented outside import now rejects
before executing sentinel; authoritative model-summary guidance is consistent.
Restricted dependency-language limitations are documented; no sandbox claim.

### User testing handoff — revision 2

Node.js 20+ and Git are required and available. This is CLI/package work; no
server or port applies. Changes run directly from the exact WS worktree, with
no staging, commits, copies into the ARC/main checkout, or native model call.

Self-test:
```sh
cd /Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-03--modular-adapter-foundation
npm test
```
Expected: all 36 tests pass. The fixture suite covers Cursor install/re-init,
v1/v2 model/configuration preservation, additive fixture-adapter selection,
all-platform configured status/shared records, no-mutation refusals, package
independence, and immutable baseline module dispatch. No Codex/Claude product
support is installed by this workstream.

Optional disposable manual CLI UAT:
```sh
set -e
ws03_uat=$(mktemp -d /private/tmp/dev-harness-ws03-uat.XXXXXX)
cd "$ws03_uat"
git init -q -b main
git config user.name 'WS03 Tester'
git config user.email 'ws03@example.invalid'
git commit --allow-empty -qm 'Disposable UAT'
node /Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-03--modular-adapter-foundation/dev-harness/.harness/cli.mjs init --platform cursor
node dev-harness/.harness/cli.mjs init
node dev-harness/.harness/cli.mjs status --platform cursor
node dev-harness/.harness/cli.mjs check --platform cursor
```
Expected: Cursor startup guidance; version 2 explicit selection; successful
refresh retaining settings; configured Grok orchestrator display; and
`Valid: 0 records. Structural validation only.` Use cwd-based init to avoid the
existing macOS /var-versus-/private/var explicit-target alias restriction.
Only the disposable repo receives initialization. Do not initialize actual
source checkouts from an external package or use candidate governance on this ARC.

Offer self-testing, delegated disposable CLI UAT, or explicit testing waiver.
User subsequently accepted the reviewed CLI evidence and revision 2 with
"ok merge"; the acceptance and exact Git scope are recorded in Approvals.
Obtain explicit reviewed-revision acceptance and separately named commit/WS-to-ARC
approval after the chosen testing handoff. No merge/push/worktree cleanup is
currently authorized. Native Cursor execution/model selection remains untested.


Owner-reported revision 2 corrections, 2026-10-14T05:53:12.091Z: npm test 36/36 PASS
(original 25 retained), diff/frozen/index scans PASS. All three findings have
regressions: outside-import sentinel stays unexecuted; recursive existing/legacy
copy conflicts preserve target/stale CLI; model guidance uses v1/v2 authority.
Restricted module syntax and its limitations are documented. Independent
re-review pending; native runtime/model and user acceptance are not claimed.

Independent code reviewer, 2026-10-14T05:44:34.076Z: CHANGES-REQUESTED on revision 2.
Reviewer ran npm test 33/33 PASS, diff check PASS, unchanged index, and verified
all eight frozen companions against baseline. Additional disposable probes found:
1. Commented absolute static import passed the regex scan and executed outside
   the committed integration tree during extracted pinned status.
2. Nested templates/workstream.md directory and skills/dev-harness file conflicts
   failed refresh after target cli.mjs was overwritten; nested source/destination
   types must be preflighted before mutation.
3. Shared skill summary and early refresh/model guidance still used compatibility
   config.models instead of v2 adapter settings/all-platform configured display.
Fix all three with meaningful regressions; no native UAT or acceptance is claimed.


Owner-reported revision 2 checks, 2026-10-14T05:38:24.870Z: npm test 33/33 PASS (original
25 retained), strengthened preserved-path collision regression PASS, diff check
PASS, unchanged index, no frozen companion changes/extras. Disposable CLI
install/re-init/status/check PASS. Native Cursor runtime/model identity was not
verified. Preliminary explicit macOS /var-alias target UAT hit existing strict
Git-root comparison before writes; cwd-based UAT succeeded, with no scope change.
Orchestrator original-baseline structural check: seven valid records.
Independent review issued CHANGES-REQUESTED; the owner is fixing the findings.


Planned checks; none of these implementation checks has been run for this draft:

- Disposable Cursor install/re-init preserves the current workflow and existing
  config, records, knowledge, unrelated entrypoints, and agents.
- Entry-point collisions and invalid settings fail before mutation.
- Existing record creation, status, branch/worktree, source-init protection, and
  baseline pinning regressions continue to pass.
- Package contents include all runtime dependencies; installed-package tests work
  without the source checkout.
- New adapter registration can use the contract without new Cursor-specific
  branches in shared workflow operations.
- Execute npm test and git diff --check from the approved WS worktree; governing
  structural checks use the independently extracted original baseline CLI.

No application server is required for this CLI/package work. After independent
code-review PASS, offer exact fixture commands and platform-specific manual UAT
from the actual WS worktree before asking for acceptance of the reviewed revision.

## User confirm checklist

- [x] Cursor behavior remains verified through the adapter contract.
- [x] Adapter responsibilities, capabilities, and managed paths are explicit.
- [x] Shared workflow policy and role responsibilities remain consistent.
- [x] Configuration migration and source governance follow approved decisions.
- [x] User confirms reviewed revision 2 and separately authorizes WS-to-ARC merge.

## Approvals

- 2026-10-14T06:19:42.740Z · User · "ok merge" accepts reviewed revision 2 after review,
  36/36 tests, and final disposable CLI smoke. Authorizes code/ARC/WS record
  commits, WS-to-ARC merge, and ARC smoke checks. No ARC-to-main merge, push,
  or branch/worktree cleanup is authorized.

- 2026-10-14T05:57:33.008Z · Independent reviewer · Revision 2 code re-review PASS. USER
  CONFIRM entered; user testing/acceptance and Git integration remain pending.

- 2026-10-14T05:27:28.768Z · User · "start 03" authorizes WS-03 reviewed revision 2 IMPLEMENT
  and its isolated branch/worktree. No commit, merge, push, or WS-04/05
  implementation approval was given.

- 2026-10-13 · User authorized WS record creation and the development-agent
  model/effort assignments above.
- Revision 2 is a draft in RESEARCH. No implementation, commit, merge, push,
  or reviewed-revision acceptance has been authorized. Independent revision 2
  plan/RESEARCH review is PASS-with-notes, superseding the earlier DEFER.
- 2026-10-14T05:22:34.229Z · Independent reviewer · WS-03 revision 2 RESEARCH PASS-with-notes;
  implementation still requires explicit user go. Owner handoff notes above must
  be completed before delegation. WS-04/05 are not reviewed by this verdict.

## Progress ledger

- 2026-10-14T04:41:24.136Z · Soner Can · Created.
- 2026-10-14T04:44:13.671Z · Orchestrator · Drafted revision 1 scope, dependencies, detailed owner guidance, and user-requested agent assignments. RESEARCH review pending; no implementation.

- 2026-10-14T04:50:49.728Z · Orchestrator · Recorded user decisions: coexistence, Codex CLI-only, explicit additive installation, and installed Codex per-role model/effort defaults. Draft remains unreviewed in RESEARCH; no IMPLEMENT authorization.

- 2026-10-14T04:54:02.116Z · Independent reviewer · Baseline compatibility research completed; lazy candidate-only modules are viable with frozen companions and verified future extraction. No plan-review verdict or implementation.
- 2026-10-14T04:58:55.320Z · Planner · Draft adapter contract and owner edit map returned; orchestrator saved revision 2. Multi-platform status choice and independent plan review pending; RESEARCH remains open.

- 2026-10-14T05:02:27.910Z · Independent reviewer · Revision 2 plan review DEFER: single remaining user choice is unqualified multi-platform status display. Technical route viable; handoff invariants recorded. No IMPLEMENT approval.

- 2026-10-14T05:20:18.490Z · User/Orchestrator · User selected all installed integrations for unqualified status. Decision and display scope recorded; final WS-03 revision 2 plan review requested. No IMPLEMENT authorization.

- 2026-10-14T05:22:34.229Z · Independent reviewer · ARC revision 2 plan and WS-03 revision 2 RESEARCH review PASS-with-notes. No WS-03 consequential user choices remain. Awaiting-user-go; no implementation, commit, merge, or push authorization.

- 2026-10-14T05:27:28.768Z · User/Orchestrator · User "start 03" accepted reviewed revision 2 IMPLEMENT. Approval recorded before entering IMPLEMENT; RESEARCH exited, IMPLEMENT entered. No code result yet.

- 2026-10-14T05:29:25.690Z · Orchestrator · WS branch/worktree created from ARC @ 718d5b4; final engineering handoff completed before Low owner launch. No implementation result, staging, commit, merge, or push.

- 2026-10-14T05:38:24.870Z · Owner/Orchestrator · Owner revision 2 implementation ready in five edited and four new runtime module files, unstaged. Owner-reported 33/33 tests and diff/UAT checks PASS; IMPLEMENT exited, independent REVIEW entered. No code commit or merge.

- 2026-10-14T05:44:34.076Z · Independent reviewer/Orchestrator · Revision 2 code review CHANGES-REQUESTED: closed-import bypass, nested-copy partial mutation, and obsolete summary guidance. REVIEW exited; IMPLEMENT re-entered under existing approval. No scope change or Git integration.

- 2026-10-14T05:53:12.091Z · Owner/Orchestrator · Three code-review corrections completed, owner checks 36/36 PASS. IMPLEMENT exited; High re-review opened on same unstaged worktree/revision2. No staging, commit, merge, push, or user acceptance.

- 2026-10-14T05:57:33.008Z · Independent reviewer/Orchestrator · Revision 2 re-review PASS, independently verified 36/36 tests and all three corrections. REVIEW exited; USER CONFIRM entered. Exact worktree/self-test/disposable UAT handoff recorded; no user testing choice or acceptance yet. No staging, commit, merge, or push.

- 2026-10-14T06:17:47.932Z · Orchestrator · Final disposable CLI merge-readiness smoke PASS; source baseline structural check PASS. USER CONFIRM remains pending explicit acceptance/commit/WS-to-ARC authorization. No code or Git integration changed.

- 2026-10-14T06:19:42.740Z · User/Orchestrator · User "ok merge" accepted reviewed revision 2 and approved code/record commits, WS-to-ARC merge and smoke checks. USER CONFIRM remains until actual merge; no ARC/main/push/cleanup approval.

- 2026-10-14T06:26:17.770Z · Orchestrator · Accepted records committed df5c69eb02a589c9fa9b062b79f788b6f7822a3f; reviewed code committed 8629ababdf9949b797b2d1c1b143da0446e0f2e7; WS-to-ARC merge 6394b4807544b20842aba6748bdbe86ca36a6018. Integrated ARC npm test 36/36 PASS, original-baseline check seven valid records, frozen companions unchanged. USER CONFIRM exited; MERGED entered. No main merge/push/cleanup.
