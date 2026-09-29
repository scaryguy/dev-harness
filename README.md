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
under `.cursor/skills/` and `.cursor/agents/`.

Initial scaffold: Cursor setup, record creation, status, and validation work.
Gate approvals are agent-managed; automatic enforcement and other platforms come later.
After npm publication, use `npx @scaryguy/dev-harness init`.
Contributors can test locally with `npm pack`
and run `npx --package=/path/to/package.tgz dev-harness init` in a test project.
