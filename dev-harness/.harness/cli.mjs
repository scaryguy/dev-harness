#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, realpathSync, renameSync, rmSync, rmdirSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isBuiltin } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const home = join(root, 'dev-harness');
const internal = join(home, '.harness');
const markerStart = '<!-- dev-harness:start -->';
const markerEnd = '<!-- dev-harness:end -->';
const entry = `${markerStart}\nAt the start of a session, read \`dev-harness/.harness/skills/dev-harness/SKILL.md\`.\nRun \`node dev-harness/.harness/cli.mjs status\` and present its data using the skill's Session summary template, not raw output.\nFollow the skill before planning or changing this project.\n${markerEnd}`;
const sourceEntry = `${markerStart}\nFor every source-repository ARC, validate its full baseSha as an ancestor commit and its regular committed CLI/skill blobs. Read the baseline skill with \`git show BASE_SHA:dev-harness/.harness/skills/dev-harness/SKILL.md\` before following live instructions. Independently extract the CLI from that same SHA into an OS temporary directory verified outside the repo; verify its bytes against Git. Only invoke that absolute baseline CLI path from the ARC checkout, including \`node ABSOLUTE_BASELINE_CLI pinned skill\` and \`node ABSOLUTE_BASELINE_CLI pinned <command>\` when the baseline supports pinning. Never invoke the live candidate CLI's pinned dispatcher for governance. If the baseline predates pinned support, manually verify companion files and run the extracted baseline CLI as described in the source skill, after reading the baseline skill. Fail closed; no live fallback or pinned init. Outside a source ARC, read \`dev-harness/.harness/skills/dev-harness/SKILL.md\` and run \`node dev-harness/.harness/cli.mjs status\`. Present status using the skill's Session summary template.\n${markerEnd}`;
const pinnedRuntimeVersion = 1;
const gates = ['RESEARCH', 'IMPLEMENT', 'REVIEW', 'USER CONFIRM', 'MERGED', 'DEFERRED', 'CANCELLED', 'SPLIT'];
const roles = ['planner', 'reviewer', 'owner'];

function git(args, cwd = root) {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
}

function identity() {
  const name = git(['config', 'user.name']);
  const key = git(['config', 'dev-harness.user-id']) || git(['config', 'user.email']);
  if (!name || !key) throw new Error('Set git user.name and user.email (or dev-harness.user-id) to identify your work.');
  return { name, id: createHash('sha256').update(key.toLowerCase()).digest('hex').slice(0, 12) };
}

function slug(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

let integrations;
async function loadIntegrations() {
  const [registry, configuration, installation] = await Promise.all(['registry', 'config', 'install'].map(name => import(new URL(`./integrations/${name}.mjs`, import.meta.url))));
  integrations = { ...registry, ...configuration, ...installation };
}
function rawConfig(folder = internal) { return JSON.parse(readFileSync(join(folder, 'config.json'), 'utf8')); }
function config(folder = internal) { return integrations.normalize(rawConfig(folder)); }
function artifactPlan(target = root, settings = config()) { return integrations.planArtifacts(target, source, settings); }
function selectors(args, multiple = false, targetAllowed = false) {
  const ids = []; let target;
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === '--platform') {
      const id = args[++index];
      if (!id || id.startsWith('-') || (!multiple && ids.length)) throw Error('Invalid --platform selector.');
      integrations.lookup(id); ids.push(id);
    } else if (targetAllowed && !target && !value.startsWith('-')) target = value;
    else throw Error(`Unexpected argument: ${value}`);
  }
  return { ids: [...new Set(ids)], target };
}
function selected(settings, ids) {
  for (const id of ids) if (!settings.installedPlatforms.includes(id)) throw Error(`Platform is not installed: ${id}`);
  return ids.length ? ids : settings.installedPlatforms;
}

