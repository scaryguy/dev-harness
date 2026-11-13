---
{
  "id": "WS-soner-can-06--shipped-default-config-separation",
  "kind": "workstream",
  "title": "Shipped default config separation",
  "owner": {
    "name": "Soner Can",
    "id": "6a1feac13060"
  },
  "revision": 1,
  "created": "2026-11-13T04:44:15.218Z",
  "updated": "2026-11-13T09:40:17.000Z",
  "next": "Merged into the arc; arc smoke test (npm test) result pending.",
  "arc": "2026-11-12-soner-can--self-hosted-shipped-defaults",
  "sequence": 6,
  "gate": "MERGED",
  "dependencies": [],
  "agentModels": {
    "platform": "claude-code",
    "orchestrator": "opus[effort=high]",
    "reviewer": "opus[effort=high]",
    "owner": "opus[effort=low]"
  },
  "researchState": "approved",
  "implementationApproval": {
    "revision": 1,
    "actor": "User",
    "date": "2026-11-13T04:46:31.000Z",
    "scope": "WS-06 IMPLEMENT only, after WS RESEARCH review PASS",
    "evidence": "continue (reply to: Approve implementation of WS-06 revision 1?)"
  },
  "researchReview": {
    "revision": 1,
    "outcome": "PASS-with-notes",
    "reviewer": "opus[effort=high]",
    "date": "2026-11-13T04:50:03.000Z",
    "notes": "Owner notes: clone fixture (cli.test.mjs:143-168) must also copy defaults/ and stay hermetic after self-install; mutated-repo-config tests use a temporary package copy, never the live config.json; 'today's output' = output of the baseline CLI extracted from e7aabbc (or fixed expected bytes derived from it); defaults/config.json is validated with normalize() as well as JSON parse (fail closed); guarded set source is an owner implementation detail given the agreement test; Q2 tamper/delete comparison normalizes generated IDs/timestamps for `new`; package-contents test also asserts CLAUDE.md and .claude/ absent."
  },
  "implementationState": "reviewed",
  "implementationEvidence": {
    "revision": 1,
    "reportedBy": "opus[effort=low]",
    "date": "2026-11-13T05:41:33.000Z",
    "startingRevision": "4a915fc",
    "summary": "Owner-reported after review fixes: npm test 58/58 in worktree (normal PATH) and 58/58 in a self-installed disposable clone (no claude on PATH), 0 skipped; frozen paths diff-clean vs e7aabbc. New: source-checkout init refuses unless dev-harness/.harness/config.json exists. Not yet independently verified."
  },
  "codeReview": {
    "revision": 1,
    "outcome": "PASS-with-notes",
    "reviewer": "opus[effort=high]",
    "date": "2026-11-13T06:15:27.000Z",
    "worktree": "/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-06--shipped-default-config-separation (4a915fc + unstaged)",
    "notes": "Case-insensitive filesystems: an adapter planning a differently-cased shipped path (e.g. .harness/Templates/arc.md) passes both the collision check (install.mjs:87-88) and the shipped-file guard (cli.mjs:101), which compare exact strings. Requires adapter code; collision layer has the same gap at baseline e7aabbc.",
    "verified": "Reviewer ran: full npm test 58/58 on worktree copy (final round); 58/58 on self-installed clone without claude (prior round, unaffected by test-only change); baseline pinned skill/status/check on simulated merge; frozen paths diff-clean vs e7aabbc; defaults/config.json cmp-identical; layer probes.",
    "history": [
      {
        "outcome": "CHANGES-REQUESTED",
        "date": "2026-11-12"
      },
      {
        "outcome": "PASS-with-notes (guard test passed for wrong reason; fixed)",
        "date": "2026-11-12"
      }
    ]
  },
  "userConfirm": {
    "revision": 1,
    "actor": "User",
    "date": "2026-11-13T09:40:17.000Z",
    "scope": "Merge WS-06 revision 1 into the arc only; case-folding gap recorded as known limitation",
    "evidence": "go (reply to request for WS-06 confirm option)"
  },
  "merge": {
    "wsCommit": "86752d551aeea8c9cee16b731bf12a3ef89e84cf",
    "arcMerge": "d332a9f886edd80c9294e9c5a4e8fb673d179039"
  },
  "knownLimitations": [
    "Case-insensitive filesystems: an adapter planning a differently-cased shipped path passes both the collision check and the shipped-file guard (exact string comparison); requires adapter code; same gap exists at baseline e7aabbc. Deferred to a future arc."
  ]
}
---

