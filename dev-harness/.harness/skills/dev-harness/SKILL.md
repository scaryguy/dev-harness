---
name: dev-harness
description: Start, plan, implement, review, or resume repository work using Dev Harness arcs, workstreams, and gates.
---

# Dev Harness

## Source-repository ARC bootstrap

This section applies only when this package's source checkout is on an `arc/*`
branch. The ARC record's full `baseSha` pins governance from ARC creation through
final approval. Validate the SHA as an ancestor commit and the CLI/skill as
regular committed blobs. Read the baseline skill with
`git show BASE_SHA:dev-harness/.harness/skills/dev-harness/SKILL.md` before
following any live instructions.

For **every** source ARC, independently extract its committed baseline CLI to an
OS temporary directory verified outside the repository, and verify the extracted
bytes against Git **before invoking any dispatcher**. Always invoke that absolute
baseline path with cwd at the ARC checkout. Never invoke the live candidate CLI's
`pinned` dispatcher for governance: candidate changes can replace that dispatcher
as well as the commands it dispatches. There is no live fallback.

When the baseline already supports pinning, use the independent bootstrap below.
From the ARC checkout, set `DEV_HARNESS_BASE_SHA` to the exact full SHA from its
record. Run this code with `node --input-type=module - pinned skill` (provide the
code on stdin); read the skill it prints. Repeat the same independent bootstrap
for each invocation, replacing the arguments with `pinned status`, `pinned check`,
or `pinned new workstream ARC_ID "Title"`. This code uses Git and Node built-ins
only; it must not import, execute, or extract from the candidate CLI.

```js
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const sha = process.env.DEV_HARNESS_BASE_SHA;
const git = args => execFileSync('git', args, { cwd: root });
if (!/^[0-9a-f]{40}$/.test(sha || '')
    || git(['cat-file', '-t', sha]).toString().trim() !== 'commit') throw Error('Invalid full baseline commit SHA.');
git(['merge-base', '--is-ancestor', sha, 'HEAD']);
function blob(path) {
  if (!/^100(?:644|755) blob /.test(git(['ls-tree', sha, '--', path]).toString())
      || git(['cat-file', '-t', `${sha}:${path}`]).toString().trim() !== 'blob') throw Error(`Invalid baseline blob: ${path}`);
  return git(['show', `${sha}:${path}`]);
}
blob('dev-harness/.harness/skills/dev-harness/SKILL.md');
const cli = blob('dev-harness/.harness/cli.mjs');
if (!/^const pinnedRuntimeVersion = 1;$/m.test(cli.toString())) throw Error('Older baseline: use manual verified governance.');
const args = process.argv.slice(2);
if (args[0] !== 'pinned' || args[1] === 'init') throw Error('Use pinned governance; init is forbidden.');
const temporaryRoot = realpathSync(tmpdir());
const fromRepo = relative(realpathSync(root), temporaryRoot);
if (!fromRepo || (!fromRepo.startsWith(`..${sep}`) && fromRepo !== '..')) throw Error('Temporary directory must be outside repo.');
const temporary = mkdtempSync(join(temporaryRoot, 'dev-harness-baseline-dispatcher-'));
try {
  const baselineCli = join(temporary, 'cli.mjs');
  writeFileSync(baselineCli, cli, { flag: 'wx' });
  if (!readFileSync(baselineCli).equals(cli)) throw Error('Extracted CLI differs from Git.');
  const result = spawnSync(process.execPath, [baselineCli, ...args], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally { rmSync(temporary, { recursive: true, force: true }); }
```

Future modular baselines also verify and extract their complete committed
`integrations/` module dependency set; no candidate module supplies runtime code.
The initial extracted CLI remains standalone through pinned dispatch.
Integration authors must use the documented restricted module language: static
semicolon-terminated imports/export-from declarations with unescaped quoted
specifiers; no templates, regex literals, slash operations, escaped or non-ASCII
code identifiers, dynamic imports, import.meta, or import attributes. Comments
between tokens and Unicode within strings/comments are allowed. Use concatenation
and `new RegExp(...)`. Node syntax-checks committed modules without executing
them; dependencies must be real `node:` built-ins or relative `.mjs` files in the
verified committed integration inventory. Unsupported syntax fails closed.
Dependency validation is not a sandbox for deliberately executable eval,
Function, or filesystem behavior in trusted committed code.

The committed dispatcher validates the ARC record against the branch, verifies
live config/templates/adapters byte for byte and as a file set before commands
that read them, and runs committed governance from another temporary runtime
outside the repository, with cwd at the ARC checkout. Any invalid or changed
input stops the command. Never run `pinned init`; test candidate `init` only in
disposable Git repositories.

