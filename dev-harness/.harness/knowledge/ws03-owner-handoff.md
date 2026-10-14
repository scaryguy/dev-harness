# WS-03 revision 2 implementation handoff

Authorization: user "start 03" on 2026-10-13. Implement WS-03 revision 2 only.
Independent ARC plan and WS-03 RESEARCH review: PASS-with-notes.
Owner: gpt-6.1-sol, low reasoning effort. Reviewer: gpt-6.1-sol, high.
Initial implementation authorization excluded Git integration. User subsequently
approved orchestrator-managed code/record commits and WS-to-ARC merge with
"ok merge"; push, ARC-to-main integration, cleanup, and WS-04/05 implementation
remain unauthorized. The owner itself performs no Git integration.

## Location and boundaries

Worktree: /Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-03--modular-adapter-foundation
Branch: ws/WS-soner-can-03--modular-adapter-foundation
Starting parent/HEAD: 718d5b4f3729df96761ef99b63adbcfec2013bae
Parent ARC: arc/2026-10-13-soner-can--modular-coding-agent-support
Authoritative record:
 /Users/scaryguy/Projects/dev-harness/dev-harness/workstreams/WS-soner-can-03--modular-adapter-foundation.md
Authoritative ARC:
 /Users/scaryguy/Projects/dev-harness/dev-harness/arcs/2026-10-13-soner-can--modular-coding-agent-support.md

Read these authoritative documents and this handoff; worktree record copies are
not authoritative. Verify own branch, starting SHA, status/index before editing.
Keep all implementation edits in the worktree. Only orchestrator edits records.

