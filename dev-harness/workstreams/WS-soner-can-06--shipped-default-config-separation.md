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
  "updated": "2026-11-13T04:46:31.000Z",
  "next": "WS RESEARCH review of revision 1; on PASS create WS branch/worktree and enter IMPLEMENT.",
  "arc": "2026-11-12-soner-can--self-hosted-shipped-defaults",
  "sequence": 6,
  "gate": "RESEARCH",
  "dependencies": [],
  "agentModels": {
    "platform": "claude-code",
    "orchestrator": "opus[effort=high]",
    "reviewer": "opus[effort=high]",
    "owner": "opus[effort=low]"
  },
  "researchState": "awaiting-user-go",
  "implementationApproval": {
    "revision": 1,
    "actor": "User",
    "date": "2026-11-13T04:46:31.000Z",
    "scope": "WS-06 IMPLEMENT only, after WS RESEARCH review PASS",
    "evidence": "continue (reply to: Approve implementation of WS-06 revision 1?)"
  }
}
---

# Shipped default config separation

## Arc

[2026-11-12-soner-can--self-hosted-shipped-defaults](../arcs/2026-11-12-soner-can--self-hosted-shipped-defaults.md)

## Checkout

Fill after implementation approval: WS branch `ws/WS-soner-can-06--shipped-default-config-separation` from
`arc/2026-11-12-soner-can--self-hosted-shipped-defaults`; worktree
`../dev-harness-worktrees/WS-soner-can-06--shipped-default-config-separation/`.

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

Current: `RESEARCH` (user-approved). Next action: WS RESEARCH review of revision 1.

| Gate | Entered | Exited | Outcome |
|------|---------|--------|---------|
| RESEARCH | 2026-11-12 | — | — |

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

## User confirm checklist

- [ ] Fresh `npx dev-harness init` (no flag) in a new repo produces exactly today's v1 Cursor setup.
- [ ] Fresh `--platform claude-code` / `--platform codex` installs match today's output.
- [ ] Existing installs refresh with config, knowledge, and records preserved.
- [ ] Package contains `defaults/config.json` and not the repo's own `config.json`.
- [ ] All tests pass, including without `claude` on PATH.
- [ ] Baseline pinned skill/status/check pass on the ARC after merge.

## Approvals

- 2026-11-12 · Reviewer (opus, high) · Plan r1 CHANGES-REQUESTED.
- 2026-11-12 · Reviewer (opus, high) · Plan r2 PASS-with-notes (notes folded into this revision: guarded set from package
  `files`; npx hint on missing defaults; legacy-layout choice recorded).
- 2026-11-13T04:46:31.000Z · User · Implementation approval for WS-06 revision 1 (IMPLEMENT only, after WS RESEARCH review PASS). Evidence: "continue".

## Progress ledger

- 2026-11-13T04:44:15.218Z · Soner Can · Created.
- 2026-11-13T04:44:50.000Z · Orchestrator · Revision 1 contract recorded from plan r2; awaiting user implementation approval.
- 2026-11-13T04:46:31.000Z · User · Implementation approved for revision 1 ("continue"). WS RESEARCH review next.