If an ARC's `baseSha` predates pinned support, validate the full SHA with
`git cat-file -t BASE_SHA` (must print `commit`), verify
`git merge-base --is-ancestor BASE_SHA HEAD`, and verify regular CLI/skill blobs
with `git ls-tree BASE_SHA -- PATH` (mode `100644` or `100755`, type `blob`).
Read its skill from Git before live instructions, then explicitly extract the
baseline `.harness` runtime into an OS temporary directory verified outside the
repository and verify its bytes against Git. Before each direct baseline command,
compare live config, templates, and adapters against the baseline tree, including
missing or extra files; reject symlinks and stop on any difference. Run the absolute
extracted baseline CLI path with cwd at the ARC checkout. Never invoke candidate
`pinned` support to govern an older ARC.

This is an operational rule: mutable source instructions and already published
packages are outside its trust boundary. These source-ARC rules override all
unpinned command and init instructions below, including instructions printed by
a baseline that predates this bootstrap.

Run commands from the repository root. At session start, run
`node dev-harness/.harness/cli.mjs status` and present it once using the summary below,
not the raw CLI output.
Read `dev-harness/.harness/config.json`, `dev-harness/.harness/knowledge/context.md`, and relevant records.
Active platform identity must come from explicit native startup/invocation context;
never infer it from the installed set. Ask if that context is missing. Version 1
uses `models.orchestrator` and `models.subagents`. Version 2 uses authoritative
`adapters[ID].models[ROLE]` settings for that explicit platform; root `models`
is preserved compatibility data. Unqualified status displays every installed
configured orchestrator model and shared records once; `--platform ID` narrows
model display without duplicating or filtering shared records.
Outside a source ARC, after changing authoritative configured role models, rerun
`node dev-harness/.harness/cli.mjs init`.
Check the orchestrator is configured for the requested model. If model identity is not
observable, ask the user to confirm the picker; do not claim it was verified.

## Session summary

Use one fenced plain-text ASCII table per active arc, current user's arcs first.
Show identity and branch once. Display the configured orchestrator from
`models.orchestrator` for version 1, or `adapters[ID].models.orchestrator` for
version 2. Plain status shows all installed models, labeled by integration when
multiple are present; an explicit selector shows that integration. Label each
"Orchestrator: <readable model name> (configured)", never observed runtime identity.
Shared arcs and workstreams appear once regardless of the model display.
Use arc titles and exact statuses, not filenames.
Show the arc owner only when different from the current user. Sort WS rows by sequence;
use short labels such as WS-01, titles, exact gates, and concise next actions.
If owners differ within an arc, add an Owner column so short labels stay unambiguous.
Preserve dependencies and revision numbers; never invent progress or approval.
Align columns with spaces and +-| borders. No repeated Yours or separate Next lines.

```text
Dev Harness | Soner Can | main
Orchestrator: Grok 4.7 High (configured)

Arc: User authentication | in-progress

+-------+----------------------------+--------------+--------------------+
| WS    | Workstream                 | Gate         | Next               |
+-------+----------------------------+--------------+--------------------+
| WS-01 | Local credential sign-up   | USER CONFIRM | Confirm revision 1 |
| WS-02 | Session and protected page | RESEARCH     | Wait for WS-01     |
+-------+----------------------------+--------------+--------------------+
```

This is a format example; populate it from status and the relevant records.
For an arc without active WS rows, show its next action beneath its heading.
If no active records exist, show the header and "No active work. What shall we build?"
Do not save this derived summary as another state file.

## Start and resume

For first use, inspect existing instructions, project structure, and build/test commands.
Record discovered facts in context.md; configure checks and the integration branch.
Ask about unresolved policy choices. Do not overwrite existing project rules.
For ongoing work, read the active arc/workstream and referenced knowledge before exploring.

## Plan and build

1. Clarify before drafting: inspect repository conventions and prior decisions.
   Ask concise questions about unresolved behavior, scope, architecture, or acceptance
   criteria; propose consequential defaults with brief reasoning and request confirmation.
   Wait for answers or explicit "use defaults" before sending the agreed brief to
   `dev-harness-planner`. Do not re-ask choices already established by the user or repo.
   Use `dev-harness-reviewer` to check the plan. Newly discovered consequential choices
   return to clarification, not silent assumptions. Revise on CHANGES-REQUESTED.
2. Immediately after plan-review PASS, run
   `node dev-harness/.harness/cli.mjs new arc "Title"`. This checks out
   `arc/ARC_ID` from the configured integration branch **before writing records**.
   On that arc branch, create or update every planned workstream with
   `node dev-harness/.harness/cli.mjs new workstream ARC_ID "Title"`
   before presenting the plan or waiting for implementation approval.
   Reuse matching records when resuming; do not create duplicates on repeated PASS.