Allowed implementation files: CLI, CLI tests, shared SKILL.md, new integrations/
runtime code, README, package.json. Source config.json/templates/**/adapters/**
are frozen and must have unchanged paths and bytes. Do not edit AGENTS.md or
old ARC/WS records, model defaults outside the approved behavior, or dependencies.
No Codex/Claude adapter product module in WS-03. A fixture adapter exists only
inside disposable test targets. Node 20+ and built-ins only.

## Behavior to implement

1. A closed built-in adapter registry registers Cursor only. New platforms add
   one module and registry entry; core CLI/workflow operations gain no native
   platform branches. Keep shared record/gate/approval/Git/worktree policy.
2. init [repository] [--platform ID]... is explicit and additive. A fresh
   unqualified init selects Cursor; fresh explicit init selects only requested
   platforms. Existing v1 installation means Cursor is installed. Existing
   unqualified init refreshes installed integrations; explicit selections union
   into that set. Repeated flags/init are idempotent. Unknown selections error
   before writes. No native program/model/authentication is invoked at install.
3. status/check accept at most one --platform ID. Reject malformed flags,
   duplicate selectors, unknown or registered-but-not-installed IDs without
   writes. Plain status shows all installed configured orchestrator models,
   shared records once. A selector narrows models/native artifact checks only;
   shared record/config validation still runs. Label models as configured.
   Keep legacy one-Cursor status output compatible wherever practical.
4. Preserve all existing user config/model/Git/check/extension values; knowledge,
   records, state/local/cache, unrelated instructions and native files. Keep
   standard init refresh of owned built-ins. Refuse unowned native entrypoints,
   malformed markers, unsafe/symlinked parents, migration/schema conflicts,
   invalid settings, cross-adapter collisions before first write/mkdir/move.
   Do not adopt/delete user files.
5. Required unavailable models/reviewers/capabilities stop dependent workflow
   steps; no model downgrade or owner self-review. Parent permissions unchanged.

## Concrete config engineering specification

Read v1 and v2 without writes on ordinary commands. v1 validates as today and
normalizes to Cursor in memory, mapping models.orchestrator unchanged to the
orchestrator and models.subagents unchanged to planner/reviewer/owner.

Use version=2, installedPlatforms (unique ordered IDs), adapters map keyed by ID,
adapters[ID].models map with orchestrator/planner/reviewer/owner setting objects.
A setting has model:string and adapter-specific optional effort:string.
Cursor model strings remain opaque, including their existing embedded effort
syntax; do not parse/substitute/split them or require a separate effort field.
Cursor adapter validates only its supported shape. Native settings live in their
adapter module, not platform branches in the generic config code.

Migration is performed only by explicit additive init. Copy the original
configuration, preserve all legacy top-level platform/models/unknown fields as
compatibility data, change version, and add installedPlatforms/adapters.
The version2 adapters map is authoritative for native rendering/status; document
where to edit v2 settings. Preserve legacy nested/unknown model values as part
of the unchanged original models object. Refuse an original extension collision
with installedPlatforms/adapters rather than discarding it.
Existing version2 settings always win over defaults; unknown adapter settings
are preserved opaque data, not installation requests. An unknown requested
platform or unsupported installed ID must fail clearly without mutation.
No automatic uninstallation or destructive cleanup.

Fresh Cursor-only unqualified installs/re-init should retain v1 to preserve
current users/tests. Explicit selection may create v2. Shipped source config
remains v1 and supplies Cursor defaults only; it does not imply an existing
installation in a fresh target. Core install plans determine installed state
from the target's current initialized config, not source defaults.

WS-04 will add Codex defaults: gpt-6.1-sol high for orchestrator/planner/reviewer,
low for owner. Do not register/install Codex in WS-03.

## Module/artifact engineering specification

integrations/registry.mjs exports built-in adapters and lookup; Cursor module
owns its paths/defaults/rendering/validation/guidance. integrations/config.mjs
owns pure normalization and additive config planning. integrations/install.mjs
owns aggregate planning/preflight and generic file operations.

Adapter fields/methods:
 id, label, defaults, capabilities;
 validateSettings(settings);
 planArtifacts(context);
 checkArtifacts(context);
 startupGuidance(context).
context includes target repo root, executing runtime source root, normalized
settings for this adapter, and its ID. Never resolve runtime source files from
target cwd or environment override paths.

planArtifacts returns a serializable plan with:
 files: [{path, content, ownership:"builtin"}]
 links: [{path, target, type:"file"|"dir", legacyTargets:[]}]
All paths are repository-relative, normalized, contained, nonempty; generated
files must be inside dev-harness/.harness. Link target refers to a contained
internal generated/shared artifact; write the relative link destination.
Use one declaration source for install/check and createRecord managed paths.
Methods plan without writes; aggregate all selected/installed plans first.
Preflight all artifacts, parents, shared AGENTS marked block, internals migration,
and settings before mutating. Preserve legacy link migrations as existing.
Render target Cursor role files from the unchanged source legacy role bodies;
settings may alter target model frontmatter but never source companions.
Generate new templates/native content from integration code without relocating
source frozen companion duties or duplicating shared gate/role policy.

Startup guidance explicitly names --platform cursor and native delegation paths.
Shared skill must not infer active platform from installed set; it receives
explicit invocation/startup context, or asks if platform identity is unclear.
Structural capabilities are not observed runtime support. Do not claim model
picker identity or native UAT. Existing Cursor roles remain actual shared bodies.

## CLI/bootstrap/dependency map

Refactor config(), links(), init(), status(), check dispatcher and createRecord()
managed-path classification into generic registry-driven calls. Keep records(),
identity/gates/approval/branch behavior shared. Keep source guard early and
based on committed identity; preserve historical/newer source-init refusal.
Preserve legacy .harness migration and all known reserved files, incorporating
new runtime code into install copy/refresh while preserving local data.

The absolute CLI must execute pinned dispatch while extracted alone. No
top-level integration import or descriptor read. Lazy-load modules only for
ordinary command paths from fileURLToPath(import.meta.url)'s runtime directory.

The future baseline's standalone pinned path lists committed integration files
from its own baseSha under the fixed integrations/ root; requires registry.mjs,
config.mjs, install.mjs, cursor.mjs, verifies all regular .mjs blobs and bytes,
and extracts the whole closed module set alongside CLI/skill/legacy companions
before starting its inner ordinary CLI. Keep all executable module dependencies
inside this fixed root or Node built-ins. Reject missing/nonregular/unsafe
committed dependencies; no environment/cwd paths or third-party import.
Registry/inventory comes from the trusted SHA, never current candidate code.
Live executable module changes do not supply baseline code; actual code used is
the extracted committed version. Preserve exact live config/templates/adapters
file-set/byte checks, regular blob validation, no fallback, no pinned init,
temporary-outside-repository checks, and bootstrap marker compatibility.
Add integrations/ to package files; no records/knowledge/native user entrypoints
or owner worktrees in the npm tarball.

For real ARC governance, only orchestrator uses the independently extracted
original baseline CLI with cwd /Users/scaryguy/Projects/dev-harness. Request a
structural check from orchestrator; do not run candidate status/check/pinned/init
on this actual ARC. Candidate CLI/pinning tests run only in disposable fixtures.

## Verification and report

Run from exact owner worktree:
 npm test
 git diff --check
 git diff --name-only 718d5b4f3729df96761ef99b63adbcfec2013bae -- dev-harness/.harness/config.json dev-harness/.harness/templates dev-harness/.harness/adapters
Last command must print no frozen companion changes (also check untracked extras).

Retain all existing 25 regressions. Add meaningful fixtures for:
- pure v1 reads/status/check no config rewrite;
- explicit/additive/multiple/repeated flags and a fixture-only second registered
  adapter, no shared core platform branch; fresh selection has no implicit Cursor;
- migration preserving models/Git/checks/extensions/state/local/cache/knowledge/
  records/unrelated instructions, with schema conflicts rejected before writes;
- whole-target snapshots for malformed flags/unknown/uninstalled selection,
  occupied files/dirs, symlinked parent, unsafe path, and plan collisions;
- generic status all configured models and shared records once; selected check
  still rejects shared record/config errors;
- declarations agree across install/check/new-ARC managed-path classification;
- packed installation with runtime modules independent of source checkout;
- first-stage baseline CLI extracted alone, future module extraction/source-relative
  imports, missing/unsafe/nonregular base module rejection, candidate module
  tampering/additions never being loaded as governing baseline code;
- current old baseline governs the real source ARC unchanged.

You may update fixture assumptions only where reviewed additive/v2 behavior
changes them; don't weaken prior source/pinning tests. No real Codex invocation
or network dependency install is needed. Do not assert per-function mirror tests
as acceptance evidence.

## Code-review correction requirements

The first independent code review requested three corrections within revision 2:
recursive source/destination type preflight before refresh/migration writes;
authoritative v1/v2 model-summary and early startup guidance; and complete
restricted dependency-grammar validation before future inner-runtime execution.

The approved engineering approach uses Node's no-execution syntax check plus a
conservative tokenizer for the integration modules. Ordinary quoted strings and
comments are distinguished from code. Supported semicolon-terminated static
imports/re-exports use unescaped quoted specifiers that name real node: built-ins
or regular committed relative .mjs files in the closed integration inventory.
Dynamic imports, templates/backticks, code slash/regex/division tokens, escaped
identifiers, attributes, and unsupported forms reject before the inner runtime.
Module implementations use concatenation and RegExp constructors instead.
This validates the declared dependency language; it is not a sandbox for trusted
committed code using eval/Function/filesystem execution tricks.

Required regressions cover commented static/dynamic imports, inert import-like
strings/comments, template interpolation, escaped specifiers, outside re-exports,
invalid built-ins, accepted supported import/re-export syntax, and sentinel proof
that rejected input has no module side effects. Nested-copy conflict snapshots
include stale target CLI content so partial overwrites are observable, in both
current and legacy target layouts. No new product behavior or permission policy
is authorized by these corrections.

Report exact worktree/starting SHA/revision; files and behavior changed;
commands actually run and results; remaining concerns; executable disposable
Cursor install/re-init/status/check UAT commands with expected outcomes.
No server applies. Leave code unstaged for independent High review and user UAT.

