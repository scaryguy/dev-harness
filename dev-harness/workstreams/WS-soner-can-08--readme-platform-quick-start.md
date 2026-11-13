---
{
  "id": "WS-soner-can-08--readme-platform-quick-start",
  "kind": "workstream",
  "title": "README platform quick-start",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 1,
  "created": "2026-11-13T11:26:07.749Z",
  "updated": "2026-11-13T11:26:40.000Z",
  "next": "Owner applies the README text; then code review.",
  "arc": "2026-11-12-soner-can--self-hosted-shipped-defaults",
  "sequence": 8,
  "gate": "IMPLEMENT",
  "dependencies": [
    "WS-soner-can-07--platform-scoped-session-status"
  ],
  "agentModels": {
    "platform": "claude-code",
    "orchestrator": "opus[effort=high]",
    "reviewer": "opus[effort=high]",
    "owner": "opus[effort=low]"
  },
  "planReview": {
    "revision": 1,
    "outcome": "PASS-with-notes",
    "reviewer": "opus[effort=high]",
    "date": "2026-11-13T11:26:07.000Z"
  },
  "implementationApproval": {
    "revision": 1,
    "actor": "User",
    "date": "2026-11-13T11:26:07.000Z",
    "scope": "Docs-only WS-08 README platform quick-start, after reviews PASS",
    "evidence": "go (reply to WS-08 proposal)"
  },
  "researchState": "approved",
  "implementationState": "in-progress",
  "researchReview": {
    "revision": 1,
    "outcome": "PASS-with-notes",
    "reviewer": "opus[effort=high]",
    "date": "2026-11-13T11:26:40.000Z",
    "notes": "Apply both the replacement block and the 'launch guidance' wording edit; confirm checks the README says 'launch guidance'."
  }
}
---

# README platform quick-start

## Arc

[2026-11-12-soner-can--self-hosted-shipped-defaults](../arcs/2026-11-12-soner-can--self-hosted-shipped-defaults.md)

## Checkout

WS branch: `ws/WS-soner-can-08--readme-platform-quick-start` from `arc/2026-11-12-soner-can--self-hosted-shipped-defaults` @ `ac06b2d`.
Worktree: `../dev-harness-worktrees/WS-soner-can-08--readme-platform-quick-start/`.

## Scope and approach

Docs-only. The README's top Install section is Cursor-only and the entry-point line names only Cursor links. Replace the
`## Install` section and the entry-point line in "Files and settings" with the text below; all other README text stays
byte-identical. No code, test, skill, AGENTS.md, config, templates, or adapters changes.

### Replacement `## Install` section and entry-point line
```markdown
## Install

Requires Node.js 20+. Run inside your project's Git repository, then start a
new agent session and ask it to start Dev Harness.

**Cursor** (the default):

    npx github:scaryguy/dev-harness init

Select **Grok 4.7 · High** in Cursor's model picker. Start a new chat:
“Start dev harness. Use --platform cursor. Let's build …”

**Codex CLI** (0.162.1+):

    npx github:scaryguy/dev-harness init --platform codex
    codex --model gpt-6.1-sol --config model_reasoning_effort="high"

Say “Start dev harness. Use --platform codex.”

**Claude Code** (2.1.44+):

    npx github:scaryguy/dev-harness init --platform claude-code
    claude --model opus --effort high

Say “Start dev harness. Use --platform claude-code.”

Init prints these launch lines for your configured models. Install several
platforms side by side by repeating `--platform` (it is additive and idempotent).
Each agent session shows only its own platform; a human terminal shows every
installed platform plus a hint.

The agent shows your Git identity and current work, learns the repository,
and proposes a reviewed plan. You approve implementation and integration.
Say “resume my work” to continue in another session.
```
(Code blocks use ```sh fences in the actual README.)

## Replacement entry-point line (Files and settings)
"`AGENTS.md` and Cursor discovery links are entry points." →
"Entry points are `AGENTS.md` plus each installed platform's discovery files: Cursor links under `.cursor/`, `CLAUDE.md` and
`.claude/` for Claude Code, and `.agents/skills` and `.codex/agents` for Codex."

Review-note edit: replace "Init prints these launch lines for your configured models." with
"Init prints the launch guidance for your configured models." (Cursor's init prints an instruction, not a launch command.)

## Handoff

Owner: `dev-harness-owner` (opus low) in the external worktree; edits README.md only; unstaged; no records/commits.

## Decisions

User decision 2026-11-13 ("go"): scope as above. Repository conventions: README prompts match each adapter's startupGuidance
(`cursor.mjs:26` "Use --platform cursor", SKILL.md "For Cursor, startup context is `--platform cursor`", Codex/Claude Code strings
asserted at `cli.test.mjs:912`, `:1146`); npx line unchanged until npm publication (README). Open: none.

## Gate

Current: `IMPLEMENT`. Next action: owner applies the README text; then code review.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-11-13 | 2026-11-13 | PASS-with-notes |
| IMPLEMENT | 2026-11-13 | — | — |

## Verification

`npm test` passes; README diff limited to Install + entry-point line; Install text compared against each `startupGuidance` string
and against `init` output (no flag / `--platform codex` / `--platform claude-code`) in temp repos; status wording matches WS-07;
no "Cursor discovery links" leftover; all non-README files unchanged vs the WS base.

## User confirm checklist

- [ ] README Install shows Cursor, Codex CLI, and Claude Code quick-starts that match what init prints.
- [ ] Side-by-side installs and per-session platform display are explained.
- [ ] Entry-point line names every platform's discovery files.
- [ ] README says "Init prints the launch guidance for your configured models."

## Approvals

- 2026-11-13T11:26:07.000Z · Reviewer (opus, high) · Plan r1 PASS-with-notes (cite cursor.mjs:26/SKILL.md; "launch guidance" wording; compare to startupGuidance strings).
- 2026-11-13T11:26:07.000Z · User · Implementation approved for docs-only WS-08 ("go").

## Progress ledger

- 2026-11-13T11:26:07.749Z · Soner Can · Created.
- 2026-11-13T11:26:07.000Z · Orchestrator · Revision 1 contract recorded from plan r1 with review notes; WS RESEARCH review next.
- 2026-11-13T11:26:40.000Z · Reviewer (opus, high) · WS RESEARCH review r1 PASS-with-notes. IMPLEMENT entered; WS branch/worktree created.
