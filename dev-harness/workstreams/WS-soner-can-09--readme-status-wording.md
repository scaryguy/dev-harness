---
{
  "id": "WS-soner-can-09--readme-status-wording",
  "kind": "workstream",
  "title": "README status wording",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 1,
  "created": "2026-11-13T11:49:59.918Z",
  "updated": "2026-11-13T11:51:26.000Z",
  "next": "None; merged into the arc.",
  "arc": "2026-11-12-soner-can--self-hosted-shipped-defaults",
  "sequence": 9,
  "gate": "MERGED",
  "dependencies": [
    "WS-soner-can-08--readme-platform-quick-start"
  ],
  "agentModels": {
    "platform": "claude-code",
    "orchestrator": "opus[effort=high]",
    "reviewer": "opus[effort=high]",
    "owner": "opus[effort=low]"
  },
  "implementationApproval": {
    "revision": 1,
    "actor": "User",
    "date": "2026-11-13T11:49:59.000Z",
    "scope": "Docs-only README wording change",
    "evidence": "remove that scaffolding thing it's more than scaffold it worksing!"
  },
  "researchState": "approved",
  "implementationState": "reviewed",
  "researchReview": {
    "revision": 1,
    "outcome": "PASS-with-notes",
    "reviewer": "opus[effort=high]",
    "date": "2026-11-13T11:50:34.000Z",
    "notes": "Say 'Gate approvals and reviews are agent-managed' so reviews are not read as CLI-enforced."
  },
  "codeReview": {
    "revision": 1,
    "outcome": "PASS",
    "reviewer": "opus[effort=high]",
    "date": "2026-11-13T11:51:26.000Z",
    "notes": "Reviewer note that the contract body kept the old sentence was a misread (line 61 is the replaced text; lines 67-69 hold the new wording)."
  },
  "userConfirm": {
    "revision": 1,
    "actor": "User",
    "date": "2026-11-13T11:51:26.000Z",
    "scope": "Merge WS-09 into the arc under the standing 'merge all' approval",
    "evidence": "remove that scaffolding thing… (directive) + once passed, merge all and push main"
  },
  "merge": {
    "wsCommit": "8732d54bcb6757420b9c3d0868b166c6cb539310",
    "arcMerge": "f297137518e71daf01f7a8497e7f75c2fe8f4baf"
  }
}
---

# README status wording

## Arc

[2026-11-12-soner-can--self-hosted-shipped-defaults](../arcs/2026-11-12-soner-can--self-hosted-shipped-defaults.md)

## Checkout

WS branch `ws/WS-soner-can-09--readme-status-wording` from the arc tip; worktree `../dev-harness-worktrees/WS-soner-can-09--readme-status-wording/`.

## Scope and approach

Docs-only. Replace the README's "Initial scaffold" paragraph (two lines):

```
Initial scaffold: Cursor setup, Codex CLI setup, Claude Code setup, record creation, status, and validation work.
Gate approvals are agent-managed. Automatic enforcement and non-CLI Codex surfaces come later.
```

with:

```
Works today with Cursor, Codex CLI, and Claude Code: setup, arcs, workstreams, gates,
independent reviews, status, and validation. Gate approvals and reviews are
agent-managed; automatic enforcement and non-CLI Codex surfaces are planned.
```

The known limitations stay (honest for test users). No other file or README text changes.

## Handoff

Owner: `dev-harness-owner` (opus low); README.md only; unstaged; no records/commits.

## Decisions

User decision 2026-11-13T11:49:59.000Z: "remove that scaffolding thing it's more than scaffold it worksing!". Orchestrator wording keeps the two limitations already stated in that paragraph (agent-managed gates;
enforcement and non-CLI Codex surfaces planned) — existing documented facts, not new choices. Open: none.

## Gate

Current: `MERGED` (into the arc). Next action: none.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-11-13 | 2026-11-13 | PASS-with-notes |
| IMPLEMENT | 2026-11-13 | 2026-11-13 | ready-for-review |
| REVIEW | 2026-11-13 | 2026-11-13 | PASS |
| USER CONFIRM | 2026-11-13 | 2026-11-13 | Standing "merge all" approval |
| MERGED | 2026-11-13 | — | merge f297137 |

## Verification

README diff limited to that paragraph; no other file changed; `git diff --check`; no test reads README.

## User confirm checklist

- [x] README no longer calls the harness a scaffold; limitations remain stated.

## Approvals

- 2026-11-13T11:49:59.000Z · User · Directed the change ("remove that scaffolding thing it's more than scaffold it worksing!").

## Progress ledger

- 2026-11-13T11:49:59.918Z · Soner Can · Created.
- 2026-11-13T11:49:59.000Z · Orchestrator · Revision 1 contract recorded.
- 2026-11-13T11:50:34.000Z · Reviewer (opus, high) · WS RESEARCH review PASS-with-notes; wording note folded in. IMPLEMENT entered.
- 2026-11-13T11:51:26.000Z · Owner/Reviewer · README wording applied (+3/−2); code review PASS.
- 2026-11-13T11:51:26.000Z · Orchestrator · WS commit 8732d54; merged into arc as f297137; frozen paths + AGENTS.md identical to e7aabbc.
