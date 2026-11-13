---
{
  "id": "WS-soner-can-07--platform-scoped-session-status",
  "kind": "workstream",
  "title": "Platform-scoped session status",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 1,
  "created": "2026-11-13T09:36:20.436Z",
  "updated": "2026-11-13T11:22:07.000Z",
  "next": "Merged into the arc; arc smoke test result pending.",
  "arc": "2026-11-12-soner-can--self-hosted-shipped-defaults",
  "sequence": 7,
  "gate": "MERGED",
  "dependencies": [
    "WS-soner-can-06--shipped-default-config-separation"
  ],
  "agentModels": {
    "platform": "claude-code",
    "orchestrator": "opus[effort=high]",
    "reviewer": "opus[effort=high]",
    "owner": "opus[effort=low]"
  },
  "planReview": {
    "revision": 2,
    "outcome": "PASS-with-notes",
    "reviewer": "opus[effort=high]",
    "date": "2026-11-13T09:36:20.000Z",
    "history": [
      {
        "revision": 1,
        "outcome": "CHANGES-REQUESTED",
        "date": "2026-11-13"
      }
    ]
  },
  "implementationApproval": {
    "revision": 1,
    "actor": "User",
    "date": "2026-11-13",
    "scope": "WS-07 IMPLEMENT after plan review and WS RESEARCH review PASS; branch after WS-06 merges",
    "evidence": "update it then!? (reply to WS-07 decisions 1-4 request)"
  },
  "researchState": "approved",
  "implementationState": "reviewed",
  "researchReview": {
    "revision": 1,
    "outcome": "PASS-with-notes",
    "reviewer": "opus[effort=high]",
    "date": "2026-11-13T09:40:56.000Z",
    "notes": "Owner notes: add explicit tests for decisions 5-7 — exit 0 for status and check with multiple markers; check output shows not-installed and multiple-markers notices, no decision-3 hint, unchanged 'Valid: N records' line; Claude Code + Cursor markers with only claude-code installed yields the decision-2 result. Revision stays 1: decisions 5-7 were accepted directly by the user and do not change approved scope.",
    "history": [
      {
        "outcome": "CHANGES-REQUESTED",
        "date": "2026-11-13"
      }
    ]
  },
  "implementationEvidence": {
    "revision": 1,
    "reportedBy": "opus[effort=low]",
    "date": "2026-11-13T10:52:49.000Z",
    "startingRevision": "beb3a3b",
    "summary": "Owner-reported: npm test 65/65 inside Claude Code and 65/65 via env -i; frozen paths + AGENTS.md diff-clean vs e7aabbc; manual marker matrix matches decisions 1-7. Owner narrowed WS-06 test 49 (fresh install vs e7aabbc baseline) to exclude AGENTS.md and SKILL.md content, asserting them against live entry/skill instead. Session interrupted once by an auth error; resumed. Not yet independently verified."
  },
  "codeReview": {
    "revision": 1,
    "outcome": "PASS-with-notes",
    "reviewer": "opus[effort=high]",
    "date": "2026-11-13T11:05:35.000Z",
    "worktree": "/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-07--platform-scoped-session-status (beb3a3b + unstaged)",
    "notes": "SKILL.md:131-133 wording could let an agent present all platforms when nothing is detected; fix requested before USER CONFIRM. WS branch one records-only commit behind arc tip.",
    "verified": "Reviewer ran: full npm test via env -i 65/65 (0 skipped); restricted-syntax validator on all integration modules; scope() matrix in a disposable repo; simulated merge on arc tip 2deba5b with baseline pinned skill/status/check identical with no marker, Claude Code marker, and both markers; frozen paths + AGENTS.md diff-clean; narrowed test 49 judged sound."
  },
  "userConfirm": {
    "revision": 1,
    "actor": "User",
    "date": "2026-11-13T11:22:07.000Z",
    "scope": "Merge WS-07 revision 1 into the arc only",
    "evidence": "yeah seems to have worked (after testing in ~/Desktop/delete/testdev)"
  },
  "merge": {
    "wsCommit": "30f9ca3196e020cdb453b0b15300de53cec9e836",
    "arcMerge": "523a2860592e227f968551ffa4026acdabeb899b"
  },
  "knownLimitations": [
    "Cursor (CURSOR_AGENT) and Codex (CODEX_THREAD_ID) markers not observed in a real session; CODEX_THREAD_ID undocumented. If absent, those sessions fall back to the all-installed view with the hint.",
    "Claude Code < 2.1.172 does not set CLAUDE_CODE_CHILD_SESSION (falls back to the hint)."
  ]
}
---

# Platform-scoped session status

## Arc

[2026-11-12-soner-can--self-hosted-shipped-defaults](../arcs/2026-11-12-soner-can--self-hosted-shipped-defaults.md)

## Checkout

