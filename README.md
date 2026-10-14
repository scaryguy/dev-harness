# Dev Harness

A shared workflow for humans and coding agents.

Plan an **arc**, split it into **workstreams**, and move through **gates**:
research → implementation → review → user confirmation → merged.

## Install

Requires Node.js 20+. Run inside your project's Git repository:

```sh
npx github:scaryguy/dev-harness init
```

Select **Grok 4.7 · High** in Cursor's model picker. Start a new chat:
“Start dev harness. Let's build …”

The agent shows your Git identity and current work, learns the repository,
and proposes a reviewed plan. You approve implementation and integration.
Say “resume my work” to continue in another session.

## Files and settings

Only `arcs/` and `workstreams/` are visible inside `dev-harness/`.
Internals and repository knowledge live in `dev-harness/.harness/`.
Worktree checkouts stay outside the repository, in `../<repo-name>-worktrees/<ws-id>/`.
`AGENTS.md` and Cursor discovery links are entry points.
Edit `dev-harness/.harness/config.json` or ask the agent to configure it.
Rerun init to refresh built-in instructions; configuration, knowledge, and records are preserved.

## Remove

Delete `dev-harness/`, its marked block in `AGENTS.md`, and its four links
under `.cursor/skills/` and `.cursor/agents/`. For a Codex install, also remove
`.agents/skills/dev-harness` and the three
`.codex/agents/dev-harness-{planner,reviewer,owner}.toml` files.

Initial scaffold: Cursor setup, Codex CLI setup, record creation, status, and validation work.
Gate approvals are agent-managed. Automatic enforcement, Claude Code, and non-CLI Codex surfaces come later.
After npm publication, use `npx @scaryguy/dev-harness init`.
Contributors can test locally with `npm pack`
and run `npx --package=/path/to/package.tgz dev-harness init` in a test project.

Install explicitly with `dev-harness init [repository] --platform cursor` or
`--platform codex`. Repeated `--platform ID` flags are additive and idempotent.
Fresh unqualified init keeps the compatible version 1 Cursor setup. Existing
unqualified init refreshes all installed integrations. Installation does not
invoke a native agent or model. `codex --version` is only a version floor for
`--platform codex`, not platform acceptance.

Codex CLI support requires `codex-cli` 0.162.1 or newer. It writes four project
artifacts and does not write `~/.codex`:

- `.agents/skills/dev-harness`, a directory symlink to `dev-harness/.harness/skills/dev-harness`
- `.codex/agents/dev-harness-planner.toml`
- `.codex/agents/dev-harness-reviewer.toml`
- `.codex/agents/dev-harness-owner.toml`

Init replaces a Codex agent file only when that file begins with
`# dev-harness-managed`. Neighboring project files stay in place.

Explicit selection writes version 2 configuration. Edit native settings in
`dev-harness/.harness/config.json` at `adapters.cursor.models` or
`adapters.codex.models`, with `orchestrator`, `planner`, `reviewer`, and `owner`
model objects. Codex roles use separate `model` and `effort` strings. First
install uses `gpt-6.1-sol` with high effort for orchestrator, planner, and
reviewer, and low effort for owner. Existing adapter settings win over those
defaults. Legacy fields and opaque extensions remain preserved; version 2
adapter settings control rendering. Cursor strings are opaque, including
embedded effort syntax. Unknown settings do not install platforms; unsupported
selections are rejected.

Launch the configured Codex orchestrator, then start Dev Harness with
`--platform codex`. The first-install lines are:

```sh
codex --model gpt-6.1-sol --config model_reasoning_effort="high"
codex exec --model gpt-6.1-sol --config model_reasoning_effort="high"
```

Later inits render those commands from `adapters.codex.models.orchestrator`.

`dev-harness status` shows every installed configured orchestrator model and
shared records once. `status --platform cursor` or `status --platform codex`
narrows model display; `check --platform cursor` or `check --platform codex`
narrows native checks while still validating shared configuration and records. These commands never migrate configuration. Active platform identity comes from
explicit native startup/invocation context, never the installed set. Configured
model values describe intent; they do not verify the running native model.

Built-in integrations live in the closed `.harness/integrations/` registry.
Each adapter declares defaults, capabilities, validation, artifacts, artifact
checks, and explicit startup guidance. Shared gate, approval, record, Git, and
worktree policy remains in the shared CLI and skill. New executable dependencies
must remain in that directory or use Node built-ins; future pinned runtimes
verify and extract committed modules before importing them.

Integration modules use a restricted source language for pinned dependency
validation: static imports and export-from declarations require semicolons and
ordinary unescaped quoted specifiers. Comments between dependency tokens are
supported. Templates, regex literals, slash operators, escaped identifiers,
non-ASCII code identifiers, dynamic imports, import.meta, and import attributes
are rejected. Use string concatenation and `new RegExp(...)` instead. Unicode
inside strings and comments is supported. Node syntax-checks every committed
module without execution before the dependency validator permits extraction.
Dependencies must be real `node:` built-ins or relative `.mjs` files in the
verified committed integration inventory. Unsupported syntax fails closed.
This checks dependency syntax; it does not sandbox deliberate eval, Function,
filesystem access, or other executable behavior in trusted committed modules.
