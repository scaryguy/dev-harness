import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync, lstatSync, readlinkSync, readdirSync, realpathSync, renameSync, rmSync, rmdirSync, symlinkSync, unlinkSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, relative } from 'node:path';
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
  cpSync(join(dirname(cli), 'integrations'), join(dirname(localCli), 'integrations'), { recursive: true });
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
  const baselineCli = readFileSync(localCli, 'utf8').replace('function status(ids = []) {',
    'function status(ids = []) { console.log("BASELINE STATUS"); console.log("RUNTIME " + source); console.log("CWD " + root);')
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

test('explicit Cursor migration preserves opaque config and local data; selectors never rewrite', () => {
  const root = fixture(); ok(run(root, 'init'));
  const runtime = join(root, 'dev-harness/.harness');
  const path = join(runtime, 'config.json');
  const original = JSON.parse(readFileSync(path));
  original.models.extension = { custom: true }; original.custom = ['opaque'];
  original.models.subagents = 'custom-model[effort=opaque]';
  writeFileSync(path, JSON.stringify(original));
  for (const folder of ['state', 'local', 'cache', 'knowledge']) { mkdirSync(join(runtime, folder), { recursive: true }); writeFileSync(join(runtime, folder, 'preserve'), folder); }
  ok(run(root, 'init', '--platform', 'cursor', '--platform', 'cursor'));
  const migrated = JSON.parse(readFileSync(path));
  assert.equal(migrated.version, 2); assert.deepEqual(migrated.models, original.models);
  assert.deepEqual(migrated.custom, original.custom); assert.deepEqual(migrated.installedPlatforms, ['cursor']);
  assert.equal(migrated.adapters.cursor.models.owner.model, original.models.subagents);
  const before = snapshotTree(root);
  ok(run(root, 'status', '--platform', 'cursor')); ok(run(root, 'check', '--platform', 'cursor'));
  assert.deepEqual(snapshotTree(root), before);
  ok(run(root, 'init'));
  for (const folder of ['state', 'local', 'cache', 'knowledge']) assert.equal(readFileSync(join(runtime, folder, 'preserve'), 'utf8'), folder);
});

test('flags, config collisions, malformed blocks and unsafe parents refuse before writes', () => {
  for (const args of [['init', '--platform'], ['init', '--platform', 'unknown'], ['init', '--bogus'], ['status', '--platform', 'cursor', '--platform', 'cursor'], ['check', '--bogus']]) {
    const root = fixture(); const before = snapshotTree(root);
    assert.notEqual(run(root, ...args).status, 0); assert.deepEqual(snapshotTree(root), before);
  }
  for (const mutation of [root => writeFileSync(join(root, 'AGENTS.md'), '<!-- dev-harness:end -->\n<!-- dev-harness:start -->'), root => { const other = mkdtempSync(join(tmpdir(), 'unsafe-parent-')); symlinkSync(other, join(root, '.cursor')); }, root => { ok(run(root, 'init')); const path = join(root, 'dev-harness/.harness/config.json'); const value = JSON.parse(readFileSync(path)); value.adapters = { extension: true }; writeFileSync(path, JSON.stringify(value)); }]) {
    const root = fixture(); mutation(root); const before = snapshotTree(root);
    assert.notEqual(run(root, 'init', '--platform', 'cursor').status, 0); assert.deepEqual(snapshotTree(root), before);
  }
});

function modularFixture() {
  const root = fixture();
  const runtime = mkdtempSync(join(tmpdir(), 'dev-harness-modular-runtime-'));
  cpSync(dirname(cli), runtime, { recursive: true });
  const dummy = `import { readFileSync } from 'node:fs';\nimport { join } from 'node:path';\nexport default { id:'dummy', label:'Dummy', defaults:{orchestrator:{model:'dummy-high'},planner:{model:'dummy-high'},reviewer:{model:'dummy-high'},owner:{model:'dummy-low'}}, capabilities:{instructionDiscovery:true,delegation:true,roleSettings:true,externalWorktrees:true,backgroundExecution:true}, validateSettings(s){if(!s?.models?.orchestrator?.model)throw Error('Invalid dummy')}, planArtifacts(){return {files:[{path:'dev-harness/.harness/dummy.md',content:'dummy',ownership:'builtin'}],links:[{path:'.dummy/entry',target:'dev-harness/.harness/dummy.md',type:'file',legacyTargets:[]}]}},checkArtifacts(c){if(readFileSync(join(c.targetRoot,'.dummy/entry'),'utf8')!=='dummy')throw Error('Bad dummy')},startupGuidance(){return 'Dummy ready --platform dummy'}};`;
  writeFileSync(join(runtime, 'integrations/dummy.mjs'), dummy);
  const registry = join(runtime, 'integrations/registry.mjs');
  writeFileSync(registry, readFileSync(registry, 'utf8').replace("import cursor from './cursor.mjs';", "import cursor from './cursor.mjs';\nimport dummy from './dummy.mjs';").replace('[cursor, codex]', '[cursor, dummy, codex]'));
  return { root, runtime, execute: (...args) => spawnSync(process.execPath, [join(runtime, 'cli.mjs'), ...args], { cwd: root, encoding: 'utf8' }) };
}