# Shipped default config separation

## Arc

[2026-11-12-soner-can--self-hosted-shipped-defaults](../arcs/2026-11-12-soner-can--self-hosted-shipped-defaults.md)

## Checkout

WS branch: `ws/WS-soner-can-06--shipped-default-config-separation` from
`arc/2026-11-12-soner-can--self-hosted-shipped-defaults` @ `4a915fc`.
Worktree: `../dev-harness-worktrees/WS-soner-can-06--shipped-default-config-separation/`.

## Scope and approach

Problem: see the arc. Solution: fresh installs read a dedicated packaged default,
`dev-harness/.harness/defaults/config.json` (byte copy of `git show e7aabbc:dev-harness/.harness/config.json`, v1
Cursor-only). `dev-harness/.harness/config.json` becomes purely the repo's own install config, never read as a default
and not packaged.

Changes:
- `cli.mjs` `init()`: read defaults from `join(source, 'defaults')` only when there is no current config; a fresh install
  copies `defaults/config.json` → `runtime/config.json` byte-for-byte; replace the `config.json` item with `defaults` in the
  preflight/copy/refresh lists (~126, ~154, ~165); `defaults/` is installed and refreshed into every target like
  `templates/`. Candidate `pinned()` unchanged.
- Q3 guard: when `isPackageSourceCheckout(target)` (`cli.mjs:69`), compute every write init would make (from the artifact
  plan, not a hard-coded adapter list) and refuse before any write if one would change bytes of a shipped package path.
  The guarded set derives from the same list as package.json `files` (test asserts they agree). The repo's own
  `config.json` is not in that set, so the post-integration self-install still writes it.
- Missing `defaults/` (fail closed): init (fresh or refresh) refuses before any write if the package's
  `defaults/config.json` is missing, a symlink, or invalid JSON; the error points installed-CLI users to `npx` refresh. A
  runtime whose `defaults/` was deleted is re-copied by a package refresh. status/check/new/pinned never read `defaults/`.
- Legacy layout: preflight `defaults` only at `runtime/defaults`, not the legacy `dev-harness/defaults` folder
  (`cli.mjs:128`), so legacy migrations that succeed today still succeed (preserves accepted default "today's behavior").
- `integrations/install.mjs`: add `dev-harness/.harness/defaults` to protected `occupied` paths.
- `package.json` `files`: remove `dev-harness/.harness/config.json`; add `dev-harness/.harness/defaults/`.
- `README.md`: document the defaults file and the self-hosting procedure (dogfood installs via post-integration step).

Do not touch: `dev-harness/.harness/config.json`, `templates/**`, `adapters/**` (frozen baseline companions — must stay
byte/path identical to e7aabbc); `isPackageSourceCheckout` required-file list; any harness records; default models.

## Handoff

Owner notes: clone fixture (cli.test.mjs:143-168) must also copy defaults/ and stay hermetic after self-install; mutated-repo-config tests use a temporary package copy, never the live config.json; 'today's output' = output of the baseline CLI extracted from e7aabbc (or fixed expected bytes derived from it); defaults/config.json is validated with normalize() as well as JSON parse (fail closed); guarded set source is an owner implementation detail given the agreement test; Q2 tamper/delete comparison normalizes generated IDs/timestamps for `new`; package-contents test also asserts CLAUDE.md and .claude/ absent.

Owner: `dev-harness-owner` (Claude Code session override, opus low) in the external worktree above, after user
implementation approval and WS RESEARCH review PASS. Likely files: `cli.mjs`, `integrations/install.mjs`,
`cli.test.mjs`, `package.json`, `README.md`, new `defaults/config.json`. Owner does not stage, commit, or edit records.

## Decisions

Repository conventions:
- Pinned governance freezes config.json/templates/adapters by file set and bytes (baseline `cli.mjs:489-512`;
  `cli.test.mjs:552-556`). New responsibilities go in new paths; existing frozen responsibilities must not move to evade
  comparison (WS-03 precedent).
