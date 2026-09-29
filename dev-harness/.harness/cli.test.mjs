import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, readlinkSync, readdirSync, renameSync, rmdirSync, symlinkSync, unlinkSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cli = join(dirname(fileURLToPath(import.meta.url)), 'cli.mjs');
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'dev-harness-test-'));
  execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Alex Developer'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'alex@example.invalid'], { cwd: root });
  execFileSync('git', ['commit', '--allow-empty', '-qm', 'Fixture baseline'], { cwd: root });
  return root;
}
function run(root, ...args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });
}
function ok(result) {
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function metadata(path) {
  return JSON.parse(readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/)[1]);
}

function integrateArc(root, arc) {
  execFileSync('git', ['add', '-A'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'Fixture arc'], { cwd: root });
  execFileSync('git', ['switch', '-q', 'main'], { cwd: root });
  execFileSync('git', ['merge', '-q', '--no-ff', '-m', 'Fixture integration', `arc/${arc}`], { cwd: root });
}

test('setup preserves instructions, config, unrelated Cursor files, and reruns safely', () => {
  const root = fixture();
  writeFileSync(join(root, 'AGENTS.md'), '# Existing rules\nKeep these.\n');
  mkdirSync(join(root, '.cursor', 'agents'), { recursive: true });
  writeFileSync(join(root, '.cursor', 'agents', 'existing.md'), 'Existing agent');
  ok(run(root, 'init'));
  const instructions = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  assert.match(instructions, /^# Existing rules\nKeep these./);
  assert.equal(readlinkSync(join(root, '.cursor', 'skills', 'dev-harness')), '../../dev-harness/.harness/skills/dev-harness');
  assert.deepEqual(readdirSync(join(root, 'dev-harness')).sort(), ['.harness', 'arcs', 'workstreams']);
  const settingsPath = join(root, 'dev-harness', '.harness', 'config.json');
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
  assert.equal(execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim(), `arc/${arc}`);
  assert.equal(metadata(join(root, 'dev-harness', 'arcs', `${arc}.md`)).branch, `arc/${arc}`);
  assert.match(metadata(join(root, 'dev-harness', 'arcs', `${arc}.md`)).baseSha, /^[a-f0-9]{40}$/);
  const ws = ok(run(root, 'new', 'workstream', arc, 'Filters'));
  assert.match(arc, /^\d{4}-\d{1,2}-\d{1,2}-alex-developer--search$/);
  assert.equal(ws, 'WS-alex-developer-01--filters');
  assert.match(ok(run(root, 'status')), /Filters · RESEARCH/);
  assert.match(ok(run(root, 'check')), /Valid: 2 records/);
  assert.notEqual(run(root, 'new', 'workstream', 'missing', 'Invalid').status, 0);
  integrateArc(root, arc);
  execFileSync('git', ['config', 'user.email', 'other@example.invalid'], { cwd: root });
  const other = ok(run(root, 'new', 'arc', 'Other'));
  assert.notEqual(metadata(join(root, 'dev-harness', 'arcs', `${arc}.md`)).owner.id,
    metadata(join(root, 'dev-harness', 'arcs', `${other}.md`)).owner.id);
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
  const path = join(root, 'dev-harness', '.harness', 'config.json');
  const settings = JSON.parse(readFileSync(path, 'utf8'));
  settings.models.subagents = 'grok-4.7[effort=xhigh]';
  writeFileSync(path, JSON.stringify(settings));
  assert.notEqual(run(root, 'check').status, 0);
  ok(run(root, 'init'));
  ok(run(root, 'check'));
  assert.match(readFileSync(join(root, 'dev-harness', '.harness', 'adapters', 'cursor', 'agents', 'dev-harness-owner.md'), 'utf8'), /model: grok-4.7\[effort=xhigh\]/);
});

test('npm package installs through npx without a checkout or project dependency', () => {
  const packageRoot = dirname(dirname(dirname(cli)));
  const output = mkdtempSync(join(tmpdir(), 'dev-harness-pack-'));
  const cache = mkdtempSync(join(tmpdir(), 'dev-harness-npm-cache-'));
  const env = { ...process.env, npm_config_cache: cache, npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false' };
  const packed = spawnSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', output], { cwd: packageRoot, env, encoding: 'utf8' });
  const manifest = JSON.parse(ok(packed))[0];
  const files = manifest.files.map(file => file.path);
  assert.ok(files.includes('dev-harness/.harness/cli.mjs'));
  assert.ok(files.includes('dev-harness/.harness/templates/gitignore'));
  assert.ok(files.every(file => !/^(?:\.git\/|\.cursor\/|AGENTS\.md$|dev-harness\/(?:arcs|workstreams)\/|dev-harness\/\.harness\/(?:knowledge|local|cache)\/)/.test(file)));
  assert.ok(!files.includes('dev-harness/.harness/cli.test.mjs'));
  const root = fixture();
  const tarball = join(output, manifest.filename);
  ok(spawnSync('npx', ['--yes', '--offline', `--package=${tarball}`, 'dev-harness', 'init'], { cwd: root, env, encoding: 'utf8' }));
  assert.ok(existsSync(join(root, 'dev-harness', '.harness', 'knowledge', 'context.md')));
  assert.ok(existsSync(join(root, 'dev-harness', '.harness', '.gitignore')));
  assert.deepEqual(readdirSync(join(root, 'dev-harness')).sort(), ['.harness', 'arcs', 'workstreams']);
  assert.equal(existsSync(join(root, 'node_modules')), false);
  assert.equal(existsSync(join(root, 'package.json')), false);
  assert.equal(existsSync(join(root, 'package-lock.json')), false);
  const installed = join(root, 'dev-harness', '.harness', 'cli.mjs');
  assert.match(ok(spawnSync(process.execPath, [installed, 'status'], { cwd: root, encoding: 'utf8' })), /Alex Developer/);
  assert.match(ok(spawnSync(process.execPath, [installed, 'check'], { cwd: root, encoding: 'utf8' })), /Valid: 0 records/);
  ok(spawnSync('npx', ['--yes', '--offline', `--package=${tarball}`, 'dev-harness'], { cwd: root, env, encoding: 'utf8' }));
});

function legacyFixture() {
  const root = fixture();
  ok(run(root, 'init'));
  const arc = ok(run(root, 'new', 'arc', 'Existing arc'));
  const ws = ok(run(root, 'new', 'workstream', arc, 'Existing workstream'));
  const folder = join(root, 'dev-harness');
  const internal = join(folder, '.harness');
  for (const item of readdirSync(internal)) renameSync(join(internal, item), join(folder, item));
  rmdirSync(internal);
  for (const path of [join(root, '.cursor', 'skills', 'dev-harness'), ...['planner', 'reviewer', 'owner'].map(role => join(root, '.cursor', 'agents', `dev-harness-${role}.md`))]) {
    const destination = readlinkSync(path).replace('/.harness/', '/');
    unlinkSync(path);
    symlinkSync(destination, path, path.includes('/skills/') ? 'dir' : 'file');
  }
  for (const path of [join(root, 'AGENTS.md'), join(folder, 'skills', 'dev-harness', 'SKILL.md')]) {
    writeFileSync(path, readFileSync(path, 'utf8').replaceAll('dev-harness/.harness/', 'dev-harness/'));
  }
  return { root, folder, arc, ws };
}

test('legacy migration preserves records, configuration, knowledge, and unrelated instructions', () => {
  const { root, folder, arc, ws } = legacyFixture();
  const settings = JSON.parse(readFileSync(join(folder, 'config.json'), 'utf8'));
  settings.checks = ['npm run lint', 'npm run build'];
  writeFileSync(join(folder, 'config.json'), JSON.stringify(settings));
  writeFileSync(join(folder, 'knowledge', 'context.md'), 'Keep project-specific knowledge.\n');
  const instructions = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  writeFileSync(join(root, 'AGENTS.md'), `# Project rules\nKeep these.\n\n${instructions}`);
  const arcBody = readFileSync(join(folder, 'arcs', `${arc}.md`), 'utf8');
  const wsBody = readFileSync(join(folder, 'workstreams', `${ws}.md`), 'utf8');
  ok(run(root, 'init'));
  assert.deepEqual(readdirSync(folder).sort(), ['.harness', 'arcs', 'workstreams']);
  assert.equal(readFileSync(join(folder, '.harness', 'knowledge', 'context.md'), 'utf8'), 'Keep project-specific knowledge.\n');
  assert.deepEqual(JSON.parse(readFileSync(join(folder, '.harness', 'config.json'), 'utf8')), settings);
  assert.equal(readFileSync(join(folder, 'arcs', `${arc}.md`), 'utf8'), arcBody);
  assert.equal(readFileSync(join(folder, 'workstreams', `${ws}.md`), 'utf8'), wsBody);
  assert.match(readFileSync(join(root, 'AGENTS.md'), 'utf8'), /^# Project rules\nKeep these./);
  assert.match(readFileSync(join(root, 'AGENTS.md'), 'utf8'), /dev-harness\/\.harness\/cli\.mjs status/);
  const installed = join(folder, '.harness', 'cli.mjs');
  assert.match(ok(spawnSync(process.execPath, [installed, 'status'], { cwd: root, encoding: 'utf8' })), /Existing workstream/);
  assert.match(ok(spawnSync(process.execPath, [installed, 'check'], { cwd: root, encoding: 'utf8' })), /Valid: 2 records/);
  ok(run(root, 'init'));
});

test('migration refuses conflicting internals before moving existing files', () => {
  const { root, folder } = legacyFixture();
  mkdirSync(join(folder, '.harness'));
  cpSync(join(folder, 'config.json'), join(folder, '.harness', 'config.json'));
  const before = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  assert.notEqual(run(root, 'init').status, 0);
  assert.ok(existsSync(join(folder, 'cli.mjs')));
  assert.ok(existsSync(join(folder, 'knowledge', 'context.md')));
  assert.equal(readFileSync(join(root, 'AGENTS.md'), 'utf8'), before);
});

test('rerunning init refreshes shipped instructions and preserves project state', () => {
  const root = fixture();
  writeFileSync(join(root, 'AGENTS.md'), '# Existing rules\nKeep these.\n');
  ok(run(root, 'init'));
  const arc = ok(run(root, 'new', 'arc', 'Reviewed proposal'));
  const ws = ok(run(root, 'new', 'workstream', arc, 'Pending approval'));
  const folder = join(root, 'dev-harness');
  const internal = join(folder, '.harness');
  const settings = JSON.parse(readFileSync(join(internal, 'config.json'), 'utf8'));
  settings.models.subagents = 'grok-4.7[effort=xhigh]';
  settings.checks = ['npm run lint'];
  writeFileSync(join(internal, 'config.json'), JSON.stringify(settings));
  writeFileSync(join(internal, 'knowledge', 'context.md'), 'Project-specific knowledge.\n');
  const skill = join(internal, 'skills', 'dev-harness', 'SKILL.md');
  const reviewer = join(internal, 'adapters', 'cursor', 'agents', 'dev-harness-reviewer.md');
  const template = join(internal, 'templates', 'arc.md');
  writeFileSync(skill, 'Stale shipped skill.\n');
  writeFileSync(reviewer, 'Stale shipped reviewer.\n');
  writeFileSync(template, 'Stale shipped template.\n');
  const preserved = [join(root, 'AGENTS.md'), join(internal, 'config.json'), join(internal, 'knowledge', 'context.md'),
    join(folder, 'arcs', `${arc}.md`), join(folder, 'workstreams', `${ws}.md`)];
  const before = preserved.map(path => readFileSync(path, 'utf8'));
  ok(run(root, 'init'));
  assert.deepEqual(preserved.map(path => readFileSync(path, 'utf8')), before);
  assert.equal(readFileSync(skill, 'utf8'), readFileSync(join(dirname(cli), 'skills', 'dev-harness', 'SKILL.md'), 'utf8'));
  assert.equal(readFileSync(template, 'utf8'), readFileSync(join(dirname(cli), 'templates', 'arc.md'), 'utf8'));
  assert.equal(readFileSync(reviewer, 'utf8'), readFileSync(join(dirname(cli), 'adapters', 'cursor', 'agents', 'dev-harness-reviewer.md'), 'utf8')
    .replace(/^model: .+$/m, `model: ${settings.models.subagents}`));
  const snapshot = [skill, reviewer, template, ...preserved].map(path => readFileSync(path, 'utf8'));
  ok(run(root, 'init'));
  assert.deepEqual([skill, reviewer, template, ...preserved].map(path => readFileSync(path, 'utf8')), snapshot);
  assert.deepEqual(readdirSync(join(folder, 'arcs')), [`${arc}.md`]);
  assert.deepEqual(readdirSync(join(folder, 'workstreams')), [`${ws}.md`]);
  assert.match(ok(run(root, 'status')), /Pending approval · RESEARCH/);
  assert.match(ok(run(root, 'check')), /Valid: 2 records/);
});

test('names follow the requested patterns and workstream contracts point directly to their arc', () => {
  const root = fixture();
  execFileSync('git', ['config', 'user.name', 'Soner Can'], { cwd: root });
  ok(run(root, 'init'));
  const now = new Date();
  const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const arc = ok(run(root, 'new', 'arc', 'User authentication'));
  assert.equal(arc, `${date}-soner-can--user-authentication`);
  const ws = ok(run(root, 'new', 'workstream', arc, 'Local auth setup'));
  assert.equal(ws, 'WS-soner-can-01--local-auth-setup');
  const path = join(root, 'dev-harness', 'workstreams', `${ws}.md`);
  assert.equal(metadata(path).arc, arc);
  assert.equal(metadata(path).sequence, 1);
  assert.ok(readFileSync(path, 'utf8').includes(`[${arc}](../arcs/${arc}.md)`));
  const next = ok(run(root, 'new', 'workstream', arc, 'OAuth login setup'));
  assert.equal(next, 'WS-soner-can-02--oauth-login-setup');
  integrateArc(root, arc);
  const secondArc = ok(run(root, 'new', 'arc', 'User profile settings'));
  assert.equal(ok(run(root, 'new', 'workstream', secondArc, 'Profile settings form')), 'WS-soner-can-03--profile-settings-form');
  assert.match(ok(run(root, 'check')), /Valid: 5 records/);
});

test('repeated plan persistence reuses active records without consuming workstream numbers', () => {
  const root = fixture();
  ok(run(root, 'init'));
  const arc = ok(run(root, 'new', 'arc', 'Search tools'));
  const ws = ok(run(root, 'new', 'workstream', arc, 'Search filters'));
  const arcPath = join(root, 'dev-harness', 'arcs', `${arc}.md`);
  const wsPath = join(root, 'dev-harness', 'workstreams', `${ws}.md`);
  const before = [readFileSync(arcPath, 'utf8'), readFileSync(wsPath, 'utf8')];
  assert.equal(ok(run(root, 'new', 'arc', 'Search tools')), arc);
  assert.equal(ok(run(root, 'new', 'workstream', arc, 'Search filters')), ws);
  assert.deepEqual([readFileSync(arcPath, 'utf8'), readFileSync(wsPath, 'utf8')], before);
  assert.equal(ok(run(root, 'new', 'workstream', arc, 'Search results')), 'WS-alex-developer-02--search-results');
});

test('workstream counters survive init and deleted records and remain independent per user', () => {
  const root = fixture();
  ok(run(root, 'init'));
  const arc = ok(run(root, 'new', 'arc', 'Search tools'));
  const ws = ok(run(root, 'new', 'workstream', arc, 'Search filters'));
  unlinkSync(join(root, 'dev-harness', 'workstreams', `${ws}.md`));
  ok(run(root, 'init'));
  assert.equal(ok(run(root, 'new', 'workstream', arc, 'Search results')), 'WS-alex-developer-02--search-results');
  execFileSync('git', ['config', 'user.name', 'Alex Renamed'], { cwd: root });
  assert.equal(ok(run(root, 'new', 'workstream', arc, 'Search pagination')), 'WS-alex-renamed-03--search-pagination');
  execFileSync('git', ['config', 'user.name', 'Jamie Developer'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 'jamie@example.invalid'], { cwd: root });
  assert.equal(ok(run(root, 'new', 'workstream', arc, 'Search sorting')), 'WS-jamie-developer-01--search-sorting');
  assert.match(ok(run(root, 'check')), /Valid: 4 records/);
});

test('short summaries are capped at five words and filename collisions never overwrite records', () => {
  const root = fixture();
  ok(run(root, 'init'));
  const arc = ok(run(root, 'new', 'arc', 'One two three four five six'));
  assert.ok(arc.endsWith('--one-two-three-four-five'));
  const path = join(root, 'dev-harness', 'arcs', `${arc}.md`);
  const before = readFileSync(path, 'utf8');
  assert.notEqual(run(root, 'new', 'arc', 'One two three four five seven').status, 0);
  assert.equal(readFileSync(path, 'utf8'), before);
});

test('validation rejects a missing arc contract but permits repeated numbers with distinct IDs', () => {
  const root = fixture();
  ok(run(root, 'init'));
  const arc = ok(run(root, 'new', 'arc', 'Search tools'));
  const ws = ok(run(root, 'new', 'workstream', arc, 'Search filters'));
  const folder = join(root, 'dev-harness', 'workstreams');
  const path = join(folder, `${ws}.md`);
  const original = readFileSync(path, 'utf8');
  writeFileSync(path, original.replace(/  "arc": "[^"]+",\n/, ''));
  assert.notEqual(run(root, 'check').status, 0);
  writeFileSync(path, original);
  const duplicate = ws.replace('--search-filters', '--duplicate-number');
  writeFileSync(join(folder, `${duplicate}.md`), original.replace(`"id": "${ws}"`, `"id": "${duplicate}"`));
  assert.match(ok(run(root, 'check')), /Valid: 3 records/);
});

test('parallel arc branches can merge distinct workstreams with the same owner number', () => {
  const root = fixture();
  ok(run(root, 'init'));
  execFileSync('git', ['add', '-A'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'Fixture harness'], { cwd: root });

  const firstArc = ok(run(root, 'new', 'arc', 'Profile settings'));
  assert.equal(ok(run(root, 'new', 'workstream', firstArc, 'Profile form')), 'WS-alex-developer-01--profile-form');
  execFileSync('git', ['add', '-A'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'Fixture first arc'], { cwd: root });
  execFileSync('git', ['switch', '-q', 'main'], { cwd: root });

  const secondArc = ok(run(root, 'new', 'arc', 'Search tools'));
  assert.equal(ok(run(root, 'new', 'workstream', secondArc, 'Search filters')), 'WS-alex-developer-01--search-filters');
  execFileSync('git', ['add', '-A'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'Fixture second arc'], { cwd: root });
  execFileSync('git', ['switch', '-q', 'main'], { cwd: root });

  execFileSync('git', ['merge', '-q', '--no-ff', '-m', 'Fixture first integration', `arc/${firstArc}`], { cwd: root });
  execFileSync('git', ['merge', '-q', '--no-ff', '-m', 'Fixture second integration', `arc/${secondArc}`], { cwd: root });
  assert.match(ok(run(root, 'check')), /Valid: 4 records/);
});

test('arc branch precedes records and workstream creation is restricted to its parent arc', () => {
  const root = fixture();
  ok(run(root, 'init'));
  execFileSync('git', ['add', '-A'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'Fixture harness'], { cwd: root });
  writeFileSync(join(root, 'product.txt'), 'Unrelated user change.\n');
  assert.notEqual(run(root, 'new', 'arc', 'Example').status, 0);
  assert.equal(execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim(), 'main');
  unlinkSync(join(root, 'product.txt'));
  const arc = ok(run(root, 'new', 'arc', 'Example'));
  assert.equal(execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim(), `arc/${arc}`);
  execFileSync('git', ['add', '-A'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'Fixture arc draft'], { cwd: root });
  execFileSync('git', ['switch', '-q', 'main'], { cwd: root });
  assert.equal(existsSync(join(root, 'dev-harness', 'arcs', `${arc}.md`)), false);
  assert.notEqual(run(root, 'new', 'workstream', arc, 'Example slice').status, 0);
  execFileSync('git', ['switch', '-q', `arc/${arc}`], { cwd: root });
  const ws = ok(run(root, 'new', 'workstream', arc, 'Example slice'));
  assert.ok(existsSync(join(root, 'dev-harness', 'workstreams', `${ws}.md`)));
});
