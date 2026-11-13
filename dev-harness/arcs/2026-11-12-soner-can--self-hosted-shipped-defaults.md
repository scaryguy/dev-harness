---
{
  "id": "2026-11-12-soner-can--self-hosted-shipped-defaults",
  "kind": "arc",
  "title": "Self-hosted shipped defaults",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 1,
  "created": "2026-11-13T04:43:49.390Z",
  "updated": "2026-11-13T04:50:03.000Z",
  "next": "WS-06 IMPLEMENT, then code review.",
  "status": "in-progress",
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
  }
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

In scope: one WS, [WS-06](../workstreams/WS-soner-can-06--shipped-default-config-separation.md). Out of scope:
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

Open: none.

## Branch and rollup

Branch: `arc/2026-11-12-soner-can--self-hosted-shipped-defaults` from `main` at
`e7aabbcbbf7993dc4c5b9b98c9ce0396831da675`. Integration branch: `main`. Final merge SHA: —.

| WS | Gate | Depends on | WS branch | Merge SHA |
|----|------|------------|-----------|-----------|
| [WS-06](../workstreams/WS-soner-can-06--shipped-default-config-separation.md) | IMPLEMENT | — | `ws/WS-soner-can-06--shipped-default-config-separation` | — |

## Integration checklist

- [ ] Workstreams completed or explicitly deferred.
- [ ] Arc smoke tests after each WS merge and final integration checks passed (npm test; baseline `pinned skill`,
  `pinned status`, `pinned check`; frozen paths identical to baseSha; `npm pack` contents).
- [ ] User approved integration of the reviewed revision.
- [ ] Post-integration, separately approved: on clean `main`, `node dev-harness/.harness/cli.mjs init --platform claude-code`;
  commit `config.json`, `CLAUDE.md`, `.claude/agents/dev-harness-{planner,reviewer,owner}.md`, `.claude/skills/dev-harness`
  together (no attribution trailer); verify per WS-06 Verification (including `npm test` without `claude` on PATH and a
  throwaway ARC's pinned checks from a fresh clone).

## Progress ledger

- 2026-11-13T04:43:49.390Z · Soner Can · Created.
- 2026-11-12 (pre-ARC) · Reviewer (opus, high) · Plan r1 CHANGES-REQUESTED: hermetic tests after self-install,
  Q3 guard key, missing-defaults behavior, Q2 rationale, self-install checklist, legacy layout.
- 2026-11-12 (pre-ARC) · Reviewer (opus, high) · Plan r2 PASS-with-notes; baseline npm test 46/46 PASS (~24 min).
- 2026-11-13T04:44:15.218Z · Orchestrator · WS-06 created via baseline pinned dispatcher (baseSha e7aabbc).
- 2026-11-13T04:44:50.000Z · Orchestrator · Plan r2 recorded; awaiting user implementation approval.
- 2026-11-13T04:46:31.000Z · User · Implementation approval for WS-06 r1 ("continue"); arc scope locked.
- 2026-11-13T04:50:03.000Z · Orchestrator · WS-06 RESEARCH review PASS-with-notes; WS-06 entered IMPLEMENT; arc in-progress.
