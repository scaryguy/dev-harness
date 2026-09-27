---
name: dev-harness
description: Start, plan, implement, review, or resume repository work using Dev Harness arcs, workstreams, and gates.
---

# Dev Harness

Run commands from the repository root. At session start, run
`node dev-harness/cli.mjs status` and show its output once.
Read `dev-harness/config.json`, `dev-harness/knowledge/context.md`, and relevant records.
After changing the configured subagent model, rerun `node dev-harness/cli.mjs init`.
Check the orchestrator is configured for the requested model. If model identity is not
observable, ask the user to confirm the picker; do not claim it was verified.

## Start and resume

For first use, inspect existing instructions, project structure, and build/test commands.
Record discovered facts in context.md; configure checks and the integration branch.
Ask about unresolved policy choices. Do not overwrite existing project rules.
For ongoing work, read the active arc/workstream and referenced knowledge before exploring.

## Plan and build

1. Discuss the outcome and boundaries. Use `dev-harness-planner`, then
   `dev-harness-reviewer` to check the plan. Present it after PASS; revise on failure.
2. Get user approval before creating the agreed records or implementing.
   Use `node dev-harness/cli.mjs new arc "Title"` and
   `node dev-harness/cli.mjs new workstream ARC_ID "Title"`.
3. Fill scope, decisions, verification, and approvals. Keep uncertain findings explicit.
   Research exits only after plan-review PASS and user implementation approval.
4. Implement on `ws/RECORD_ID` from `arc/ARC_ID`, based on the configured integration branch.
   Resume existing branches; preserve unrelated changes. Use `dev-harness-owner`.
5. Run relevant checks and independent code review. Changes requested return to implementation.
   PASS enters user confirmation. User approval permits only the integration it names.
6. Record merge evidence when a merge actually happens. A workstream merges into its arc;
   the arc integrates only after separate user approval and integration verification.
   Record useful confirmed findings in knowledge/, linked to the source workstream.

## State and delegation

Each Markdown record's JSON frontmatter owns its identity, gate/status, revision,
and next action. Update progress automatically; update `updated` and append dated history.
Increment revision and re-review when scope or implementation changes invalidate approval.
Record approval in Approvals (workstream) or Decisions (arc); never invent approval or PASS.
Run `node dev-harness/cli.mjs check` after updates. It checks structure, not approval authenticity.
Do not maintain a separate handwritten index. Use status to derive the rollup.

Use the configured subagent model for every delegation, including exploration.
The Cursor adapter defines planner, reviewer, and owner; launch them in the background.
Pass paths, revision, scope, and existing authorization explicitly. Only the orchestrator
updates harness records. Isolate concurrent code owners with worktrees; never let two
writers edit the same workstream. Detect stale revisions before applying results.
If a required model or reviewer is unavailable, report it and stop that dependent step.

Keep harness content inside dev-harness/. External files may contain only necessary
entry-point references. Do not commit, push, or merge without the required explicit approval.
Be brief. Users need only arcs, workstreams, and gates.