test('fixture-only adapter installs alone, adds Cursor, displays all models and shares records', () => {
  const { root, execute } = modularFixture();
  ok(execute('init', '--platform', 'dummy'));
  assert.equal(existsSync(join(root, '.cursor')), false);
  const before = snapshotTree(root);
  assert.notEqual(execute('check', '--platform', 'cursor').status, 0);
  assert.deepEqual(snapshotTree(root), before);
  ok(execute('init', '--platform', 'cursor', '--platform', 'dummy'));
  const path = join(root, 'dev-harness/.harness/config.json');
  const settings = JSON.parse(readFileSync(path)); settings.adapters.opaque = { keep: true }; writeFileSync(path, JSON.stringify(settings));
  ok(execute('init')); assert.deepEqual(JSON.parse(readFileSync(path)).adapters.opaque, { keep: true });
  const arc = ok(execute('new', 'arc', 'Shared record'));
  const status = ok(execute('status'));
  assert.match(status, /Dummy · Orchestrator: dummy-high \(configured\)/);
  assert.match(status, /Cursor · Orchestrator:/); assert.equal(status.split('\n').filter(line => line.includes(` · ${arc} · `)).length, 1);
  ok(execute('check', '--platform', 'dummy'));
  const record = join(root, 'dev-harness/arcs', `${arc}.md`);
  writeFileSync(record, 'bad'); assert.notEqual(execute('check', '--platform', 'dummy').status, 0);
});

test('aggregate adapter collisions and unsafe declarations refuse a whole install', () => {
  for (const change of [text => text.replace("path:'.dummy/entry'", "path:'.cursor/skills/dev-harness'"), text => text.replace("path:'.dummy/entry'", "path:'../escape'"), text => text.replace("path:'.dummy/entry'", "path:'dev-harness/.harness/config.json'"), text => text.replaceAll('dev-harness/.harness/dummy.md', 'dev-harness/.harness/state/preserve'), text => text.replaceAll('dev-harness/.harness/dummy.md', 'dev-harness/.harness/knowledge/context.md')]) {
    const { root, runtime, execute } = modularFixture();
    const path = join(runtime, 'integrations/dummy.mjs'); writeFileSync(path, change(readFileSync(path, 'utf8')));
    const before = snapshotTree(root); assert.notEqual(execute('init', '--platform', 'cursor', '--platform', 'dummy').status, 0); assert.deepEqual(snapshotTree(root), before);
  }
});

test('future standalone bootstrap extracts only committed modules despite live tampering', () => {
  const source = sourceFixture();
  const extracted = join(mkdtempSync(join(tmpdir(), 'standalone-baseline-')), 'cli.mjs');
  writeFileSync(extracted, execFileSync('git', ['show', `${source.base}:dev-harness/.harness/cli.mjs`], { cwd: source.root }));
  const integration = join(source.root, 'dev-harness/.harness/integrations');
  writeFileSync(join(integration, 'registry.mjs'), 'throw Error("CANDIDATE EXECUTED");');
  writeFileSync(join(integration, 'extra.mjs'), 'throw Error("EXTRA EXECUTED");');
  const result = spawnSync(process.execPath, [extracted, 'pinned', 'status'], { cwd: source.root, encoding: 'utf8' });
  assert.match(ok(result), /BASELINE STATUS/); assert.doesNotMatch(result.stderr, /EXECUTED/);
});

