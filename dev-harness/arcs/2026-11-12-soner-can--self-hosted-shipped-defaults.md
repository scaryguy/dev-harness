---
{
  "id": "2026-11-12-soner-can--self-hosted-shipped-defaults",
  "kind": "arc",
  "title": "Self-hosted shipped defaults",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 4,
  "created": "2026-11-13T04:43:49.390Z",
  "updated": "2026-11-13T19:26:24.000Z",
  "next": "Complete. Claude Code installed in the source repo; future ARCs run natively on Claude Code.",
  "status": "complete",
  "branch": "arc/2026-11-12-soner-can--self-hosted-shipped-defaults",
  "integrationBranch": "main",
  "baseSha": "e7aabbcbbf7993dc4c5b9b98c9ce0396831da675",
  "agentModels": {
    "platform": "claude-code",
    "orchestrator": "opus[effort=high]",
    "planner": "opus[effort=high]",
    "reviewer": "opus[effort=high]",
    "owner": "opus[effort=low]"
  },
  "planReview": {
    "revision": 2,
    "outcome": "PASS-with-notes",
    "reviewer": "opus[effort=high]",
    "date": "2026-11-12",
    "history": [
      {
        "revision": 1,
        "outcome": "CHANGES-REQUESTED",
        "date": "2026-11-12"
      }
    ]
  },
  "integrationSha": "1fdcf49dc8ad32d246ac2e96e1e62bcfbc26043c"
}
---

# Self-hosted shipped defaults

## Outcome and scope

**Problem (verified in disposable clones, 2026-11-12).** `dev-harness/.harness/config.json` is both this source
repository's own install config and the shipped package default that fresh installs read
(`cli.mjs:105` → `integrations/config.mjs:21-24`). It worked while the repo's own install (Cursor v1) coincidentally
equalled the shipped default; the previous ARC ran under Codex via session overrides instead of installing. Running
`init --platform claude-code` here would make the shipped default v2 `[cursor, claude-code]`: unqualified fresh
`npx dev-harness init` would also install Claude Code (requiring `claude`), explicit `--platform` installs would carry
the other adapter's block, and 8/46 tests fail. Source-checkout init also rewrites shipped
`adapters/cursor/agents/*.md` from the repo config (`cli.mjs:173-176`, currently a no-op).

**Goal.** A general fix for the self-hosting chicken-and-egg: the repo's own platform install is independent of what
the package ships, so this repo can dogfood any platform without changing fresh-user output.

