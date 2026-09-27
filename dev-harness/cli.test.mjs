import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, readlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cli = join(dirname(fileURLToPath(import.meta.url)), 'cli.mjs');
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'dev-harness-test-'));
  execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Alex Developer'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'alex@example.invalid'], { cwd: root });
  return root;
}
function run(root, ...args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });
}
function ok(result) {
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test('setup preserves instructions, config, unrelated Cursor files, and reruns safely', () => {
  const root = fixture();
  writeFileSync(join(root, 'AGENTS.md'), '# Existing rules\nKeep these.\n');
  mkdirSync(join(root, '.cursor', 'agents'), { recursive: true });
  writeFileSync(join(root, '.cursor', 'agents', 'existing.md'), 'Existing agent');
  ok(run(root, 'init'));
  const instructions = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  assert.match(instructions, /^# Existing rules\nKeep these./);
  assert.equal(readlinkSync(join(root, '.cursor', 'skills', 'dev-harness')), '../../dev-harness/skills/dev-harness');
  const settingsPath = join(root, 'dev-harness', 'config.json');
  const settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
  settings.git.integrationBranch = 'develop';
  writeFileSync(settingsPath, JSON.stringify(settings));
  ok(run(root, 'init'));
  assert.equal(readFileSync(join(root, 'AGENTS.md'), 'utf8'), instructions);
  assert.equal(JSON.parse(readFileSync(settingsPath, 'utf8')).git.integrationBranch, 'develop');
  assert.equal(readFileSync(join(root, '.cursor', 'agents', 'existing.md'), 'utf8'), 'Existing agent');
  assert.match(ok(run(root, 'status')), /Alex Developer/);
  assert.match(ok(run(root, 'check')), /Valid: 0 records/);
});

test('record IDs isolate users, parent validation works, and status derives from files', () => {
  const root = fixture();
  ok(run(root, 'init'));
  const arc = ok(run(root, 'new', 'arc', 'Search'));
  const ws = ok(run(root, 'new', 'workstream', arc, 'Filters'));
  assert.match(arc, /^ARC-alex-developer-/);
  assert.match(ws, /^WS-alex-developer-/);
  assert.match(ok(run(root, 'status')), /Filters · RESEARCH/);
  assert.match(ok(run(root, 'check')), /Valid: 2 records/);
  assert.notEqual(run(root, 'new', 'workstream', 'missing', 'Invalid').status, 0);
  execFileSync('git', ['config', 'user.email', 'other@example.invalid'], { cwd: root });
  const other = ok(run(root, 'new', 'arc', 'Other'));
  assert.notEqual(arc.split('-').at(-2), other.split('-').at(-2));
  assert.match(ok(run(root, 'status')), /Alex Developer · .*Filters/);
  const path = join(root, 'dev-harness', 'workstreams', `${ws}.md`);
  writeFileSync(path, readFileSync(path, 'utf8').replace('"gate": "RESEARCH"', '"gate": "MADE-UP"'));
  assert.notEqual(run(root, 'check').status, 0);
});

test('setup refuses entry-point collisions before installing any content', () => {
  const root = fixture();
  mkdirSync(join(root, '.cursor', 'skills', 'dev-harness'), { recursive: true });
  assert.notEqual(run(root, 'init').status, 0);
  assert.equal(existsSync(join(root, 'dev-harness')), false);
  assert.equal(existsSync(join(root, 'AGENTS.md')), false);
});

test('model changes sync through init and validation detects stale adapters', () => {
  const root = fixture();
  ok(run(root, 'init'));
  const path = join(root, 'dev-harness', 'config.json');
  const settings = JSON.parse(readFileSync(path, 'utf8'));
  settings.models.subagents = 'grok-4.7[effort=xhigh]';
  writeFileSync(path, JSON.stringify(settings));
  assert.notEqual(run(root, 'check').status, 0);
  ok(run(root, 'init'));
  ok(run(root, 'check'));
  assert.match(readFileSync(join(root, 'dev-harness', 'adapters', 'cursor', 'agents', 'dev-harness-owner.md'), 'utf8'), /model: grok-4.7\[effort=xhigh\]/);
});

test('npm package installs through npx without a checkout or project dependency', () => {
  const packageRoot = dirname(dirname(cli));
  const output = mkdtempSync(join(tmpdir(), 'dev-harness-pack-'));
  const cache = mkdtempSync(join(tmpdir(), 'dev-harness-npm-cache-'));
  const env = { ...process.env, npm_config_cache: cache, npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false' };
  const packed = spawnSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', output], { cwd: packageRoot, env, encoding: 'utf8' });
  const manifest = JSON.parse(ok(packed))[0];
  const files = manifest.files.map(file => file.path);
  assert.ok(files.includes('dev-harness/cli.mjs'));
  assert.ok(files.includes('dev-harness/templates/gitignore'));
  assert.ok(files.every(file => !/^(?:\.git\/|\.cursor\/|AGENTS\.md$|dev-harness\/(?:arcs|workstreams|knowledge|local|cache)\/)/.test(file)));
  assert.ok(!files.includes('dev-harness/cli.test.mjs'));
  const root = fixture();
  const tarball = join(output, manifest.filename);
  ok(spawnSync('npx', ['--yes', '--offline', `--package=${tarball}`, 'dev-harness', 'init'], { cwd: root, env, encoding: 'utf8' }));
  assert.ok(existsSync(join(root, 'dev-harness', 'knowledge', 'context.md')));
  assert.ok(existsSync(join(root, 'dev-harness', '.gitignore')));
  assert.equal(existsSync(join(root, 'node_modules')), false);
  assert.equal(existsSync(join(root, 'package.json')), false);
  assert.equal(existsSync(join(root, 'package-lock.json')), false);
  const installed = join(root, 'dev-harness', 'cli.mjs');
  assert.match(ok(spawnSync(process.execPath, [installed, 'status'], { cwd: root, encoding: 'utf8' })), /Alex Developer/);
  assert.match(ok(spawnSync(process.execPath, [installed, 'check'], { cwd: root, encoding: 'utf8' })), /Valid: 0 records/);
  ok(spawnSync('npx', ['--yes', '--offline', `--package=${tarball}`, 'dev-harness'], { cwd: root, env, encoding: 'utf8' }));
});