test('future committed missing, nonregular, and escaping dependencies fail closed', () => {
  const mutations = [
    root => unlinkSync(join(root, 'dev-harness/.harness/integrations/cursor.mjs')),
    root => { const path = join(root, 'dev-harness/.harness/integrations/install.mjs'); unlinkSync(path); symlinkSync('cursor.mjs', path); },
    root => { const path = join(root, 'dev-harness/.harness/integrations/registry.mjs'); writeFileSync(path, readFileSync(path, 'utf8') + "\nimport '../candidate.mjs';\n"); }
  ];
  for (const mutate of mutations) {
    // Build a valid source fixture first, then commit a malformed future base;
    // leave current runtime valid so no candidate code supplies its dependencies.
    const source = sourceFixture();
    const modules = join(source.root, 'dev-harness/.harness/integrations');
    const backup = mkdtempSync(join(tmpdir(), 'module-backup-')); cpSync(modules, backup, { recursive: true });
    mutate(source.root);
    execFileSync('git', ['add', '-A'], { cwd: source.root }); execFileSync('git', ['commit', '-qm', 'Malformed future base'], { cwd: source.root });
    const baseSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source.root, encoding: 'utf8' }).trim();
    rmSync(modules, { recursive: true }); cpSync(backup, modules, { recursive: true }); setMetadata(source.arcPath, { baseSha });
    const before = snapshotTree(source.root); assert.notEqual(pinnedRun(source, 'check').status, 0); assert.deepEqual(snapshotTree(source.root), before);
  }
});

test('v1 ordinary reads preserve config bytes and selected checks validate shared config', () => {
  const root = fixture(); ok(run(root, 'init'));
  const path = join(root, 'dev-harness/.harness/config.json'); const bytes = readFileSync(path);
  ok(run(root, 'status')); ok(run(root, 'check')); assert.deepEqual(readFileSync(path), bytes);
  const value = JSON.parse(bytes); value.checks = [1]; writeFileSync(path, JSON.stringify(value));
  const before = snapshotTree(root); assert.notEqual(run(root, 'check', '--platform', 'cursor').status, 0); assert.deepEqual(snapshotTree(root), before);
});

test('wrong runtime directory types and unsafe config leaves refuse before refresh', () => {
  for (const name of ['templates', 'skills', 'adapters', 'integrations']) {
    const root = fixture(); ok(run(root, 'init'));
    const path = join(root, 'dev-harness/.harness', name); rmSync(path, { recursive: true }); writeFileSync(path, 'occupied');
    const before = snapshotTree(root); assert.notEqual(run(root, 'init').status, 0); assert.deepEqual(snapshotTree(root), before);
  }
  const root = fixture(); ok(run(root, 'init'));
  const path = join(root, 'dev-harness/.harness/config.json'); const other = join(mkdtempSync(join(tmpdir(), 'config-leaf-')), 'config.json'); renameSync(path, other); symlinkSync(other, path);
  const before = snapshotTree(root); assert.notEqual(run(root, 'init').status, 0); assert.deepEqual(snapshotTree(root), before);
});

test('nested refresh type conflicts preserve stale CLI and the whole target in both layouts', () => {
  for (const legacy of [false, true]) {
    for (const [name, type] of [['templates/workstream.md', 'dir'], ['skills/dev-harness', 'file'], ['integrations/registry.mjs', 'dir'], ['adapters/cursor/agents', 'file']]) {
      const root = fixture(); ok(run(root, 'init'));
      const runtime = join(root, 'dev-harness/.harness');
      writeFileSync(join(runtime, 'cli.mjs'), 'STALE CLI SENTINEL');
      const path = join(runtime, name); rmSync(path, { recursive: true });
      if (type === 'dir') mkdirSync(path); else writeFileSync(path, 'occupied');
      if (legacy) {
        for (const item of readdirSync(runtime)) renameSync(join(runtime, item), join(root, 'dev-harness', item));
        rmdirSync(runtime);
      }
      const before = snapshotTree(root);
      assert.notEqual(run(root, 'init').status, 0);
      assert.deepEqual(snapshotTree(root), before);
      assert.equal(readFileSync(join(root, legacy ? 'dev-harness/cli.mjs' : 'dev-harness/.harness/cli.mjs'), 'utf8'), 'STALE CLI SENTINEL');
    }
  }
});

function dependencyFixture(code) {
  const source = sourceFixture();
  const path = join(source.root, 'dev-harness/.harness/integrations/registry.mjs');
  writeFileSync(path, readFileSync(path, 'utf8') + '\n' + code);
  execFileSync('git', ['add', '-A'], { cwd: source.root });
  execFileSync('git', ['commit', '-qm', 'Dependency syntax baseline'], { cwd: source.root });
  setMetadata(source.arcPath, { baseSha: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source.root, encoding: 'utf8' }).trim() });
  return source;
}

