# Dev Harness

A shared workflow for humans and coding agents.

Plan an **arc**, split it into **workstreams**, and move through **gates**:
research → implementation → review → user confirmation → merged.

## Install

Requires Node.js 20+. Run inside your project's Git repository:

```sh
npx @scaryguy/dev-harness init
```

Select **Grok 4.7 · High** in Cursor's model picker. Start a new chat:
“Start dev harness. Let's build …”

The agent shows your Git identity and current work, learns the repository,
and proposes a reviewed plan. You approve implementation and integration.
Say “resume my work” to continue in another session.

## Files and settings

Everything lives in `dev-harness/`: configuration, skills, scripts, arcs,
workstreams, and knowledge. `AGENTS.md` and Cursor discovery links are entry points.
Edit `dev-harness/config.json` or ask the agent to configure it.

## Remove

Delete `dev-harness/`, its marked block in `AGENTS.md`, and its four links
under `.cursor/skills/` and `.cursor/agents/`.

Initial scaffold: Cursor setup, record creation, status, and validation work.
Gate approvals are agent-managed; automatic enforcement and other platforms come later.
The npm package is not published yet. Contributors can test it with `npm pack`
and run `npx --package=/path/to/package.tgz dev-harness init` in a test project.
