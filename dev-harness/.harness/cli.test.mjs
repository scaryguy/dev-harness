import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, lstatSync, readlinkSync, readdirSync, realpathSync, renameSync, rmSync, rmdirSync, symlinkSync, unlinkSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
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

function snapshotTree(root) {
  const snapshot = [];
  function visit(folder, prefix = '') {
    for (const name of readdirSync(folder).sort()) {
      const relativePath = prefix ? `${prefix}/${name}` : name;
      const path = join(folder, name);
      const stat = lstatSync(path);
      if (stat.isDirectory()) {
        snapshot.push([relativePath, 'directory']);
        visit(path, relativePath);
      } else if (stat.isSymbolicLink()) {
        snapshot.push([relativePath, 'symlink', readlinkSync(path)]);
      } else {
        snapshot.push([relativePath, 'file', createHash('sha256').update(readFileSync(path)).digest('hex')]);
      }
    }
  }
  visit(root);
  return snapshot;
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
  const sourceClone = join(output, 'source-clone');
  execFileSync('git', ['clone', '-q', '--no-local', packageRoot, sourceClone]);
  function assertSourceRefused() {
    const before = snapshotTree(sourceClone);
    const refused = spawnSync('npx', ['--yes', '--offline', `--package=${tarball}`, 'dev-harness', 'init'],
      { cwd: sourceClone, env, encoding: 'utf8' });
    assert.notEqual(refused.status, 0);
    assert.match(refused.stderr, /Refusing to init a Dev Harness package source checkout from an external package/);
    assert.deepEqual(snapshotTree(sourceClone), before);
  }
  assertSourceRefused();
  const packagePath = join(sourceClone, 'package.json');
  const originalPackage = readFileSync(packagePath, 'utf8');
  const editedPackage = JSON.parse(originalPackage);
  editedPackage.name = 'temporarily-renamed-package';
  writeFileSync(packagePath, JSON.stringify(editedPackage));
  assertSourceRefused();
  writeFileSync(packagePath, '{ malformed package manifest\n');
  assertSourceRefused();
  writeFileSync(packagePath, originalPackage);
  execFileSync('git', ['rm', '--cached', '-q', '--', 'dev-harness/.harness/templates/arc.md'], { cwd: sourceClone });
  assertSourceRefused();
  const localCli = join(sourceClone, 'dev-harness', '.harness', 'cli.mjs');
  cpSync(cli, localCli);
  ok(spawnSync(process.execPath, [localCli, 'init'],
    { cwd: sourceClone, encoding: 'utf8' }));

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
  const arc = ok(spawnSync(process.execPath, [installed, 'new', 'arc', 'Existing work'], { cwd: root, encoding: 'utf8' }));
  const ws = ok(spawnSync(process.execPath, [installed, 'new', 'workstream', arc, 'Existing slice'], { cwd: root, encoding: 'utf8' }));
  const configPath = join(root, 'dev-harness', '.harness', 'config.json');
  const settings = JSON.parse(readFileSync(configPath, 'utf8'));
  settings.git.integrationBranch = 'develop';
  writeFileSync(configPath, JSON.stringify(settings));
  const knowledgePath = join(root, 'dev-harness', '.harness', 'knowledge', 'context.md');
  writeFileSync(knowledgePath, 'Project-specific knowledge.\n');
  const agentsPath = join(root, 'AGENTS.md');
  writeFileSync(agentsPath, `${readFileSync(agentsPath, 'utf8')}\n# Unrelated instructions\nKeep these.\n`);
  const preserved = [configPath, knowledgePath, agentsPath,
    join(root, 'dev-harness', 'arcs', `${arc}.md`), join(root, 'dev-harness', 'workstreams', `${ws}.md`)];
  const before = preserved.map(path => readFileSync(path, 'utf8'));
  ok(spawnSync('npx', ['--yes', '--offline', `--package=${tarball}`, 'dev-harness'], { cwd: root, env, encoding: 'utf8' }));
  assert.deepEqual(preserved.map(path => readFileSync(path, 'utf8')), before);
  assert.match(ok(spawnSync(process.execPath, [installed, 'check'], { cwd: root, encoding: 'utf8' })), /Valid: 2 records/);
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

function sourceFixture(changeBaseline = () => {}) {
  const root = fixture();
  ok(run(root, 'init'));
  cpSync(join(dirname(dirname(dirname(cli))), 'package.json'), join(root, 'package.json'));
  const localCli = join(root, 'dev-harness', '.harness', 'cli.mjs');
  const skill = join(root, 'dev-harness', '.harness', 'skills', 'dev-harness', 'SKILL.md');
  const baselineCli = readFileSync(localCli, 'utf8').replace('function status() {',
    'function status() { console.log("BASELINE STATUS"); console.log("RUNTIME " + source); console.log("CWD " + root);')
    .replace('console.log(`Valid:', 'console.log("BASELINE CHECK"); console.log(`Valid:');
  const baselineSkill = `${readFileSync(skill, 'utf8')}\nBASELINE SKILL\n`;
  writeFileSync(localCli, baselineCli);
  writeFileSync(skill, baselineSkill);
  changeBaseline(root);
  execFileSync('git', ['add', '-A'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'Fixture source baseline'], { cwd: root });
  const base = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  // A missing or invalid historical input must not change source detection at HEAD.
  writeFileSync(localCli, baselineCli);
  if (existsSync(skill) && !lstatSync(skill).isFile()) rmSync(skill, { recursive: true });
  writeFileSync(skill, baselineSkill);
  execFileSync('git', ['add', '-A'], { cwd: root });
  execFileSync('git', ['commit', '--allow-empty', '-qm', 'Fixture current source'], { cwd: root });
  ok(spawnSync(process.execPath, [localCli, 'init'], { cwd: root, encoding: 'utf8' }));
  execFileSync('git', ['add', '-A'], { cwd: root });
  execFileSync('git', ['commit', '--allow-empty', '-qm', 'Fixture source bootstrap'], { cwd: root });
  const arc = ok(run(root, 'new', 'arc', 'Pinned governance'));
  const arcPath = join(root, 'dev-harness', 'arcs', `${arc}.md`);
  setMetadata(arcPath, { baseSha: base });
  execFileSync('git', ['add', '-A'], { cwd: root });
  execFileSync('git', ['commit', '-qm', 'Fixture source arc'], { cwd: root });
  return { root, localCli, skill, arc, arcPath, base, baselineSkill };
}

function setMetadata(path, values) {
  const body = readFileSync(path, 'utf8');
  writeFileSync(path, body.replace(/^---\n[\s\S]*?\n---/, `---\n${JSON.stringify({ ...metadata(path), ...values }, null, 2)}\n---`));
}

function pinnedRun(source, ...args) {
  return spawnSync(process.execPath, [source.localCli, 'pinned', ...args], { cwd: source.root, encoding: 'utf8' });
}

test('source ARC keeps committed skill and CLI through candidate WS merge and final approval', () => {
  const source = sourceFixture();
  assert.equal(ok(pinnedRun(source, 'skill')), source.baselineSkill.trim());
  const before = readFileSync(join(source.root, 'AGENTS.md'), 'utf8');
  assert.match(before, /git show BASE_SHA:dev-harness\/\.harness\/skills\/dev-harness\/SKILL.md/);
  assert.match(before, /before following live instructions/);
  assert.match(before, /Never invoke the live candidate CLI's pinned dispatcher/);
  execFileSync('git', ['switch', '-qc', 'ws/fixture-candidate'], { cwd: source.root });
  writeFileSync(source.localCli, readFileSync(source.localCli, 'utf8').replaceAll('BASELINE STATUS', 'CANDIDATE STATUS').replaceAll('BASELINE CHECK', 'CANDIDATE CHECK'));
  writeFileSync(source.skill, 'CANDIDATE SKILL\n');
  assert.notEqual(pinnedRun(source, 'status').status, 0, 'WS cwd cannot govern its parent ARC');
  execFileSync('git', ['add', '-A'], { cwd: source.root });
  execFileSync('git', ['commit', '-qm', 'Fixture candidate workflow'], { cwd: source.root });
  execFileSync('git', ['switch', '-q', `arc/${source.arc}`], { cwd: source.root });
  execFileSync('git', ['merge', '-q', '--no-ff', '-m', 'Fixture candidate merge', 'ws/fixture-candidate'], { cwd: source.root });
  assert.equal(ok(pinnedRun(source, 'skill')), source.baselineSkill.trim());
  const output = ok(pinnedRun(source, 'status'));
  assert.match(output, /BASELINE STATUS/);
  assert.doesNotMatch(output, /CANDIDATE STATUS/);
  assert.equal(realpathSync(output.match(/^CWD (.+)$/m)[1]), realpathSync(source.root));
  const runtime = output.match(/^RUNTIME (.+)$/m)[1];
  assert.ok(relative(realpathSync(source.root), runtime).startsWith('..'));
  assert.equal(existsSync(runtime), false, 'temporary runtime is removed after execution');
  assert.match(ok(pinnedRun(source, 'check')), /BASELINE CHECK/);
  const ws = ok(pinnedRun(source, 'new', 'workstream', source.arc, 'Baseline governed slice'));
  assert.ok(existsSync(join(source.root, 'dev-harness', 'workstreams', `${ws}.md`)), 'records stay in ARC cwd');
  assert.notEqual(pinnedRun(source, 'new', 'workstream', 'other-arc', 'Wrong parent').status, 0);
  setMetadata(source.arcPath, { status: 'complete', next: 'Await integration approval.' });
  assert.match(ok(pinnedRun(source, 'check')), /BASELINE CHECK/);
  assert.equal(readFileSync(join(source.root, 'AGENTS.md'), 'utf8'), before);
});

test('pinned governance rejects malformed, missing, noncommit, and unrelated bases', () => {
  const source = sourceFixture();
  const tree = execFileSync('git', ['rev-parse', `${source.base}^{tree}`], { cwd: source.root, encoding: 'utf8' }).trim();
  const unrelated = execFileSync('git', ['commit-tree', tree, '-m', 'Unrelated fixture root'], { cwd: source.root, encoding: 'utf8' }).trim();
  for (const baseSha of [null, source.base.slice(0, 7), '../main', '0'.repeat(40), tree, unrelated]) {
    setMetadata(source.arcPath, { baseSha });
    const result = pinnedRun(source, 'status');
    assert.notEqual(result.status, 0, `must reject ${baseSha}`);
    assert.doesNotMatch(result.stdout, /BASELINE STATUS|CANDIDATE STATUS/);
  }
  setMetadata(source.arcPath, { baseSha: source.base, id: 'wrong-arc' });
  assert.match(pinnedRun(source, 'skill').stderr, /does not match the current branch/);
});

test('missing baseline CLI or skill blobs and older baselines fail without live fallback', () => {
  for (const path of ['cli.mjs', 'skills/dev-harness/SKILL.md']) {
    const source = sourceFixture(root => unlinkSync(join(root, 'dev-harness', '.harness', path)));
    const result = pinnedRun(source, 'skill');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Missing baseline blob/);
    assert.equal(result.stdout, '');
  }
  const source = sourceFixture(root => {
    const path = join(root, 'dev-harness', '.harness', 'cli.mjs');
    writeFileSync(path, readFileSync(path, 'utf8').replace('const pinnedRuntimeVersion = 1;', ''));
  });
  assert.match(pinnedRun(source, 'status').stderr, /predates pinned support.*manual baseline bootstrap/);
});

test('baseline skill must be a regular file, not a symlink blob or tree', () => {
  for (const kind of ['symlink', 'tree']) {
    const source = sourceFixture(root => {
      const path = join(root, 'dev-harness', '.harness', 'skills', 'dev-harness', 'SKILL.md');
      unlinkSync(path);
      if (kind === 'symlink') symlinkSync('../../config.json', path);
      else { mkdirSync(path); writeFileSync(join(path, 'nested.md'), 'Not a skill file'); }
    });
    assert.match(pinnedRun(source, 'skill').stderr, /Missing baseline blob/);
  }
});

test('companion byte changes, absent files, extras, and symlinks fail before baseline commands', () => {
  const source = sourceFixture();
  const internal = join(source.root, 'dev-harness', '.harness');
  for (const path of ['config.json', 'templates/workstream.md', 'adapters/cursor/agents/dev-harness-owner.md']) {
    const file = join(internal, path);
    const original = readFileSync(file);
    writeFileSync(file, Buffer.concat([original, Buffer.from('\nChanged companion\n')]));
    const result = pinnedRun(source, 'status');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Live companion differs/);
    assert.equal(result.stdout, '');
    assert.equal(ok(pinnedRun(source, 'skill')), source.baselineSkill.trim(), 'skill is read before companion instructions');
    writeFileSync(file, original);
    unlinkSync(file);
    assert.notEqual(pinnedRun(source, 'check').status, 0);
    writeFileSync(file, original);
    const duplicate = join(internal, 'duplicate.txt');
    writeFileSync(duplicate, original);
    unlinkSync(file);
    symlinkSync(duplicate, file);
    assert.match(pinnedRun(source, 'status').stderr, /Invalid live companion/);
    unlinkSync(file);
    unlinkSync(duplicate);
    writeFileSync(file, original);
  }
  const extra = join(internal, 'templates', 'extra.md');
  writeFileSync(extra, 'Extra companion\n');
  assert.match(pinnedRun(source, 'new', 'workstream', source.arc, 'Never created').stderr, /file set differs/);
  assert.equal(readdirSync(join(source.root, 'dev-harness', 'workstreams')).length, 0);
  unlinkSync(extra);
  assert.match(ok(pinnedRun(source, 'check')), /BASELINE CHECK/);
});