3. Save the reviewed scope, decisions, dependencies, verification, and review outcome.
   Distinguish repository conventions, user decisions, and explicitly accepted defaults.
   Accepting defaults authorizes drafting only, not implementation.
   Keep the arc draft (even though its branch exists) and workstreams in RESEARCH,
   with next action requesting user implementation approval. Run check, then present
   the plan with links to the files.
   Reviewer PASS permits saving the proposal; only user approval locks arc scope.
   Record that approval with actor/date before any WS enters IMPLEMENT.
   Keep uncertain findings explicit. Record user approval only when actually given.
4. After user implementation approval and per-WS RESEARCH review PASS, prepare the
   WS branch and worktree below. No code before both conditions.
   Preserve unrelated changes. Use `dev-harness-owner` in the assigned worktree.
5. Run relevant checks and independent code review. Changes requested return to implementation.
   PASS enters USER CONFIRM; follow the testing handoff below before requesting approval.
   User approval permits only the integration it names.
6. After WS USER CONFIRM, merge only that WS into its arc (merge commit preferred),
   run an arc smoke test, and record merge SHA and result. The arc integrates only
   after its separate checklist, user approval, and integration verification;
   prefer a PR for that final integration. Record the integration SHA.
   Record useful confirmed findings in dev-harness/.harness/knowledge/, linked to the source workstream.

## Decisions and gates

Before IMPLEMENT, resolve or explicitly defer choices affecting product behavior,
permissions, user data/outcomes, or known production gaps. For each unresolved choice,
offer a recommended option and an alternative; the owner may decide only
implementation details that do not change those outcomes. The reviewer flags open
effectful choices. Record locked and open decisions separately; open behavior,
permission, and data choices block IMPLEMENT.
Each WS has a gate, one next action, entered/exited dates, review outcome
(PASS, PASS-with-notes, CHANGES-REQUESTED, DEFER, or SPLIT), and a dated progress
ledger. RESEARCH PASS means `awaiting-user-go`; do not exit RESEARCH until the user
authorizes IMPLEMENT. IMPLEMENT may be `blocked` or `ready-for-review`.
On changes requested, return REVIEW to IMPLEMENT or revise RESEARCH in place.
On SPLIT, link successor WS records; on DEFER, name the future arc if known.
Update WS, parent arc rollup/next action, and status-derived view together after a
confirmed gate change. Log review outcomes and Git SHAs; do not fabricate evidence.
USER CONFIRM requires a concrete, checked acceptance list and user approval of the
reviewed revision. WS MERGED means merged into arc, never the integration branch.

## User testing

After owner implementation and code-review PASS, offer to serve the current unstaged
changes directly from the WS worktree. Never stage, commit, merge, or copy changes
into the user's main checkout just to make testing possible.
Use the project's documented local development command; record it during onboarding.
For projects without a server, offer the equivalent runnable test or manual workflow.
Identify required dependencies and local environment first. Do not expose secrets,
change shared data, or run destructive setup without explicit authorization.
Once the user accepts (or has already authorized the preview), launch it from the
exact WS worktree, on localhost with a free port. Never kill an unrelated server.
Verify readiness and that the preview serves this worktree, not another checkout.
Give the URL (or runnable command), WS revision, and a short test checklist with
expected results. Record the command, worktree, and test instructions in Verification;
keep transient server handles in local state, not tracked records.
If startup fails, report the blocker and keep USER CONFIRM pending; do not imply
the change is test-ready. If the user runs it themselves, provide the exact working
directory and command. They may explicitly waive testing; never assume they did.
Ask for confirmation of the tested revision only after the preview is available or
the user chooses self-testing or waiver. Starting a preview is not approval to merge.
Feedback requiring code changes returns to implementation and independent review
before another testing handoff. Do not stop the preview before testing is finished.

## Branches and worktrees