- Fail closed on invalid inputs. Restricted module syntax for `integrations/*.mjs`. No co-author lines.

User decisions (2026-11-12): B, C, D, Q1, Q2, Q3 as recorded in the arc.

Q2 rationale (recorded): `defaults/` is a new responsibility location, not an evasion. The shipped default was
co-located with governing config by accident; governance (status/check/new and all pinned commands) never reads
`defaults/`, and pinned extraction never extracts it. A test asserts status/check/new/pinned output is identical with
`defaults/` tampered or deleted, so any future governance read would be caught.

Accepted defaults (preserve today's behavior byte-for-byte): fresh unqualified init writes v1 unchanged; fresh
`--platform X` → v2 `[X]` with only X's adapter block and legacy top-level fields preserved; existing-install refresh
unchanged; `isPackageSourceCheckout` list unchanged.

Open: none.

## Gate

Current: `MERGED` (into the arc). Next action: none; arc smoke result recorded in the arc.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-11-12 | 2026-11-12 | PASS-with-notes |
| IMPLEMENT | 2026-11-12 | 2026-11-12 | ready-for-review |
| REVIEW | 2026-11-12 | 2026-11-12 | CHANGES-REQUESTED |
| IMPLEMENT | 2026-11-12 | 2026-11-12 | ready-for-review |
| REVIEW | 2026-11-12 | 2026-11-12 | PASS-with-notes |
| USER CONFIRM | 2026-11-12 | 2026-11-13 | User confirmed ("go") |
| MERGED | 2026-11-13 | — | merge d332a9f |

## Verification

WS worktree, then ARC checkout after merge:
```
npm test                       # 46 existing + new; all pass (~24 min)
PATH=<PATH without claude> npm test   # must also pass (hermetic)
git diff --check
git diff --exit-code e7aabbcbbf7993dc4c5b9b98c9ce0396831da675 -- dev-harness/.harness/config.json dev-harness/.harness/templates dev-harness/.harness/adapters
git status --porcelain -- dev-harness/.harness/config.json dev-harness/.harness/templates dev-harness/.harness/adapters   # empty
cmp dev-harness/.harness/defaults/config.json <(git show e7aabbc:dev-harness/.harness/config.json)
npm pack --dry-run --json      # config.json absent; defaults/config.json present
# ARC checkout, baseline dispatcher (independent bootstrap, DEV_HARNESS_BASE_SHA=e7aabbc…):
pinned skill; pinned status; pinned check
```
New tests: package contents; hermetic source-clone fixture (pinned to default config, fake `claude` helper); repo
config mutated to v2 `[cursor, claude-code]` → fresh unqualified install byte-equals default and `--platform codex` /
`claude-code` equal today's output; source-checkout init leaves shipped files unchanged; Q3 refusal with no writes;
normal-project rerun after Cursor model change still rewrites its runtime adapters; missing/invalid `defaults/` fails
closed; Q2 tamper/delete test; guarded set equals package `files`; legacy `dev-harness/defaults` does not block migration;
existing-install refresh preserves config/knowledge/records.

Post-integration self-install verification (arc checklist): `git status` shows only `config.json`, `CLAUDE.md`,
`.claude/agents/*`, `.claude/skills/dev-harness`; `git diff --exit-code -- dev-harness/.harness/{defaults,templates,adapters,skills,integrations,cli.mjs}`;
`check`, `check --platform claude-code`, `status` pass; `npm test` passes with and without `claude` on PATH; fresh
temp-repo init config byte-identical to `defaults/config.json`; throwaway ARC from a fresh clone of new main passes
baseline `pinned skill/status/check` and `pinned check --platform claude-code`.

User test handoff: worktree `/Users/scaryguy/Projects/dev-harness-worktrees/WS-soner-can-06--shipped-default-config-separation`; no server — run `npm test` there (~12 min) or the manual init checks in disposable temp repos with `node <worktree>/dev-harness/.harness/cli.mjs init [--platform ID]`. Requirements: Node 20+, git, npm; no `claude`/`codex` needed.

## User confirm checklist

- [x] Fresh `npx dev-harness init` (no flag) in a new repo produces exactly today's v1 Cursor setup.
- [x] Fresh `--platform claude-code` / `--platform codex` installs match today's output.
- [x] Existing installs refresh with config, knowledge, and records preserved.
- [x] Package contains `defaults/config.json` and not the repo's own `config.json`.
- [x] All tests pass, including without `claude` on PATH.
- [x] Baseline pinned skill/status/check pass on the ARC after merge.

## Approvals

- 2026-11-12 · Reviewer (opus, high) · Plan r1 CHANGES-REQUESTED.
- 2026-11-12 · Reviewer (opus, high) · Plan r2 PASS-with-notes (notes folded into this revision: guarded set from package
  `files`; npx hint on missing defaults; legacy-layout choice recorded).
- 2026-11-13T04:46:31.000Z · User · Implementation approval for WS-06 revision 1 (IMPLEMENT only, after WS RESEARCH review PASS). Evidence: "continue".

- 2026-11-13T04:50:03.000Z · Reviewer (opus, high) · WS RESEARCH review revision 1 PASS-with-notes (reviewed @ f6ccbb7).

- 2026-11-13T05:23:21.000Z · Reviewer (opus, high) · Code review revision 1 CHANGES-REQUESTED (worktree 4a915fc + unstaged).

- 2026-11-13T06:15:27.000Z · Reviewer (opus, high) · Code re-review revision 1 PASS-with-notes (final; note: Case-insensitive filesystems: an adapter planning a differently-cased shipped path (e.g. .harness/Templates/arc.md) passes both the collision check (install.mjs:87-88) and the shipped-file guard (cli.mjs:101), which compare exact strings. Requires adapter code; collision layer has the same gap at baseline e7aabbc.)

- 2026-11-13T09:40:17.000Z · User · USER CONFIRM: merge WS-06 revision 1 into the arc; case-folding gap accepted as a known limitation (evidence: "go"). Checklist items verified by the independent reviewer; the user did not report separate manual results.

## Progress ledger

- 2026-11-13T04:44:15.218Z · Soner Can · Created.
- 2026-11-13T04:44:50.000Z · Orchestrator · Revision 1 contract recorded from plan r2; awaiting user implementation approval.
- 2026-11-13T04:46:31.000Z · User · Implementation approved for revision 1 ("continue"). WS RESEARCH review next.
- 2026-11-13T04:50:03.000Z · Reviewer (opus, high) · RESEARCH review r1 PASS-with-notes; notes added to Handoff.
- 2026-11-13T04:50:03.000Z · Orchestrator · RESEARCH exited (user approval + review PASS); IMPLEMENT entered; WS branch/worktree created.
- 2026-11-13T05:09:08.000Z · Owner (opus, low) · Implementation reported ready-for-review from 4a915fc (owner-reported 56/56 twice). Gate → REVIEW.
- 2026-11-13T05:23:21.000Z · Reviewer (opus, high) · CHANGES-REQUESTED: (1 blocking) cli.test.mjs:177-178 asserts sourceClone has no CLAUDE.md/.claude, which fails once the self-install is committed (55/56 reproduced); (2) baseline comparisons skip silently in shallow clones (:1350,:1361,:1381); (3) guarded-set test is literal/regex, not behavioural; (4 minor) raw ENOENT at cli.mjs:187 on legacy source layout, dead `fixed` list at :196. Gate → IMPLEMENT.
- 2026-11-13T05:41:33.000Z · Owner (opus, low) · Review findings 1-4 addressed (owner-reported 58/58 twice). Gate → REVIEW.
- 2026-11-13T06:15:27.000Z · Owner (opus, low) · Guard test fixed to assert the protecting layer per category; 58/58.
- 2026-11-13T06:15:27.000Z · Reviewer (opus, high) · Final code review PASS-with-notes. Gate → USER CONFIRM.
- 2026-11-13T09:40:17.000Z · Orchestrator · WS commit 86752d5 on ws branch; merged into arc as d332a9f (--no-ff). Frozen paths and AGENTS.md identical to e7aabbc; baseline pinned skill/status/check pass; npm pack 18 files with defaults/config.json, without config.json. Full npm test on the arc running.