test('missing required baseline companions fail closed', () => {
  const source = sourceFixture(root => unlinkSync(join(root, 'dev-harness', '.harness', 'templates', 'workstream.md')));
  assert.match(pinnedRun(source, 'check').stderr, /Missing baseline blob.*workstream.md/);
});

test('pinned init and unsupported commands do not mutate the source checkout', () => {
  const source = sourceFixture();
  const before = snapshotTree(source.root);
  for (const args of [['init'], ['new', 'arc', 'Other arc'], ['unknown']]) {
    assert.notEqual(pinnedRun(source, ...args).status, 0);
    assert.deepEqual(snapshotTree(source.root), before);
  }
  assert.match(pinnedRun(source, 'init').stderr, /forbids init/);
});

test('pinned runtime refuses a repository-local temporary directory', () => {
  const source = sourceFixture();
  const result = spawnSync(process.execPath, [source.localCli, 'pinned', 'status'], {
    cwd: source.root, encoding: 'utf8', env: { ...process.env, TMPDIR: source.root, TMP: source.root, TEMP: source.root }
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /temporary directory outside the repository/);
  assert.doesNotMatch(result.stdout, /BASELINE STATUS/);
  assert.ok(readdirSync(source.root).every(path => !path.startsWith('dev-harness-pinned-')));
});

test('ordinary project first ARC still works before any scaffold commit and cannot use source pinning', () => {
  const root = fixture();
  ok(run(root, 'init'));
  ok(run(root, 'init'));
  assert.match(execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }), /dev-harness/);
  const arc = ok(run(root, 'new', 'arc', 'First uncommitted scaffold'));
  assert.match(ok(run(root, 'check')), /Valid: 1 records/);
  const installed = join(root, 'dev-harness', '.harness', 'cli.mjs');
  const result = spawnSync(process.execPath, [installed, 'pinned', 'status'], { cwd: root, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /only for a Dev Harness package source checkout/);
  assert.doesNotMatch(readFileSync(join(root, 'AGENTS.md'), 'utf8'), /pinned <command>/);
  assert.equal(metadata(join(root, 'dev-harness', 'arcs', `${arc}.md`)).status, 'draft');
});