test('restricted dependency grammar rejects commented, escaped, template and export escapes before execution', () => {
  const outside = mkdtempSync(join(tmpdir(), 'dependency-sentinel-'));
  const module = join(outside, 'outside.mjs'); const marker = join(outside, 'executed');
  writeFileSync(module, "import {writeFileSync} from 'node:fs';\nwriteFileSync(" + JSON.stringify(marker) + ", 'executed');\nexport default null;\n");
  const quoted = JSON.stringify(module);
  const probes = [
    'import /* dependency */ ' + quoted + ';',
    'import /* dependency */ (' + quoted + ');',
    'const forbidden = `template ${import(' + quoted + ')}`;',
    'import "\\u002f' + module.slice(1) + '";',
    'export { default as outside } /* dependency */ from ' + quoted + ';',
    "import 'node:not_a_real_builtin';"
  ];
  for (const code of probes) {
    const source = dependencyFixture(code); const before = snapshotTree(source.root);
    assert.notEqual(pinnedRun(source, 'status').status, 0, code);
    assert.equal(existsSync(marker), false, code);
    assert.deepEqual(snapshotTree(source.root), before);
  }
});

test('restricted dependency grammar accepts commented static imports, exports and inert import text', () => {
  const source = dependencyFixture(`
// import('/outside.mjs'); export * from '/outside.mjs';
/* import '/outside.mjs'; */
const inert = "import('/outside.mjs');";
const escapedString = 'quote\\\' import /outside';
import /* comments */ cursorAlias /* binding */ from /* source */ './cursor.mjs';
import /* namespace */ * as configNamespace from './config.mjs';
import { normalize as alias, planConfig, } from './config.mjs';
import /* side effect */ './install.mjs';
export { alias as normalized };
export { default as cursorAgain } /* comments */ from './cursor.mjs';
export * /* comments */ from './config.mjs';
export * as configAgain from './config.mjs';
export async function example() { return inert; }
`);
  assert.match(ok(pinnedRun(source, 'status')), /BASELINE STATUS/);
});

function gitBin() {
  return dirname(execFileSync('which', ['git'], { encoding: 'utf8' }).trim());
}
function runWith(root, env, ...args) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8', env });
}
function codexEnvironment(version = 'codex-cli 0.162.1') {
  const home = mkdtempSync(join(tmpdir(), 'dev-harness-codex-home-'));
  const bin = join(home, 'bin');
  mkdirSync(bin);
  const log = join(mkdtempSync(join(tmpdir(), 'dev-harness-codex-log-')), 'invocations');
  const script = '#!/bin/sh\nprintf "%s\\n" "$*" >> ' + JSON.stringify(log) + '\nif [ "$1" = "--version" ]; then\n  printf "%s\\n" ' + JSON.stringify(version) + '\n  exit 0\nfi\necho unexpected >&2\nexit 1\n';
  writeFileSync(join(bin, 'codex'), script, { mode: 0o755 });
  const env = { ...process.env, HOME: home, USERPROFILE: home, PATH: [bin, gitBin(), '/bin', '/usr/bin'].join(delimiter) };
  return { home, log, env };
}
function isolatedEnvironment() {
  const home = mkdtempSync(join(tmpdir(), 'dev-harness-codex-home-'));
  const env = { ...process.env, HOME: home, USERPROFILE: home, PATH: [gitBin(), '/bin', '/usr/bin'].join(delimiter) };
  return { home, env };
}
function invocations(log) {
  return existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').filter(Boolean) : [];
}
function agentToml(role, model, effort) {
  const description = {
    planner: 'Research and plan a Dev Harness arc or workstream before implementation.',
    reviewer: 'Independently review a Dev Harness plan or implementation against its approved scope.',
    owner: 'Implement an approved Dev Harness workstream and verify its outcome.'
  }[role];
  return '# dev-harness-managed\n'
    + `name = "dev-harness-${role}"\n`
    + `description = "${description}"\n`
    + `model = "${model}"\n`
    + 'model_reasoning_effort = "' + effort + '"\n'
    + `developer_instructions = "Read dev-harness/.harness/skills/dev-harness/SKILL.md and follow the ${role} role boundary."\n`;
}

