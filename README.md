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

A fresh install copies the packaged default, `dev-harness/.harness/defaults/config.json`
(Cursor-only, version 1), to `dev-harness/.harness/config.json` byte for byte;
`--platform ID` starts from that default instead. Init refreshes `defaults/` like
`templates/`, and refuses before any write if the package's defaults are missing, a
symlink, or invalid; refresh an installed CLI with `npx @scaryguy/dev-harness init`.
Governance commands (`status`, `check`, `new`, `pinned`) never read `defaults/`.

This package source repository installs Dev Harness on itself. Its own
`dev-harness/.harness/config.json` is its install configuration only: it is
never read as a default and is not packaged. Self-install (`node
dev-harness/.harness/cli.mjs init`, run after integration) refuses before any
write if it would change bytes of a shipped package path (package.json `files`);
it may write only the repo's `config.json`, `AGENTS.md`, and native
discovery files such as `CLAUDE.md` and `.claude/`.

## Remove

Delete `dev-harness/`, its marked block in `AGENTS.md`, and its four links
under `.cursor/skills/` and `.cursor/agents/`. For a Codex install, also remove
`.agents/skills/dev-harness` and the three
`.codex/agents/dev-harness-{planner,reviewer,owner}.toml` files. For a Claude
Code install, also remove the managed `CLAUDE.md` import,
`.claude/skills/dev-harness`, and the three
`.claude/agents/dev-harness-{planner,reviewer,owner}.md` files. Leave every
other instruction file in place.

Initial scaffold: Cursor setup, Codex CLI setup, Claude Code setup, record creation, status, and validation work.
Gate approvals are agent-managed. Automatic enforcement and non-CLI Codex surfaces come later.
After npm publication, use `npx @scaryguy/dev-harness init`.
Contributors can test locally with `npm pack`
and run `npx --package=/path/to/package.tgz dev-harness init` in a test project.

Install explicitly with `dev-harness init [repository] --platform cursor`,
`--platform codex`, or `--platform claude-code`. Repeated `--platform ID`
flags are additive and idempotent.
Fresh unqualified init keeps the compatible version 1 Cursor setup. Existing
unqualified init refreshes all installed integrations. Installation does not
invoke a native agent or model. `codex --version` is only a version floor for
`--platform codex`, and `claude --version` is only a version floor for
`--platform claude-code`. Neither probe is platform acceptance.

Codex CLI support requires `codex-cli` 0.162.1 or newer. It writes four project
artifacts and does not write `~/.codex`:

- `.agents/skills/dev-harness`, a directory symlink to `dev-harness/.harness/skills/dev-harness`
- `.codex/agents/dev-harness-planner.toml`
- `.codex/agents/dev-harness-reviewer.toml`
- `.codex/agents/dev-harness-owner.toml`

Init replaces a Codex agent file only when that file begins with
`# dev-harness-managed`. Neighboring project files stay in place.

Claude Code support requires Claude Code 2.1.44 or newer. The accepted local
version text is `2.1.44 (Claude Code)`, or a newer leading version in that
same form. It writes five project artifacts and does not write `~/.claude`,
`.claude/CLAUDE.md`, or a second instruction file:

- `CLAUDE.md`, whose bytes are exactly `@AGENTS.md` plus one LF
- `.claude/skills/dev-harness`, a directory symlink to `dev-harness/.harness/skills/dev-harness`
- `.claude/agents/dev-harness-planner.md`
- `.claude/agents/dev-harness-reviewer.md`
- `.claude/agents/dev-harness-owner.md`

Init creates a missing Claude file. It replaces a Claude agent only when line 1
is `---` and the first line after the closing `---` is exactly
`<!-- dev-harness-managed -->`. It replaces `CLAUDE.md` only when the existing
bytes are exactly `@AGENTS.md` plus one LF. A directory, symlink, unmarked
agent, comment in any other position, or any other `CLAUDE.md` contents refuses
the install before any write. The `claude --version` probe is not platform
acceptance, and install does not invoke a native agent.

Explicit selection writes version 2 configuration. Edit native settings in
`dev-harness/.harness/config.json` at `adapters.cursor.models`,
`adapters.codex.models`, or `adapters.claude-code.models`, with `orchestrator`,
`planner`, `reviewer`, and `owner` model objects. Codex and Claude Code roles
use separate `model` and `effort` strings. Codex first install uses
`gpt-6.1-sol` with high effort for orchestrator, planner, and reviewer, and
low effort for owner. Claude Code first install uses `opus` with high effort
for orchestrator, planner, and reviewer, and low effort for owner. Existing
adapter settings win over those defaults. Legacy fields and opaque extensions
remain preserved; version 2 adapter settings control rendering. Cursor strings
are opaque, including embedded effort syntax. Unknown settings do not install
platforms; unsupported selections are rejected.

Launch the configured Codex orchestrator, then start Dev Harness with
`--platform codex`. The first-install lines are:

```sh
codex --model gpt-6.1-sol --config model_reasoning_effort="high"
codex exec --model gpt-6.1-sol --config model_reasoning_effort="high"
```

Later inits render those commands from `adapters.codex.models.orchestrator`.

Launch the configured Claude Code orchestrator, then start Dev Harness with
`--platform claude-code`. The first-install lines are:

```sh
claude --model opus --effort high
claude -p --model opus --effort high
```

Later inits render those commands from `adapters.claude-code.models.orchestrator`.

`dev-harness status` shows every installed configured orchestrator model and
shared records once. `status --platform cursor`, `status --platform codex`, or
`status --platform claude-code` narrows model display; `check --platform cursor`,
`check --platform codex`, or `check --platform claude-code` narrows native
checks while still validating shared configuration and records. These commands never migrate configuration. Active platform identity comes from
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