WS branch: `ws/WS-soner-can-07--platform-scoped-session-status` from
`arc/2026-11-12-soner-can--self-hosted-shipped-defaults` @ `beb3a3b` (after WS-06 merge d332a9f).
Worktree: `../dev-harness-worktrees/WS-soner-can-07--platform-scoped-session-status/`.

## Scope and approach

Problem: with several platforms installed, the shared AGENTS.md block makes every agent run plain `status`, which shows every
installed platform's orchestrator (a Claude Code session sees the Cursor line and vice versa).

Outcome: plain `status`/`check` detect the agent runtime from native env markers and scope to it; explicit `--platform` always
wins; no marker → all installed (human terminals, including Cursor's own terminal), plus a hint when several are installed.

Markers: Claude Code `CLAUDE_CODE_CHILD_SESSION=1` (documented; Claude Code >= 2.1.172; set for Bash/PowerShell/Monitor tools,
hooks, status line; not IDE extensions); Cursor `CURSOR_AGENT` non-empty (documented; not runtime-observed); Codex `CODEX_THREAD_ID`
non-empty (undocumented; from Codex source; not runtime-observed). Rejected: CLAUDECODE, CURSOR_TRACE_ID, TERM_PROGRAM, CODEX_SANDBOX,
AI_AGENT.

Changes (from the arc tip after WS-06):
- `integrations/{cursor,codex,claude-code}.mjs`: optional `detect(env)` → boolean, restricted syntax (`typeof`/`===` only).
- `integrations/registry.mjs`: `export function detected(env)`; adapters without `detect` never detected.
- `cli.mjs`: scope resolver replacing `selected()` (explicit → detected on process.env → all installed; returns ids + notice);
  status/check use it; checkLinks accepts empty scope; notice strings live here. Revise `entry` and only the "Outside a source
  ARC…" sentence of `sourceEntry` (bootstrap portion byte-identical to e7aabbc): status shows only your detected platform; on
  several/ambiguity/not-installed, rerun with `--platform ID` or ask the user; present only your platform.
- `SKILL.md`: identity / Session summary / delegation text (~109-116, 125-130, 290-294).
- `README.md`: detection, markers, override, marker leakage, narrowed plain `check`.
- `cli.test.mjs`: file-top scrub of markers (explicit list + CLAUDE_CODE_/CURSOR_/CODEX_ prefixes); marker tests pass `env`
  explicitly; tables for each marker, none, multiple, not installed, `--platform` overriding a marker, hint; exact-text assertions
  for new `entry`/`sourceEntry` and bootstrap-portion byte identity; update multi-platform status tests (~973, ~1231) for the hint;
  narrowed-check test (Claude Code marker, tampered Cursor artifact passes plain check, fails `check --platform cursor`); pinned
  `status`/`check` in a pinned source fixture with a marker set on the baseline spawn still succeed.

Do not touch: root `AGENTS.md` (refreshed by the post-integration self-install), `dev-harness/.harness/config.json`, `templates/**`,
`adapters/**`, pinned dispatch, closed ARC records, default models.

## Handoff

Owner notes: add explicit tests for decisions 5-7 — exit 0 for status and check with multiple markers; check output shows not-installed and multiple-markers notices, no decision-3 hint, unchanged 'Valid: N records' line; Claude Code + Cursor markers with only claude-code installed yields the decision-2 result. Revision stays 1: decisions 5-7 were accepted directly by the user and do not change approved scope.

Owner: `dev-harness-owner` (Claude Code session override, opus low) in the external worktree, after WS-06 merges and WS RESEARCH
review PASS. No staging, commits, or record edits.

## Decisions

Repository conventions: restricted integration module syntax; frozen baseline companions; the managed AGENTS.md block is written by
init (`sourceEntry` in the source checkout); no co-author lines.

User decisions: 2026-11-13 "go" (own platform only in agent sessions; native-marker detection; `--platform` wins; unidentified agent
asks; WS-07 after WS-06; supersedes 2026-10-14 decisions) and "update it then!?" accepting:
1. Marker for an uninstalled platform → header + records, no orchestrator line, notice "<Platform> is not installed here
   (installed: …); run init --platform <id>"; check validates config + shared records only; exit 0.
2. Multiple markers → no orchestrator lines; notice "Multiple agent runtimes detected (…); rerun with --platform ID"; check shared
   records only.
3. No marker with several installed → show all + hint "Platform not detected; showing all installed. Agents: rerun with --platform ID".
4. No CLAUDECODE fallback.
5. (A) Multiple markers: `status` and `check` exit 0.
6. (B) Plain `check` prints the not-installed and multiple-markers notices but not the decision-3 hint; its "Valid: N records" line is unchanged.
7. (C) Detection counts markers of every registered adapter, installed or not; e.g. Claude Code + Cursor markers with only claude-code installed → decision 2 (multiple).
   (5–7 accepted by the user on 2026-11-13T09:40:17.000Z: "go".)

Known limits (documented): markers leak into processes started from agent shells; a human typing in an agent-owned terminal is
detected as that agent; agent→agent invocation yields multiple markers (decision 2); Claude Code < 2.1.172 undetectable (decision 3).

Open: none.

## Gate

Current: `MERGED` (into the arc). Next action: none; arc smoke result recorded in the arc.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-11-13 | 2026-11-13 | PASS-with-notes |
| IMPLEMENT | 2026-11-13 | 2026-11-13 | ready-for-review |
| REVIEW | 2026-11-13 | 2026-11-13 | PASS-with-notes |
| USER CONFIRM | 2026-11-13 | 2026-11-13 | User confirmed |
| MERGED | 2026-11-13 | — | merge 523a286 |

## Verification

```
npm test                                         # inside Claude Code
env -i PATH="$PATH" HOME="$HOME" npm test        # without agent markers
git diff --exit-code e7aabbcbbf7993dc4c5b9b98c9ce0396831da675 -- dev-harness/.harness/config.json dev-harness/.harness/templates dev-harness/.harness/adapters AGENTS.md
```
Disposable repo with `init --platform cursor --platform claude-code`: status/check with `CLAUDE_CODE_CHILD_SESSION=1`,
`CURSOR_AGENT=1`, both, neither, and `--platform cursor` while a Claude Code marker is set; Cursor-only repo variants. After the
WS merge: baseline `pinned skill`, `pinned status`, `pinned check` on the arc; `npm pack` contents.
Manual user check: plain `status` and `env | grep -E 'CURSOR|CODEX|CLAUDE'` in a Cursor agent chat, Cursor's human terminal,
cursor-agent, and codex (confirm CODEX_THREAD_ID survives `shell_environment_policy`; otherwise Codex falls to the decision 3 hint).

User test install: `~/Desktop/delete/testdev` refreshed from an `npm pack` of the WS-07 worktree (includes WS-06); config preserved; AGENTS.md block and skill updated. Orchestrator observed there: Claude Code shell → only Claude Code orchestrator; `CURSOR_AGENT=1` → only Cursor; no markers → both plus hint.

## User confirm checklist

- [ ] In a Claude Code session, plain status shows only the Claude Code orchestrator.
- [ ] In a Cursor agent session, plain status shows only the Cursor orchestrator.
- [ ] In a human terminal, plain status shows all installed platforms plus the hint.
- [ ] `--platform ID` overrides detection.
- [ ] All tests pass inside and outside an agent session.

## Approvals

- 2026-11-13 · Reviewer (opus, high) · Plan r1 CHANGES-REQUESTED (root AGENTS.md handling).
- 2026-11-13T09:36:20.000Z · Reviewer (opus, high) · Plan r2 PASS-with-notes.
- 2026-11-13 · User · Implementation directed for revision 1 ("update it then!?"), subject to plan and WS RESEARCH review PASS.

- 2026-11-13T09:40:17.000Z · Reviewer (opus, high) · WS RESEARCH review r1 CHANGES-REQUESTED (exit code for multiple markers; check notices; detection set).
- 2026-11-13T09:40:17.000Z · User · Accepted A–C as recommended ("go").

- 2026-11-13T09:40:56.000Z · Reviewer (opus, high) · WS RESEARCH review r1 PASS-with-notes.

- 2026-11-13T11:22:07.000Z · User · USER CONFIRM after testing in ~/Desktop/delete/testdev: "yeah seems to have worked". Approves merging WS-07 revision 1 into the arc only. Cursor/Codex real-session marker observation not reported.

## Progress ledger

- 2026-11-13T09:36:20.436Z · Soner Can · Created.
- 2026-11-13T09:36:20.000Z · Orchestrator · Revision 1 contract recorded from plan r2; WS RESEARCH review next; branches after WS-06 merges.
- 2026-11-13T09:40:17.000Z · Orchestrator · Decisions 5–7 (A–C) added to the contract; WS RESEARCH re-review requested.
- 2026-11-13T09:40:56.000Z · Orchestrator · RESEARCH exited (user direction + review PASS); IMPLEMENT entered; WS branch/worktree created from the arc tip.
- 2026-11-13T10:52:49.000Z · Owner (opus, low) · Implementation reported ready-for-review from beb3a3b (owner-reported 65/65 twice). Gate → REVIEW.
- 2026-11-13T11:05:35.000Z · Reviewer (opus, high) · Code review r1 PASS-with-notes; SKILL.md wording fix requested.
- 2026-11-13T11:08:40.000Z · Owner (opus, low) · SKILL.md 131-135 reworded per review note; 17 targeted tests pass.
- 2026-11-13T11:08:40.000Z · Orchestrator · Verified the wording diff and git diff --check; refreshed ~/Desktop/delete/testdev with the WS-07 build. Gate → USER CONFIRM.
- 2026-11-13T11:22:07.000Z · Orchestrator · WS commit 30f9ca3; merged into arc as 523a286 (--no-ff). Frozen paths + AGENTS.md identical to e7aabbc; baseline pinned skill/status/check pass; npm pack 18 files. Full npm test (in-session and env -i) running on a clean clone.