test('cursor-only init does not spawn codex', () => {
  const { home, log, env } = codexEnvironment();
  const homeBefore = snapshotTree(home);
  for (const args of [['init'], ['init', '--platform', 'cursor']]) {
    const root = fixture();
    const before = snapshotTree(root);
    ok(runWith(root, env, ...args));
    assert.deepEqual(invocations(log), []);
    assert.equal(existsSync(join(root, '.codex')), false);
    assert.equal(existsSync(join(root, '.agents')), false);
    assert.deepEqual(snapshotTree(home), homeBefore);
    assert.notDeepEqual(snapshotTree(root), before);
  }
});

test('codex init installs only Codex, stays idempotent, and preserves Cursor when added', () => {
  const { home, log, env } = codexEnvironment();
  const homeBefore = snapshotTree(home);
  const root = fixture();
  const installed = ok(runWith(root, env, 'init', '--platform', 'codex'));
  assert.match(installed, /codex --model gpt-6\.1-sol --config model_reasoning_effort="high"/);
  assert.match(installed, /codex exec --model gpt-6\.1-sol --config model_reasoning_effort="high"/);
  assert.match(installed, /Start dev harness\. Use --platform codex\./);
  assert.equal(existsSync(join(root, '.cursor')), false);
  assert.equal(readlinkSync(join(root, '.agents/skills/dev-harness')), '../../dev-harness/.harness/skills/dev-harness');
  assert.equal(lstatSync(join(root, '.agents/skills/dev-harness')).isSymbolicLink(), true);
  for (const role of ['planner', 'reviewer', 'owner']) {
    const body = readFileSync(join(root, '.codex/agents', `dev-harness-${role}.toml`), 'utf8');
    assert.equal(body, agentToml(role, 'gpt-6.1-sol', role === 'owner' ? 'low' : 'high'));
    assert.equal(body.includes('sandbox') || body.includes('approval') || body.includes('feature'), false);
  }
  assert.deepEqual(readdirSync(join(root, '.codex/agents')).sort(), ['dev-harness-owner.toml', 'dev-harness-planner.toml', 'dev-harness-reviewer.toml']);
  const configPath = join(root, 'dev-harness/.harness/config.json');
  const settings = JSON.parse(readFileSync(configPath, 'utf8'));
  assert.equal(settings.version, 2);
  assert.deepEqual(settings.installedPlatforms, ['codex']);
  assert.equal(settings.adapters.cursor, undefined);
  assert.deepEqual(settings.adapters.codex.models, {
    orchestrator: { model: 'gpt-6.1-sol', effort: 'high' },
    planner: { model: 'gpt-6.1-sol', effort: 'high' },
    reviewer: { model: 'gpt-6.1-sol', effort: 'high' },
    owner: { model: 'gpt-6.1-sol', effort: 'low' }
  });
  assert.deepEqual(invocations(log), ['--version']);
  assert.deepEqual(snapshotTree(home), homeBefore);
  const first = snapshotTree(root);
  ok(runWith(root, env, 'init'));
  assert.deepEqual(snapshotTree(root), first);
  assert.equal(ok(runWith(root, env, 'new', 'arc', 'Codex records')).endsWith('--codex-records'), true);

  const neighbor = join(root, '.codex/agents/notes.toml');
  const otherSkill = join(root, '.agents/skills/project-skill/SKILL.md');
  mkdirSync(dirname(otherSkill), { recursive: true });
  writeFileSync(neighbor, 'name = "notes"\n');
  writeFileSync(otherSkill, 'Project skill\n');
  const planner = join(root, '.codex/agents/dev-harness-planner.toml');
  writeFileSync(planner, '# dev-harness-managed\nstale = true\n');
  settings.adapters.codex.models.orchestrator = { model: 'custom-orchestrator', effort: 'medium' };
  settings.adapters.codex.models.planner = { model: 'custom-planner', effort: 'max' };
  writeFileSync(configPath, JSON.stringify(settings));
  const refreshed = ok(runWith(root, env, 'init'));
  assert.match(refreshed, /codex --model custom-orchestrator --config model_reasoning_effort="medium"/);
  assert.match(refreshed, /codex exec --model custom-orchestrator --config model_reasoning_effort="medium"/);
  assert.equal(readFileSync(planner, 'utf8'), agentToml('planner', 'custom-planner', 'max'));
  assert.equal(readFileSync(join(root, '.codex/agents/dev-harness-owner.toml'), 'utf8'), agentToml('owner', 'gpt-6.1-sol', 'low'));
  assert.equal(readFileSync(neighbor, 'utf8'), 'name = "notes"\n');
  assert.equal(readFileSync(otherSkill, 'utf8'), 'Project skill\n');
  const stable = snapshotTree(root);
  ok(runWith(root, env, 'init'));
  assert.deepEqual(snapshotTree(root), stable);
  assert.deepEqual(snapshotTree(home), homeBefore);

  const cursorRoot = fixture();
  ok(runWith(cursorRoot, env, 'init'));
  assert.deepEqual(invocations(log), ['--version', '--version', '--version', '--version']);
  const cursorConfig = join(cursorRoot, 'dev-harness/.harness/config.json');
  const cursorSettings = JSON.parse(readFileSync(cursorConfig, 'utf8'));
  cursorSettings.models.orchestrator = 'grok-4.7[effort=xhigh]';
  cursorSettings.models.subagents = 'custom-cursor-model';
  writeFileSync(cursorConfig, JSON.stringify(cursorSettings));
  ok(runWith(cursorRoot, env, 'init', '--platform', 'codex'));
  const both = JSON.parse(readFileSync(cursorConfig, 'utf8'));
  assert.deepEqual(both.installedPlatforms, ['cursor', 'codex']);
  assert.equal(both.adapters.cursor.models.orchestrator.model, 'grok-4.7[effort=xhigh]');
  assert.equal(both.adapters.cursor.models.owner.model, 'custom-cursor-model');
  assert.equal(both.models.subagents, 'custom-cursor-model');
  assert.equal(readlinkSync(join(cursorRoot, '.cursor/skills/dev-harness')), '../../dev-harness/.harness/skills/dev-harness');
  assert.equal(readlinkSync(join(cursorRoot, '.agents/skills/dev-harness')), '../../dev-harness/.harness/skills/dev-harness');
  assert.equal(readFileSync(join(cursorRoot, '.codex/agents/dev-harness-reviewer.toml'), 'utf8'), agentToml('reviewer', 'gpt-6.1-sol', 'high'));
  const callsBeforeReads = invocations(log).length;
  const status = ok(runWith(cursorRoot, env, 'status'));
  const orchestrators = status.split('\n').filter(line => line.includes('Orchestrator:'));
  assert.deepEqual(orchestrators, [
    'Cursor · Orchestrator: grok-4.7[effort=xhigh] (configured)',
    'Codex · Orchestrator: gpt-6.1-sol · high (configured)'
  ]);
  const arc = ok(runWith(cursorRoot, env, 'new', 'arc', 'Shared record'));
  const shared = ok(runWith(cursorRoot, env, 'status'));
  assert.equal(shared.split('\n').filter(line => line.includes(` · ${arc} · `)).length, 1);
  const narrow = ok(runWith(cursorRoot, env, 'status', '--platform', 'codex'));
  assert.match(narrow, /Orchestrator: gpt-6\.1-sol · high \(configured\)/);
  assert.doesNotMatch(narrow, /Cursor|grok/);
  assert.match(ok(runWith(cursorRoot, env, 'check', '--platform', 'codex')), /Valid: 1 records/);
  const cursorLink = join(cursorRoot, '.cursor/skills/dev-harness');
  unlinkSync(cursorLink);
  writeFileSync(cursorLink, 'not a link');
  assert.match(ok(runWith(cursorRoot, env, 'check', '--platform', 'codex')), /Valid: 1 records/);
  assert.notEqual(runWith(cursorRoot, env, 'check').status, 0);
  unlinkSync(cursorLink);
  symlinkSync('../../dev-harness/.harness/skills/dev-harness', cursorLink, 'dir');
  both.adapters.codex.models.owner.model = 'other-model';
  writeFileSync(cursorConfig, JSON.stringify(both));
  const ownerToml = readFileSync(join(cursorRoot, '.codex/agents/dev-harness-owner.toml'), 'utf8');
  assert.notEqual(runWith(cursorRoot, env, 'check', '--platform', 'codex').status, 0);
  assert.equal(readFileSync(join(cursorRoot, '.codex/agents/dev-harness-owner.toml'), 'utf8'), ownerToml);
  both.adapters.codex.models.owner.model = 'gpt-6.1-sol';
  both.adapters.codex.models.owner.effort = 'high';
  writeFileSync(cursorConfig, JSON.stringify(both));
  assert.notEqual(runWith(cursorRoot, env, 'check').status, 0);
  both.adapters.codex.models.owner.effort = 'low';
  writeFileSync(cursorConfig, JSON.stringify(both));
  const record = join(cursorRoot, 'dev-harness/arcs', `${arc}.md`);
  writeFileSync(record, 'bad');
  assert.notEqual(runWith(cursorRoot, env, 'check', '--platform', 'codex').status, 0);
  assert.equal(invocations(log).length, callsBeforeReads);
  assert.deepEqual(snapshotTree(home), homeBefore);
});