test('documented independent bootstrap uses committed dispatcher when candidate pinned itself changes', () => {
  const source = sourceFixture();
  // Read bootstrap instructions from Git before candidate instructions can change.
  const baselineSkill = execFileSync('git', ['show', `${source.base}:dev-harness/.harness/skills/dev-harness/SKILL.md`],
    { cwd: source.root, encoding: 'utf8' });
  const bootstrap = baselineSkill.match(/```js\n([\s\S]*?)\n```/)[1];
  assert.match(baselineSkill, /before invoking any dispatcher/);
  assert.doesNotMatch(baselineSkill, /`node dev-harness\/\.harness\/cli\.mjs pinned /);
  execFileSync('git', ['switch', '-qc', 'ws/fixture-dispatcher-change'], { cwd: source.root });
  writeFileSync(source.localCli, readFileSync(source.localCli, 'utf8')
    .replace('function pinned(args) {', 'function pinned(args) { console.log("CANDIDATE GOVERNANCE"); return;'));
  writeFileSync(source.skill, 'CANDIDATE GOVERNANCE INSTRUCTIONS\n');
  execFileSync('git', ['add', '-A'], { cwd: source.root });
  execFileSync('git', ['commit', '-qm', 'Fixture candidate dispatcher'], { cwd: source.root });
  execFileSync('git', ['switch', '-q', `arc/${source.arc}`], { cwd: source.root });
  execFileSync('git', ['merge', '-q', '--no-ff', '-m', 'Fixture dispatcher merge', 'ws/fixture-dispatcher-change'], { cwd: source.root });
  assert.equal(ok(pinnedRun(source, 'check')), 'CANDIDATE GOVERNANCE', 'live entrypoint reproduces the review finding');
  function independent(...args) {
    return spawnSync(process.execPath, ['--input-type=module', '-', 'pinned', ...args], {
      cwd: source.root, encoding: 'utf8', input: bootstrap,
      env: { ...process.env, DEV_HARNESS_BASE_SHA: metadata(source.arcPath).baseSha }
    });
  }
  assert.equal(ok(independent('skill')), baselineSkill.trim());
  const output = ok(independent('check'));
  assert.match(output, /BASELINE CHECK/);
  assert.match(output, /Valid: 1 records/);
  assert.doesNotMatch(output, /CANDIDATE GOVERNANCE/);
  setMetadata(source.arcPath, { status: 'complete', next: 'Await integration approval.' });
  assert.match(ok(independent('check')), /BASELINE CHECK/);
  assert.notEqual(independent('init').status, 0);
  setMetadata(source.arcPath, { baseSha: source.base.slice(0, 7) });
  assert.notEqual(independent('check').status, 0, 'independent extraction rejects malformed SHA before any dispatcher');
});