| Behavior | Today | Target |
|---|---|---|
| Shipped default | `.harness/config.json` (repo's own config) | `.harness/defaults/config.json` (v1 Cursor, byte copy of e7aabbc config) |
| Packaged `config.json` | shipped | not shipped |
| Fresh install output | from repo's own config | from `defaults/`, byte-identical to today |
| Source-checkout init changing shipped files | silently rewrites | fails closed before any write |
| Repo's own Claude Code install | not possible safely | post-integration step on main |

In scope: [WS-06](../workstreams/WS-soner-can-06--shipped-default-config-separation.md), then [WS-07](../workstreams/WS-soner-can-07--platform-scoped-session-status.md) (platform-scoped session status), then [WS-08](../workstreams/WS-soner-can-08--readme-platform-quick-start.md) (README platform quick-start), then [WS-09](../workstreams/WS-soner-can-09--readme-status-wording.md) (README status wording). Out of scope:
changing any platform default models, relocating Cursor agent rendering, changing this ARC's pinned governance, any
self-install inside the ARC (config.json/templates/adapters are frozen baseline companions).

## Decisions

Locked:
- 2026-11-12 · User: develop Dev Harness itself under the source-ARC flow; resolve the shipped-default coupling properly.
- 2026-11-12 · User: Claude Code session overrides for this ARC — Opus high for orchestrator/planner/reviewer, Opus low
  for owner (`agentModels`). Repository constraint: baseline companion verification forbids installing Claude Code in
  this ARC's governing config, so roles run as session overrides (precedent: modular platform ARC).
- 2026-11-12 · User ("go with your recommendations"): B remove repo config from package `files`; C post-integration
  self-install as a separately approved checklist item; D session overrides as above.
- 2026-11-12 · User ("use defaults"): Q1 shipped default at `dev-harness/.harness/defaults/config.json` (replaces A's
  `templates/config.json`, which fails baseline pinned status/check with "Live companion file set differs from ARC
  baseline"); Q2 `defaults/` is not frozen by future pinned governance; Q3 source-checkout init fails closed if it
  would change bytes of any shipped package file.

- 2026-11-13T04:46:31.000Z · User: approved implementation of WS-06 revision 1, locking arc scope as recorded (evidence: "continue").

- 2026-11-13T09:20:50.000Z · User ("go"): ARC scope change — add WS-07 "Platform-scoped session status" after WS-06 merges. Agent sessions show only their own platform; a plain human terminal still shows all installed platforms. Plain `status`/`check` identify the platform from native runtime environment markers (e.g. `CLAUDECODE` for Claude Code; Cursor/Codex markers to be confirmed in research); explicit `--platform` always wins; an unidentifiable agent session asks the user rather than guessing. Supersedes 2026-10-14 decisions (modular ARC) that unqualified status shows all installed integrations in every context and that there is no platform autodetection. Trigger: user testing WS-06 build in Claude Code saw the Cursor orchestrator line.

- 2026-11-13T09:33:01.000Z · User ("update it then!?", after being asked to accept or adjust WS-07 decisions 1–4): accepted recommended defaults and directed implementation of WS-07 (subject to plan review and WS RESEARCH review PASS). Markers: Claude Code `CLAUDE_CODE_CHILD_SESSION=1`, Cursor `CURSOR_AGENT`, Codex `CODEX_THREAD_ID`; no `CLAUDECODE` fallback. (1) marker for an uninstalled platform → no orchestrator line + not-installed notice, check covers config/shared records, exit 0; (2) multiple markers → no orchestrator lines + ambiguity notice; (3) no marker with several installed → show all + hint; (4) no CLAUDECODE fallback.

- 2026-11-13T09:40:17.000Z · User ("go"): WS-07 A–C accepted (multiple markers exit 0; check prints notices but not the hint; detection over all registered adapters). WS-06 confirmed for merge into the arc; case-folding gap recorded as a known limitation for a future arc.

- 2026-11-13T11:23:48.000Z · User ("go"): ARC scope change — add docs-only WS-08 "README platform quick-start": per-platform quick-start (Cursor, Codex, Claude Code) in the README Install section, side-by-side installs and per-session platform display, and entry-point line naming CLAUDE.md/.claude, .codex/.agents alongside Cursor links. No code changes. Trigger: user asked whether the Claude Code material had been added to the README's top section.

- 2026-11-13T11:44:20.000Z · User ("once passed, merge all and push main"): approves merging WS-08 and integrating this ARC into main and pushing once checks pass. Post-integration Claude Code self-install not covered; to be asked separately.

- 2026-11-13T11:49:59.000Z · User ("remove that scaffolding thing it's more than scaffold it worksing!"): ARC scope change — docs-only WS-09 replacing the README "Initial scaffold" paragraph; integrate after it merges.

Open: none.

## Branch and rollup

Branch: `arc/2026-11-12-soner-can--self-hosted-shipped-defaults` from `main` at
`e7aabbcbbf7993dc4c5b9b98c9ce0396831da675`. Integration branch: `main`. Final merge SHA: `1fdcf49dc8ad32d246ac2e96e1e62bcfbc26043c` (main).

| WS | Gate | Depends on | WS branch | Merge SHA |
|----|------|------------|-----------|-----------|
| [WS-06](../workstreams/WS-soner-can-06--shipped-default-config-separation.md) | MERGED | — | `ws/WS-soner-can-06--shipped-default-config-separation` | `d332a9f886edd80c9294e9c5a4e8fb673d179039` |
| [WS-07](../workstreams/WS-soner-can-07--platform-scoped-session-status.md) | MERGED | WS-06 MERGED | `ws/WS-soner-can-07--platform-scoped-session-status` | `523a2860592e227f968551ffa4026acdabeb899b` |
| [WS-08](../workstreams/WS-soner-can-08--readme-platform-quick-start.md) | MERGED | WS-07 MERGED | `ws/WS-soner-can-08--readme-platform-quick-start` | `7eb7e7ac3254c12104f4bebe357ac5e8a52700c0` |
| [WS-09](../workstreams/WS-soner-can-09--readme-status-wording.md) | MERGED | WS-08 MERGED | `ws/WS-soner-can-09--readme-status-wording` | `f297137518e71daf01f7a8497e7f75c2fe8f4baf` |

## Integration checklist

- [x] Workstreams completed or explicitly deferred.
- [x] Arc smoke tests after each WS merge and final integration checks passed (npm test; baseline `pinned skill`,
  `pinned status`, `pinned check`; frozen paths identical to baseSha; `npm pack` contents).
- [x] User approved integration of the reviewed revision ("once passed, merge all and push main", 2026-11-13T11:44:20.000Z).
- [x] Post-integration, separately approved: on clean `main`, `node dev-harness/.harness/cli.mjs init --platform claude-code`;
  commit `config.json`, `CLAUDE.md`, `.claude/agents/dev-harness-{planner,reviewer,owner}.md`, `.claude/skills/dev-harness`
  and the refreshed root `AGENTS.md` managed block together (no attribution trailer); verify per WS-06 Verification
  (including `npm test` without `claude` on PATH and a throwaway ARC's pinned checks from a fresh clone) and that the root
  `AGENTS.md` block bytes equal the new `sourceEntry` with only that block changed (WS-07).

## Progress ledger

- 2026-11-13T04:43:49.390Z · Soner Can · Created.
- 2026-11-12 (pre-ARC) · Reviewer (opus, high) · Plan r1 CHANGES-REQUESTED: hermetic tests after self-install,
  Q3 guard key, missing-defaults behavior, Q2 rationale, self-install checklist, legacy layout.
- 2026-11-12 (pre-ARC) · Reviewer (opus, high) · Plan r2 PASS-with-notes; baseline npm test 46/46 PASS (~24 min).
- 2026-11-13T04:44:15.218Z · Orchestrator · WS-06 created via baseline pinned dispatcher (baseSha e7aabbc).
- 2026-11-13T04:44:50.000Z · Orchestrator · Plan r2 recorded; awaiting user implementation approval.
- 2026-11-13T04:46:31.000Z · User · Implementation approval for WS-06 r1 ("continue"); arc scope locked.
- 2026-11-13T04:50:03.000Z · Orchestrator · WS-06 RESEARCH review PASS-with-notes; WS-06 entered IMPLEMENT; arc in-progress.
- 2026-11-13T05:09:08.000Z · Orchestrator · WS-06 entered REVIEW.
- 2026-11-13T05:23:21.000Z · Orchestrator · WS-06 code review CHANGES-REQUESTED; returned to IMPLEMENT.
- 2026-11-13T05:41:33.000Z · Orchestrator · WS-06 re-entered REVIEW.
- 2026-11-13T06:15:27.000Z · Orchestrator · WS-06 code review PASS-with-notes; WS-06 in USER CONFIRM.
- 2026-11-13T09:20:50.000Z · User · ARC scope change approved: WS-07 platform-scoped session status (revision 2 of ARC scope). Planning next.
- 2026-11-13T09:33:01.000Z · User · WS-07 decisions 1–4 accepted as recommended; implementation directed ("update it then!?"). Plan review started.
- 2026-11-13T09:36:20.000Z · Reviewer (opus, high) · WS-07 plan r1 CHANGES-REQUESTED; r2 PASS-with-notes.
- 2026-11-13T09:36:20.000Z · Orchestrator · WS-07 created via baseline pinned dispatcher; post-integration checklist adds root AGENTS.md refresh.
- 2026-11-13T09:40:17.000Z · Orchestrator · WS-06 merged into arc as d332a9f; frozen paths + AGENTS.md identical to e7aabbc; baseline pinned skill/status/check pass; npm pack OK; full npm test running.
- 2026-11-13T09:40:56.000Z · Orchestrator · WS-07 RESEARCH review PASS-with-notes; WS-07 entered IMPLEMENT.
- 2026-11-13T09:55:46.000Z · Orchestrator · Arc smoke after WS-06 merge: full npm test on a clean clone at d332a9f — 58/58 pass, 0 fail, 0 skipped.
- 2026-11-13T10:52:49.000Z · Orchestrator · WS-07 entered REVIEW.
- 2026-11-13T11:08:40.000Z · Orchestrator · WS-07 code review PASS-with-notes, note addressed; WS-07 in USER CONFIRM.
- 2026-11-13T11:22:07.000Z · User/Orchestrator · WS-07 confirmed ("yeah seems to have worked") and merged into arc as 523a286; baseline pinned checks pass; full npm test running.
- 2026-11-13T11:23:48.000Z · User · ARC scope change approved: docs-only WS-08 README platform quick-start (ARC revision 3).
- 2026-11-13T11:26:07.000Z · Reviewer/Orchestrator · WS-08 plan r1 PASS-with-notes; WS-08 created via baseline pinned dispatcher.
- 2026-11-13T11:26:40.000Z · Orchestrator · WS-08 RESEARCH review PASS-with-notes; WS-08 entered IMPLEMENT.
- 2026-11-13T11:44:20.000Z · Orchestrator · Arc smoke at 523a286 (after WS-07): npm test 65/65 inside Claude Code.
- 2026-11-13T11:44:20.000Z · Orchestrator · WS-08 code review PASS; merged into arc as 7eb7e7a; baseline pinned checks pass. Final arc smoke running.
- 2026-11-13T11:49:59.000Z · User · ARC scope change: WS-09 README status wording (ARC revision 4).
- 2026-11-13T11:50:34.000Z · Orchestrator · WS-09 RESEARCH review PASS-with-notes; IMPLEMENT.
- 2026-11-13T11:51:26.000Z · Orchestrator · WS-09 code review PASS; merged into arc as f297137. All ARC workstreams merged.
- 2026-11-13T12:08:27.000Z · Orchestrator · Arc smoke at 523a286 (after WS-07) env -i: 65/65. Final arc smoke at 7eb7e7a (WS-09 is README-only): npm test 65/65 inside Claude Code and 65/65 via env -i, 0 skipped; npm pack 18 files with defaults/config.json, without config.json; frozen paths + AGENTS.md identical to e7aabbc; baseline pinned skill/status/check pass.
- 2026-11-13T12:08:43.000Z · Orchestrator · Integrated into main as 1fdcf49 (--no-ff; tree identical to arc tip d656fd4) under user approval "once passed, merge all and push main". Pushed to origin/main.
- 2026-11-13T19:26:24.000Z · User/Orchestrator · Post-integration self-install approved ("okay"). `init --platform claude-code` on main changed only config.json (v2 cursor+claude-code), AGENTS.md (managed block == sourceEntry), CLAUDE.md, .claude/agents/*, .claude/skills/dev-harness; shipped paths unchanged; status shows only the Claude Code orchestrator; check, check --platform claude-code|cursor pass; fresh install == defaults/config.json. Disposable clone with the commit: throwaway ARC baseline pinned skill/status/check (+ --platform claude-code|cursor) pass; npm test 65/65 with claude; without claude 64/65 where the one failure (codex readiness test) was caused by the verification PATH (symlink farm put codex next to git); rerun of the affected 14 tests with every claude-containing PATH dir removed: 14/14 pass.