IDs are the record filenames without `.md`. Create and check out `arc/<arc-id>` from
the configured integration branch after plan-review PASS and before any arc/WS file.
Keep active records on that arc branch, not the integration branch. Only after the
user's IMPLEMENT go, create `ws/<ws-id>` from its parent arc. Reuse existing branches;
never reset them or switch a checkout with unrelated changes.
Put each WS worktree at `<repo-parent>/<repo-name>-worktrees/<ws-id>/`, outside the
repository, even outside its hidden folders. Create it with `git worktree add`;
inspect `git worktree list` before resuming. Never overwrite an occupied path or
substitute another branch. Report a conflict instead.
Record the branch, parent branch, and repository-relative external path in the WS
contract before delegating. Pass the resolved absolute worktree path to the owner.
Keep harness updates in the orchestrator's checkout; any records checked out in
owner worktrees are not authoritative. Supply the authoritative paths explicitly.
Worktree checkouts are local, untracked, and never packaged. Do not delete them
without user approval; check for uncommitted work before any removal.
If WS-B depends on WS-A, wait until A is MERGED into the arc, then branch B from
that arc tip. Independent WSes may branch in parallel. The WS owner resolves WS→arc
conflicts; the arc owner resolves arc→integration conflicts. For long-running arcs,
sync the configured integration branch into arc before branching new work, with
user authorization for the Git operation; never sync it directly into a WS.
After each WS merge, smoke-test the arc and, with approval, clean up the merged WS
branch/worktree after checking for uncommitted changes. After all WSes are merged or explicitly
deferred, verify the arc checklist and get separate user approval to integrate.
Handle hotfixes on the integration branch by recording and syncing them into arc.
Split overgrown WSes into linked successors when independently testable slices emerge
or repeated RESEARCH review exposes scope creep; carry unfinished WSes to a new arc
only with explicit user agreement. Flag stale work as blocked or deferred.

## State and delegation

Each Markdown record's JSON frontmatter owns its identity, gate/status, revision,
and next action. Update progress automatically; update `updated` and append dated history.
Arc filenames: `YYYY-M-D-name--summary.md`. Workstream filenames:
`WS-name-01--summary.md`. Use short descriptive summaries of up to five words.
Create workstreams in plan order. Use the CLI to allocate the next per-user number
from the current checkout, starting at 01. Parallel arc branches may allocate the
same number; the full WS ID identifies the record. Never renumber existing workstreams.
Every workstream must set `arc` to its parent's exact ID and link its arc file in the contract.
Create the parent arc first; validation rejects missing or unknown parents.
Increment revision and re-review when scope or implementation changes invalidate approval.
Record approval in Approvals (workstream) or Decisions (arc); never invent approval or PASS.
Run `node dev-harness/.harness/cli.mjs check` after updates. It checks structure, not approval authenticity.
Do not maintain a separate handwritten index. Use status to derive the rollup.

Use the active adapter's configured role model for every delegation, including exploration.
Platform identity comes from explicit native startup/invocation context, never from
which integrations are installed. If identity is unclear, ask before delegation.
Use `status --platform ID` and `check --platform ID` for that installed integration;
shared records and configuration remain validated. Unqualified status shows all
installed configured orchestrator models and shared records once.
For Cursor, startup context is `--platform cursor`; planner, reviewer, and owner
use `.cursor/agents/dev-harness-{planner,reviewer,owner}.md`. Launch them in the background.
For Codex CLI, follow this only when startup context is explicit `--platform codex`.
Spawn `dev-harness-planner`, `dev-harness-reviewer`, and `dev-harness-owner` by
those names, with no alternate model or effort. Use in-session `/subagents` for
background work. Non-interactive runs use `codex exec` with the configured
orchestrator model and effort. The parent label must show the model and effort
from that role's `.codex/agents` file; if it does not, stop that role. Do not
use owner self-review. Isolate owner work with harness git worktrees, not
`codex --worktree`. If root `AGENTS.override.md` hides the shared Dev Harness
block, stop and report it; do not delete the override.
For Claude Code, follow this only when startup context is explicit `--platform claude-code`.
Spawn `dev-harness-planner`, `dev-harness-reviewer`, and `dev-harness-owner` by
those names, with no alternate model or effort. Stop a role whose parent label
or transcript does not show the configured model and effort. Do not use owner
self-review. Isolate owner work with harness git worktrees. Project `CLAUDE.md`
imports the shared `AGENTS.md` block. If a session still does not load that
block, stop and report it; do not delete ancestor instruction files.
Other adapters supply their own native startup and delegation guidance through
the integration contract. Structural capabilities do not establish observed native
support. If required models, reviewers, or capabilities are unavailable, stop the
dependent step and report it; never downgrade or substitute owner self-review.
Version 2 native settings are authoritative in `adapters[ID].models[ROLE]`; legacy
`models` remains preserved compatibility data. Version 1 uses `models.subagents`.
Pass paths, revision, scope, and existing authorization explicitly. Only the orchestrator
updates harness records. Isolate concurrent code owners with worktrees; never let two
writers edit the same workstream. Detect stale revisions before applying results.
If a required model or reviewer is unavailable, report it and stop that dependent step.

Only arcs/ and workstreams/ stay visible inside dev-harness/; all internals belong
in its .harness/ directory, except external worktree checkouts. External files may contain only necessary
entry-point references. Do not commit, push, or merge without the required explicit approval.
Be brief. Users need only arcs, workstreams, and gates.