function exists(path) {
  try { return lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

function isPackageSourceCheckout(target) {
  let manifest;
  try { manifest = JSON.parse(git(['show', 'HEAD:package.json'], target)); }
  catch { return false; }
  if (manifest.name !== '@scaryguy/dev-harness'
      || manifest.bin?.['dev-harness'] !== 'dev-harness/.harness/cli.mjs') return false;
  const required = [
    'package.json',
    'dev-harness/.harness/cli.mjs',
    'dev-harness/.harness/config.json',
    'dev-harness/.harness/skills/dev-harness/SKILL.md',
    'dev-harness/.harness/templates/arc.md',
    'dev-harness/.harness/adapters/cursor/agents/dev-harness-owner.md'
  ];
  const tracked = new Set(git(['ls-tree', '-r', '--name-only', 'HEAD', '--', ...required], target).split('\n'));
  return required.every(path => tracked.has(path));
}

function init(target, requested = []) {
  const folder = join(target, 'dev-harness');
  const runtime = join(folder, '.harness');
  if (!existsSync(target) || !lstatSync(target).isDirectory()) throw new Error('Target must be an existing repository directory.');
  if (!git(['rev-parse', '--show-toplevel'], target) || resolve(git(['rev-parse', '--show-toplevel'], target)) !== target) {
    throw new Error('Run init at the Git repository root.');
  }
  if (isPackageSourceCheckout(target)
      && (!existsSync(runtime) || realpathSync(source) !== realpathSync(runtime))) {
    throw new Error('Refusing to init a Dev Harness package source checkout from an external package. Run its own dev-harness/.harness/cli.mjs init instead.');
  }
  integrations.safeParents(target, 'dev-harness/.harness', true);
  for (const configPath of [join(runtime, 'config.json'), join(folder, 'config.json')]) {
    const item = exists(configPath);
    if (item && !item.isFile()) throw Error(`Unsafe config: ${configPath}`);
  }
  const current = existsSync(join(runtime, 'config.json')) ? runtime : existsSync(join(folder, 'config.json')) ? folder : null;
  if (exists(folder) && !current) throw new Error('Existing dev-harness/ is not managed by this scaffold.');
  const plannedConfig = integrations.planConfig(current ? rawConfig(current) : null, rawConfig(source), requested);
  const settings = integrations.normalize(plannedConfig);
  const plan = artifactPlan(target, settings);
  integrations.safeParents(target, 'dev-harness/.harness', true);
  integrations.safeParents(target, 'AGENTS.md');
  const agentsStat = exists(join(target, 'AGENTS.md'));
  if (agentsStat && !agentsStat.isFile()) throw Error('Unsafe AGENTS.md.');
  // Refuse symlinks throughout owned runtime trees before recursive copy refresh.
  function preflightTree(path) {
    const item = exists(path);
    if (!item) return;
    if (item.isSymbolicLink() || (!item.isDirectory() && !item.isFile())) throw Error(`Unsafe managed path: ${path}`);
    if (item.isDirectory()) for (const name of readdirSync(path)) preflightTree(join(path, name));
  }
  function preflightCopy(sourcePath, destination) {
    const expected = exists(sourcePath);
    if (!expected || expected.isSymbolicLink() || (!expected.isDirectory() && !expected.isFile())) throw Error(`Invalid runtime source: ${sourcePath}`);
    const actual = exists(destination);
    if (actual && (actual.isSymbolicLink() || expected.isDirectory() !== actual.isDirectory() || expected.isFile() !== actual.isFile())) throw Error(`Invalid managed path: ${destination}`);
    if (expected.isDirectory()) for (const name of readdirSync(sourcePath)) preflightCopy(join(sourcePath, name), join(destination, name));
  }
  for (const item of ['config.json', 'cli.mjs', 'templates', 'skills', 'adapters', 'integrations', '.gitignore']) {
    const sourcePath = join(source, item === '.gitignore' ? 'templates/gitignore' : item);
    for (const destination of new Set([join(current || runtime, item), join(runtime, item)])) {
      preflightTree(destination);
      preflightCopy(sourcePath, destination);
    }
  }
  for (const group of ['arcs', 'workstreams']) integrations.safeParents(target, `dev-harness/${group}`, true);
  const oldItems = ['config.json', 'cli.mjs', 'cli.test.mjs', 'templates', 'skills', 'adapters', 'integrations', 'knowledge', 'state', 'local', 'cache', '.gitignore']
    .filter(item => exists(join(folder, item)));
  for (const item of oldItems) {
    if (exists(join(runtime, item))) throw new Error(`Migration conflict: ${join(runtime, item)}`);
  }
  const discovery = plan.links.map(link => ({ ...link, path: join(target, link.path) }));
  integrations.preflight(target, plan);
  const agents = join(target, 'AGENTS.md');
  const previous = existsSync(agents) ? readFileSync(agents, 'utf8') : '';
  const starts = previous.split(markerStart).length - 1;
  const ends = previous.split(markerEnd).length - 1;
  if (starts !== ends || starts > 1 || (starts && previous.indexOf(markerEnd) < previous.indexOf(markerStart))) throw new Error('Incomplete or malformed Dev Harness block in AGENTS.md.');
  integrations.assertCapabilities(settings.installedPlatforms);
  for (const id of settings.installedPlatforms) {
    const adapter = integrations.lookup(id);
    if (typeof adapter.assertReady === 'function') adapter.assertReady();
  }
  integrations.preflightNatives(target, plan);
  if (!current) {
    mkdirSync(runtime, { recursive: true });
    for (const item of ['config.json', 'cli.mjs', 'templates', 'skills', 'adapters', 'integrations']) {
      cpSync(join(source, item), join(runtime, item), { recursive: true, errorOnExist: true, force: false });
    }
    cpSync(join(source, 'templates', 'gitignore'), join(runtime, '.gitignore'));
    mkdirSync(join(runtime, 'knowledge'));
    cpSync(join(source, 'templates', 'context.md'), join(runtime, 'knowledge', 'context.md'));
  } else if (oldItems.length) {
    mkdirSync(runtime, { recursive: true });
    for (const item of oldItems) renameSync(join(folder, item), join(runtime, item));

  }
  for (const item of ['cli.mjs', 'templates', 'skills', 'adapters', 'integrations']) {
    if (resolve(join(source, item)) !== resolve(join(runtime, item))) {
      cpSync(join(source, item), join(runtime, item), { recursive: true });
    }
  }
  for (const group of ['arcs', 'workstreams']) mkdirSync(join(folder, group), { recursive: true });
  const configPath = join(runtime, 'config.json');
  if (JSON.stringify(rawConfig(runtime)) !== JSON.stringify(plannedConfig)) writeFileSync(configPath, `${JSON.stringify(plannedConfig, null, 2)}\n`);
  for (const file of plan.files) {
    mkdirSync(dirname(join(target, file.path)), { recursive: true });
    writeFileSync(join(target, file.path), file.content);
  }
  for (const file of plan.nativeFiles) {
    mkdirSync(dirname(join(target, file.path)), { recursive: true });
    writeFileSync(join(target, file.path), file.content);
  }
  const instruction = isPackageSourceCheckout(target) ? sourceEntry : entry;
  const updated = previous.includes(markerStart)
    ? previous.replace(/<!-- dev-harness:start -->[\s\S]*?<!-- dev-harness:end -->/, instruction)
    : `${previous}${previous ? '\n\n' : ''}${instruction}\n`;
  if (updated !== previous) writeFileSync(agents, updated);
  for (const link of discovery) {
    mkdirSync(dirname(link.path), { recursive: true });
    if (exists(link.path) && link.legacy.includes(readlinkSync(link.path))) unlinkSync(link.path);
    if (!exists(link.path)) symlinkSync(link.to, link.path, link.type);
  }
  for (const id of settings.installedPlatforms) console.log(integrations.lookup(id).startupGuidance({ targetRoot: target, sourceRoot: source, settings: settings.adapters[id], id }));
  console.log('Init refreshes built-in instructions; preserves configuration, knowledge, arcs, and workstreams.');
}

function records() {
  const result = [];
  for (const [group, kind] of [['arcs', 'arc'], ['workstreams', 'workstream']]) {
    const folder = join(home, group);
    if (!existsSync(folder)) continue;
    for (const file of readdirSync(folder).sort().filter(file => file.endsWith('.md'))) {
      const path = join(folder, file);
      const body = readFileSync(path, 'utf8');
      const match = body.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      if (!match) throw new Error(`Missing JSON frontmatter: ${path}`);
      const data = JSON.parse(match[1]);
      if (data.kind !== kind || file !== `${data.id}.md` || !data.title || !data.owner?.id || !data.owner?.name
          || !data.next || !Number.isInteger(data.revision) || data.revision < 1
          || !Number.isFinite(Date.parse(data.updated))) throw new Error(`Invalid record: ${path}`);
      if (kind === 'arc' ? !['draft', 'in-progress', 'complete', 'cancelled'].includes(data.status) : !gates.includes(data.gate)) {
        throw new Error(`Invalid gate/status: ${path}`);
      }
      result.push({ ...data, path });
    }
  }
  const ids = new Set(result.map(record => record.id));
  if (ids.size !== result.length) throw new Error('Duplicate record IDs.');
  const arcIds = new Set(result.filter(record => record.kind === 'arc').map(record => record.id));
  for (const record of result.filter(record => record.kind === 'workstream')) {
    if (!arcIds.has(record.arc)) throw new Error(`Unknown parent arc: ${record.id}`);
    if (/^WS-.+-\d+--/.test(record.id) && record.sequence === undefined) throw new Error(`Missing workstream sequence: ${record.id}`);
    if (record.sequence !== undefined) {
      const number = String(record.sequence).padStart(2, '0');
      if (!Number.isSafeInteger(record.sequence) || record.sequence < 1
          || !record.id.startsWith(`WS-${slug(record.owner.name)}-${number}--`)) throw new Error(`Invalid workstream sequence: ${record.id}`);
    }
  }
  return result;
}

function status(ids = []) {
  const settings = config();
  const user = identity();
  const active = records().filter(record => !['complete', 'cancelled', 'MERGED', 'DEFERRED', 'CANCELLED', 'SPLIT'].includes(record.status || record.gate));
  const platforms = selected(settings, ids);
  console.log(`Dev Harness · ${user.name} · ${git(['branch', '--show-current']) || 'detached/unborn'}`);
  for (const id of platforms) {
    const model = settings.adapters[id].models.orchestrator;
    console.log(`${platforms.length === 1 ? '' : `${integrations.lookup(id).label} · `}Orchestrator: ${model.model}${model.effort ? ` · ${model.effort}` : ''} (configured)`);
  }
  if (!active.length) console.log('No active arcs or workstreams. Describe what you want to build.');
  for (const record of active.sort((a, b) => Number(b.owner.id === user.id) - Number(a.owner.id === user.id))) {
    console.log(`${record.owner.id === user.id ? 'Yours' : record.owner.name} · ${record.id} · ${record.title} · ${record.gate || record.status}\nNext: ${record.next}`);
  }
}

function create(kind, arc, title) {
  if (!['arc', 'workstream'].includes(kind) || !title?.trim()) throw new Error('Usage: new arc "Title" | new workstream ARC_ID "Title"');
  config();
  const local = join(internal, 'local');
  const lock = join(local, 'create.lock');
  mkdirSync(local, { recursive: true });
  try { mkdirSync(lock); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('Another record is being created. Retry when it finishes.');
    throw error;
  }
  try { createRecord(kind, arc, title); }
  finally { rmdirSync(lock); }
}

function createRecord(kind, arc, title) {
  const owner = identity();
  const name = slug(owner.name);
  const summary = slug(title).split('-').slice(0, 5).join('-');
  if (!name || !summary) throw new Error('Name and title must contain letters or numbers usable in a filename.');
  const now = new Date();
  const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const arcId = `${date}-${name}--${summary}`;
  const branch = git(['branch', '--show-current']);
  if (kind === 'arc') {
    const target = `arc/${arcId}`;
    if (branch !== target) {
      if (branch !== config().git.integrationBranch) throw new Error(`Start a new arc from ${config().git.integrationBranch}, or resume ${target}.`);
      const changes = git(['status', '--porcelain', '--untracked-files=all']).split('\n').filter(Boolean);
      const plan = artifactPlan();
      const unrelated = changes.map(line => line.slice(3)).filter(path => !(
        path === 'AGENTS.md' || path.startsWith('dev-harness/')
        || plan.links.some(link => link.path === path)
        || plan.nativeFiles.some(file => file.path === path)
      ) || /^dev-harness\/(arcs|workstreams)\/.*\.md$/.test(path));
      if (unrelated.length) throw new Error(`Cannot switch to ${target} with unrelated changes: ${unrelated.join(', ')}`);
      const exists = git(['branch', '--list', '--format=%(refname:short)', target]) === target;
      try { execFileSync('git', exists ? ['switch', target] : ['switch', '-c', target], { cwd: root, stdio: 'pipe' }); }
      catch { throw new Error(`Could not check out ${target}. Preserve existing worktrees and resolve the branch conflict.`); }
    }
  } else if (branch !== `arc/${arc}`) {
    throw new Error(`Create workstreams on their parent arc branch: arc/${arc}.`);
  }
  const existing = records();
  if (kind === 'workstream' && !existing.some(record => record.kind === 'arc' && record.id === arc && !['complete', 'cancelled'].includes(record.status))) {
    throw new Error('Workstream needs an existing open arc.');
  }
  const matching = kind === 'workstream' && existing.find(record => record.kind === 'workstream'
    && record.arc === arc && record.owner.id === owner.id && record.title === title.trim()
    && !['MERGED', 'DEFERRED', 'CANCELLED', 'SPLIT'].includes(record.gate));
  if (matching) { console.log(matching.id); return; }
  const state = join(internal, 'state');
  const sequenceFile = join(state, 'sequences.json');
  const counters = existsSync(sequenceFile) ? JSON.parse(readFileSync(sequenceFile, 'utf8')) : {};
  if (!counters || Array.isArray(counters) || typeof counters !== 'object'
      || Object.values(counters).some(number => !Number.isSafeInteger(number) || number < 0)) throw new Error('Invalid workstream sequence state.');
  let sequence;
  if (kind === 'workstream') {
    sequence = Math.max(counters[owner.id] || 0, ...existing.filter(record => record.kind === 'workstream'
      && (record.owner.id === owner.id || slug(record.owner.name) === name)).map(record => record.sequence || 0)) + 1;
    if (!Number.isSafeInteger(sequence)) throw new Error('Workstream sequence limit reached.');
  }
  const id = kind === 'arc' ? arcId : `WS-${name}-${String(sequence).padStart(2, '0')}--${summary}`;
  const prior = existing.find(record => record.id === id);
  if (prior) {
    if (kind === 'arc' && prior.owner.id === owner.id && prior.title === title.trim()
        && !['complete', 'cancelled'].includes(prior.status)) { console.log(id); return; }
    throw new Error(`Record name already exists: ${id}. Choose a distinct short title.`);
  }
  const data = { id, kind, title: title.trim(), owner, revision: 1, created: now.toISOString(), updated: now.toISOString(), next: 'Agree scope, decisions, and verification.' };
  if (kind === 'arc') Object.assign(data, { status: 'draft', branch: `arc/${id}`,
    integrationBranch: config().git.integrationBranch,
    baseSha: git(['merge-base', config().git.integrationBranch, `arc/${id}`]) || null });
  else Object.assign(data, { arc, sequence, gate: 'RESEARCH' });
  const folder = join(home, kind === 'arc' ? 'arcs' : 'workstreams');
  mkdirSync(folder, { recursive: true });
  const template = readFileSync(join(internal, 'templates', `${kind}.md`), 'utf8')
    .replace('{{title}}', data.title.replace(/[\r\n]+/g, ' ')).replaceAll('{{arc}}', arc || '')
    .replaceAll('{{id}}', id).replaceAll('{{date}}', date);
  writeFileSync(join(folder, `${id}.md`), `---\n${JSON.stringify(data, null, 2)}\n---\n\n${template}- ${data.updated} · ${owner.name} · Created.\n`, { flag: 'wx' });
  if (kind === 'workstream') {
    mkdirSync(state, { recursive: true });
    counters[owner.id] = sequence;
    const temporary = `${sequenceFile}.${process.pid}.tmp`;
    writeFileSync(temporary, `${JSON.stringify(counters, null, 2)}\n`, { flag: 'wx' });
    renameSync(temporary, sequenceFile);
  }
  console.log(id);
}

// Dependency policy accepts a deliberately restricted, unambiguous module
// language. Node checks full syntax; this lexer never evaluates source code.
function moduleDependencies(bytes, path) {
  try { execFileSync(process.execPath, ['--input-type=module', '--check'], { input: bytes, stdio: ['pipe', 'pipe', 'pipe'] }); }
  catch { throw Error(`Invalid baseline module syntax: ${path}`); }
  const code = bytes.toString('utf8');
  const tokens = [];
  const fail = () => { throw Error(`Unsupported baseline module syntax: ${path}`); };
  let cursor = 0;
  while (cursor < code.length) {
    const char = code[cursor];
    if (/\s/.test(char)) { cursor++; continue; }
    if (char === '/' && code[cursor + 1] === '/') {
      cursor += 2; while (cursor < code.length && !/[\r\n\u2028\u2029]/.test(code[cursor])) cursor++;
      continue;
    }
    if (char === '/' && code[cursor + 1] === '*') {
      const end = code.indexOf('*/', cursor + 2); if (end < 0) fail(); cursor = end + 2; continue;
    }
    if (char === '"' || char === "'") {
      const start = cursor++; let escaped = false;
      while (cursor < code.length && code[cursor] !== char) {
        if (code[cursor] === '\\') { escaped = true; cursor += 2; } else cursor++;
      }
      if (cursor >= code.length) fail(); cursor++;
      const raw = code.slice(start, cursor);
      tokens.push({ kind: 'string', value: raw.slice(1, -1), raw, escaped }); continue;
    }
    if (/[A-Za-z_$]/.test(char)) {
      const start = cursor++; while (cursor < code.length && /[A-Za-z0-9_$]/.test(code[cursor])) cursor++;
      tokens.push({ kind: 'identifier', value: code.slice(start, cursor) }); continue;
    }
    if (char === '`' || char === '/' || char === '\\' || char.charCodeAt(0) > 127 || char.charCodeAt(0) < 32) fail();
    tokens.push({ kind: 'punctuation', value: char }); cursor++;
  }
  const dependencies = [];
  let index = 0;
  const value = () => tokens[index]?.value;
  const consume = expected => { if (value() !== expected) fail(); index++; };
  const identifier = () => { if (tokens[index]?.kind !== 'identifier') fail(); index++; };
  const specifier = () => {
    const token = tokens[index++];
    if (token?.kind !== 'string' || token.escaped) fail();
    dependencies.push(token.value);
  };
  const list = () => {
    consume('{');
    while (value() !== '}') {
      identifier();
      if (value() === 'as') { index++; identifier(); }
      if (value() !== ',') break;
      index++;
    }
    consume('}');
  };
  while (index < tokens.length) {
    const token = tokens[index++];
    if (token.kind !== 'identifier') continue;
    if (token.value === 'import') {
      if (tokens[index]?.kind === 'string') specifier();
      else {
        if (tokens[index]?.kind === 'identifier') {
          identifier();
          if (value() === ',') index++;
          else { consume('from'); specifier(); consume(';'); continue; }
        }
        if (value() === '{') list();
        else if (value() === '*') { index++; consume('as'); identifier(); }
        else fail();
        consume('from'); specifier();
      }
      consume(';');
    } else if (token.value === 'export') {
      if (value() === '{') { list(); if (value() === 'from') { index++; specifier(); } consume(';'); }
      else if (value() === '*') { index++; if (value() === 'as') { index++; identifier(); } consume('from'); specifier(); consume(';'); }
      else if (['const', 'let', 'var', 'function', 'class', 'default'].includes(value())) index++;
      else if (value() === 'async') { index++; consume('function'); }
      else fail();
    }
  }
  return dependencies;
}

// This entry point is an operational bootstrap. The governing CLI and skill come
// from the ARC's committed base, never from a candidate WS or ARC revision.
function pinned(args) {
  const [command, ...rest] = args;
  if (command === 'init') throw new Error('Pinned source-ARC governance forbids init. Test candidate init only in a disposable repository.');
  if (!['skill', 'status', 'check', 'new'].includes(command)
      || (command === 'new' && rest[0] !== 'workstream')) {
    throw new Error('Pinned commands: skill, status, check, new workstream ARC_ID "Title".');
  }
  if (!isPackageSourceCheckout(root)) throw new Error('Pinned governance is only for a Dev Harness package source checkout.');
  const branch = git(['branch', '--show-current']);
  if (!branch.startsWith('arc/')) throw new Error('Pinned governance requires the parent ARC checkout.');
  const id = branch.slice(4);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(id)) throw new Error('Invalid ARC branch name.');
  const arcPath = join(home, 'arcs', `${id}.md`);
  const match = readFileSync(arcPath, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('ARC record lacks JSON frontmatter.');
  const arc = JSON.parse(match[1]);
  if (arc.kind !== 'arc' || arc.id !== id || arc.branch !== branch) throw new Error('ARC record does not match the current branch.');
  const sha = arc.baseSha;
  if (typeof sha !== 'string' || !/^[0-9a-f]{40}$/.test(sha)) throw new Error('ARC baseSha must be a full lowercase commit SHA.');
  const gitRead = gitArgs => execFileSync('git', gitArgs, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  if (gitRead(['cat-file', '-t', sha]).toString().trim() !== 'commit') throw new Error('ARC baseSha is not a commit.');
  const ancestor = spawnSync('git', ['merge-base', '--is-ancestor', sha, 'HEAD'], { cwd: root });
  if (ancestor.status !== 0) throw new Error('ARC baseSha is not an ancestor of HEAD.');
  const prefix = 'dev-harness/.harness/';
  const skillPath = `${prefix}skills/dev-harness/SKILL.md`;
  const cliPath = `${prefix}cli.mjs`;
  const blob = path => {
    try {
      const tree = gitRead(['ls-tree', sha, '--', path]).toString();
      if (!/^100(?:644|755) blob /.test(tree)
          || gitRead(['cat-file', '-t', `${sha}:${path}`]).toString().trim() !== 'blob') {
        throw new Error('Not a regular file blob.');
      }
      return gitRead(['show', `${sha}:${path}`]);
    }
    catch { throw new Error(`Missing baseline blob: ${path}`); }
  };
  const baselineCli = blob(cliPath);
  const baselineSkill = blob(skillPath);
  if (!/^const pinnedRuntimeVersion = 1;$/m.test(baselineCli.toString())) {
    throw new Error('ARC base CLI predates pinned support. Use the documented manual baseline bootstrap; live governance is forbidden.');
  }
  if (command === 'skill') {
    process.stdout.write(baselineSkill);
    return;
  }
  if (command === 'new' && rest[1] !== id) throw new Error('Pinned workstreams must belong to the current ARC.');
  const paths = gitRead(['ls-tree', '-r', '--name-only', sha, '--',
    `${prefix}config.json`, `${prefix}templates`, `${prefix}adapters`, `${prefix}skills`])
    .toString().trim().split('\n').filter(Boolean);
  const moduleRoot = `${prefix}integrations/`;
  const modulePaths = gitRead(['ls-tree', '-r', '--name-only', sha, '--', moduleRoot]).toString().trim().split('\n').filter(Boolean);
  if (modulePaths.length || /function loadIntegrations\(/.test(baselineCli.toString())) {
    for (const name of ['registry', 'config', 'install', 'cursor']) if (!modulePaths.includes(`${moduleRoot}${name}.mjs`)) throw Error(`Missing baseline integration: ${name}`);
    for (const path of modulePaths) {
      if (!path.startsWith(moduleRoot) || !/^[a-zA-Z0-9_./-]+\.mjs$/.test(path) || path.split('/').includes('..')) throw Error(`Unsafe baseline integration: ${path}`);
      const imports = moduleDependencies(blob(path), path);
      for (const specifier of imports) {
        if (specifier.startsWith('node:')) {
          if (!isBuiltin(specifier)) throw Error(`Unknown baseline builtin: ${specifier}`);
          continue;
        }
        const dependency = relative(root, resolve(root, dirname(path), specifier));
        if (!/^\.{1,2}\/[a-zA-Z0-9_./-]+\.mjs$/.test(specifier) || !dependency.startsWith(moduleRoot) || !modulePaths.includes(dependency)) throw Error(`Unsafe baseline dependency: ${specifier}`);
      }
    }
    paths.push(...modulePaths);
  }
  const companions = paths.filter(path => path === `${prefix}config.json`
    || path.startsWith(`${prefix}templates/`) || path.startsWith(`${prefix}adapters/`));
  const required = [
    `${prefix}config.json`, `${prefix}templates/arc.md`, `${prefix}templates/workstream.md`,
    `${prefix}templates/context.md`, `${prefix}templates/gitignore`,
    ...roles.map(role => `${prefix}adapters/cursor/agents/dev-harness-${role}.md`)
  ];
  for (const path of required) if (!companions.includes(path)) throw new Error(`Missing baseline blob: ${path}`);
  const livePaths = [];
  function visit(path) {
    const stat = exists(path);
    if (!stat) throw new Error(`Missing live companion: ${relative(root, path)}`);
    if (stat.isDirectory()) {
      for (const name of readdirSync(path)) visit(join(path, name));
    } else if (stat.isFile()) livePaths.push(relative(root, path));
    else throw new Error(`Invalid live companion: ${relative(root, path)}`);
  }
  for (const path of [`${prefix}config.json`, `${prefix}templates`, `${prefix}adapters`]) visit(join(root, path));
  if (livePaths.sort().join('\n') !== companions.sort().join('\n')) {
    throw new Error('Live companion file set differs from ARC baseline.');
  }
  for (const path of companions) {
    if (!readFileSync(join(root, path)).equals(blob(path))) throw new Error(`Live companion differs from ARC baseline: ${path}`);
  }
  const temporaryRoot = realpathSync(tmpdir());
  const fromRepository = relative(realpathSync(root), temporaryRoot);
  if (!fromRepository || (!fromRepository.startsWith(`..${sep}`) && fromRepository !== '..')) {
    throw new Error('Pinned runtime requires an OS temporary directory outside the repository.');
  }
  const temporary = mkdtempSync(join(temporaryRoot, 'dev-harness-pinned-'));
  try {
    for (const path of [cliPath, skillPath, ...paths]) {
      const destination = join(temporary, path);
      mkdirSync(dirname(destination), { recursive: true });
      const bytes = blob(path);
      writeFileSync(destination, bytes);
      if (!readFileSync(destination).equals(bytes)) throw Error(`Extracted baseline differs: ${path}`);
    }
    const result = spawnSync(process.execPath, [join(temporary, cliPath), command, ...rest],
      { cwd: root, encoding: 'utf8' });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.error) throw result.error;
    if (result.status !== 0) process.exitCode = result.status || 1;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

try {
  const [command = 'init', ...args] = process.argv.slice(2);
  if (command === 'pinned') pinned(args);
  else {
    await loadIntegrations();
    if (command === 'init') { const selection = selectors(args, true, true); init(resolve(selection.target || root), selection.ids); }
    else if (command === 'status') status(selectors(args).ids);
    else if (command === 'check') {
      const settings = config();
      const ids = selected(settings, selectors(args).ids);
      const shared = records();
      integrations.checkLinks(root, artifactPlan(root, { ...settings, installedPlatforms: ids }));
      for (const id of ids) integrations.lookup(id).checkArtifacts({ targetRoot: root, sourceRoot: source, settings: settings.adapters[id], id });
      console.log(`Valid: ${shared.length} records. Structural validation only.`);
    }
    else if (command === 'new') create(args[0], args[0] === 'workstream' ? args[1] : undefined, args.slice(args[0] === 'workstream' ? 2 : 1).join(' '));
    else throw new Error('Commands: init [repository] [--platform ID]..., status [--platform ID], new arc|workstream, check [--platform ID], pinned skill|status|check|new workstream');
  }
} catch (error) {
  console.error(`Dev Harness: ${error.message}`);
  process.exitCode = 1;
}