test('codex readiness and native collisions refuse before any write', () => {
  const cases = [
    ['older version', 'codex-cli 0.162.0', root => root, /0\.162\.1 or newer/],
    ['unparsable version', 'not-a-version', root => root, /Unparsable Codex CLI version/],
    ['unmarked agent', 'codex-cli 0.162.1', root => { mkdirSync(join(root, '.codex/agents'), { recursive: true }); writeFileSync(join(root, '.codex/agents/dev-harness-planner.toml'), 'name = "user"\n'); }, /managed marker/],
    ['occupied skill', 'codex-cli 0.162.1', root => { mkdirSync(join(root, '.agents/skills/dev-harness'), { recursive: true }); writeFileSync(join(root, '.agents/skills/dev-harness/SKILL.md'), 'user skill\n'); }, /Entry point already exists/],
    ['symlink parent', 'codex-cli 0.162.1', root => { symlinkSync(mkdtempSync(join(tmpdir(), 'codex-parent-')), join(root, '.codex')); }, /Unsafe parent/],
    ['directory agent', 'codex-cli 0.162.1', root => { mkdirSync(join(root, '.codex/agents/dev-harness-owner.toml'), { recursive: true }); }, /Native file is occupied/],
    ['unknown platform', 'codex-cli 0.162.1', root => root, /Unsupported platform/]
  ];
  for (const [name, version, prepare, pattern] of cases) {
    const { home, env } = codexEnvironment(version);
    const homeBefore = snapshotTree(home);
    const root = fixture();
    prepare(root);
    const before = snapshotTree(root);
    const result = runWith(root, env, 'init', '--platform', name === 'unknown platform' ? 'unknown' : 'codex');
    assert.notEqual(result.status, 0, name);
    assert.match(result.stderr, pattern, name);
    assert.deepEqual(snapshotTree(root), before, name);
    assert.deepEqual(snapshotTree(home), homeBefore, name);
  }
  const { home, env } = isolatedEnvironment();
  const homeBefore = snapshotTree(home);
  const root = fixture();
  const before = snapshotTree(root);
  const missing = runWith(root, env, 'init', '--platform', 'codex');
  assert.match(missing.stderr, /Codex CLI is unavailable/);
  assert.deepEqual(snapshotTree(root), before);
  assert.deepEqual(snapshotTree(home), homeBefore);
  const sentinelDir = mkdtempSync(join(tmpdir(), 'codex-sentinel-'));
  const sentinel = join(sentinelDir, 'user.toml');
  writeFileSync(sentinel, 'user content\n');
  const linked = fixture();
  mkdirSync(join(linked, '.codex/agents'), { recursive: true });
  symlinkSync(sentinel, join(linked, '.codex/agents/dev-harness-owner.toml'));
  const linkedBefore = snapshotTree(linked);
  const { home: linkHome, env: linkEnv } = codexEnvironment();
  const linkHomeBefore = snapshotTree(linkHome);
  assert.match(runWith(linked, linkEnv, 'init', '--platform', 'codex').stderr, /Native file is occupied/);
  assert.deepEqual(snapshotTree(linked), linkedBefore);
  assert.equal(readFileSync(sentinel, 'utf8'), 'user content\n');
  assert.deepEqual(snapshotTree(linkHome), linkHomeBefore);
});

test('a false required capability refuses install before writes', () => {
  const { root, runtime, execute } = modularFixture();
  const path = join(runtime, 'integrations/dummy.mjs');
  writeFileSync(path, readFileSync(path, 'utf8').replace('instructionDiscovery:true', 'instructionDiscovery:false'));
  const before = snapshotTree(root);
  const result = execute('init', '--platform', 'dummy');
  assert.match(result.stderr, /Missing required capability: instructionDiscovery/);
  assert.deepEqual(snapshotTree(root), before);
});
