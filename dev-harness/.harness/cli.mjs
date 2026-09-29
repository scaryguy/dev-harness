#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, renameSync, rmdirSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const home = join(root, 'dev-harness');
const internal = join(home, '.harness');
const markerStart = '<!-- dev-harness:start -->';
const markerEnd = '<!-- dev-harness:end -->';
const entry = `${markerStart}\nAt the start of a session, read \`dev-harness/.harness/skills/dev-harness/SKILL.md\`.\nRun \`node dev-harness/.harness/cli.mjs status\` and present its data using the skill's Session summary template, not raw output.\nFollow the skill before planning or changing this project.\n${markerEnd}`;
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

function config(folder = internal) {
  const value = JSON.parse(readFileSync(join(folder, 'config.json'), 'utf8'));
  if (value.version !== 1 || value.platform !== 'cursor'
      || ![value.models?.orchestrator, value.models?.subagents].every(model => typeof model === 'string' && model.length && !/[\r\n]/.test(model))
      || !value.git?.integrationBranch || typeof value.git.requireExplicitWriteApproval !== 'boolean'
      || !Array.isArray(value.checks) || value.checks.some(check => typeof check !== 'string')) {
    throw new Error('Invalid config.json. Expected version 1, Cursor models, Git policy, and a checks array.');
  }
  return value;
}

function links(target) {
  return [
    ['.cursor/skills/dev-harness', 'dev-harness/.harness/skills/dev-harness', 'dir'],
    ...roles.map(role => [`.cursor/agents/dev-harness-${role}.md`, `dev-harness/.harness/adapters/cursor/agents/dev-harness-${role}.md`, 'file'])
  ].map(([from, to, type]) => ({ path: join(target, from),
    to: relative(dirname(join(target, from)), join(target, to)),
    legacy: relative(dirname(join(target, from)), join(target, to.replace('/.harness/', '/'))), type }));
}

function exists(path) {
  try { return lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

function init(target) {
  const folder = join(target, 'dev-harness');
  const runtime = join(folder, '.harness');
  if (!existsSync(target) || !lstatSync(target).isDirectory()) throw new Error('Target must be an existing repository directory.');
  if (!git(['rev-parse', '--show-toplevel'], target) || resolve(git(['rev-parse', '--show-toplevel'], target)) !== target) {
    throw new Error('Run init at the Git repository root.');
  }
  const current = existsSync(join(runtime, 'config.json')) ? runtime : existsSync(join(folder, 'config.json')) ? folder : null;
  if (exists(folder) && !current) throw new Error('Existing dev-harness/ is not managed by this scaffold.');
  if (current) config(current);
  const oldItems = ['config.json', 'cli.mjs', 'cli.test.mjs', 'templates', 'skills', 'adapters', 'knowledge', 'state', 'local', 'cache', '.gitignore']
    .filter(item => exists(join(folder, item)));
  for (const item of oldItems) {
    if (exists(join(runtime, item))) throw new Error(`Migration conflict: ${join(runtime, item)}`);
  }
  const discovery = links(target);
  for (const link of discovery) {
    const stat = exists(link.path);
    if (stat && (!stat.isSymbolicLink() || ![link.to, link.legacy].includes(readlinkSync(link.path)))) throw new Error(`Entry point already exists: ${link.path}`);
  }
  const agents = join(target, 'AGENTS.md');
  const previous = existsSync(agents) ? readFileSync(agents, 'utf8') : '';
  if (previous.includes(markerStart) !== previous.includes(markerEnd)) throw new Error('Incomplete Dev Harness block in AGENTS.md.');
  if (!current) {
    mkdirSync(runtime, { recursive: true });
    for (const item of ['config.json', 'cli.mjs', 'templates', 'skills', 'adapters']) {
      cpSync(join(source, item), join(runtime, item), { recursive: true, errorOnExist: true, force: false });
    }
    cpSync(join(source, 'templates', 'gitignore'), join(runtime, '.gitignore'));
    mkdirSync(join(runtime, 'knowledge'));
    cpSync(join(source, 'templates', 'context.md'), join(runtime, 'knowledge', 'context.md'));
  } else if (oldItems.length) {
    mkdirSync(runtime, { recursive: true });
    for (const item of oldItems) renameSync(join(folder, item), join(runtime, item));
    const skill = join(runtime, 'skills', 'dev-harness', 'SKILL.md');
    let body = readFileSync(skill, 'utf8');
    for (const item of ['cli.mjs', 'config.json', 'knowledge/', 'skills/', 'templates/', 'adapters/']) {
      body = body.replaceAll(`dev-harness/${item}`, `dev-harness/.harness/${item}`);
    }
    body = body.replace('findings in knowledge/', 'findings in dev-harness/.harness/knowledge/');
    body = body.replace('Keep harness content inside dev-harness/. External files may contain only necessary',
      'Only arcs/ and workstreams/ stay visible inside dev-harness/; all internals belong\nin its .harness/ directory. External files may contain only necessary');
    writeFileSync(skill, body);
  }
  for (const item of ['cli.mjs', 'templates', 'skills', 'adapters']) {
    if (resolve(join(source, item)) !== resolve(join(runtime, item))) {
      cpSync(join(source, item), join(runtime, item), { recursive: true });
    }
  }
  for (const group of ['arcs', 'workstreams']) mkdirSync(join(folder, group), { recursive: true });
  for (const role of roles) {
    const path = join(runtime, 'adapters', 'cursor', 'agents', `dev-harness-${role}.md`);
    const body = readFileSync(path, 'utf8');
    const next = body.replace(/^model: .+$/m, `model: ${config(runtime).models.subagents}`);
    if (next !== body) writeFileSync(path, next);
  }
  const updated = previous.includes(markerStart)
    ? previous.replace(/<!-- dev-harness:start -->[\s\S]*?<!-- dev-harness:end -->/, entry)
    : `${previous}${previous ? '\n\n' : ''}${entry}\n`;
  if (updated !== previous) writeFileSync(agents, updated);
  for (const link of discovery) {
    mkdirSync(dirname(link.path), { recursive: true });
    if (exists(link.path) && readlinkSync(link.path) === link.legacy) unlinkSync(link.path);
    if (!exists(link.path)) symlinkSync(link.to, link.path, link.type);
  }
  console.log('Cursor ready. Select Grok 4.7 · High, start a new chat, and say “Start dev harness.”');
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
  const sequences = new Set();
  for (const record of result.filter(record => record.kind === 'workstream')) {
    if (!arcIds.has(record.arc)) throw new Error(`Unknown parent arc: ${record.id}`);
    if (/^WS-.+-\d+--/.test(record.id) && record.sequence === undefined) throw new Error(`Missing workstream sequence: ${record.id}`);
    if (record.sequence !== undefined) {
      const number = String(record.sequence).padStart(2, '0');
      if (!Number.isSafeInteger(record.sequence) || record.sequence < 1
          || !record.id.startsWith(`WS-${slug(record.owner.name)}-${number}--`)) throw new Error(`Invalid workstream sequence: ${record.id}`);
      const key = `${record.owner.id}:${record.sequence}`;
      if (sequences.has(key)) throw new Error(`Duplicate workstream sequence: ${record.id}`);
      sequences.add(key);
    }
  }
  return result;
}

function status() {
  const settings = config();
  const user = identity();
  const active = records().filter(record => !['complete', 'cancelled', 'MERGED', 'DEFERRED', 'CANCELLED', 'SPLIT'].includes(record.status || record.gate));
  console.log(`Dev Harness · ${user.name} · ${git(['branch', '--show-current']) || 'detached/unborn'}\nOrchestrator: ${settings.models.orchestrator} (configured)`);
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
      const unrelated = changes.map(line => line.slice(3)).filter(path => !(
        path === 'AGENTS.md' || path.startsWith('dev-harness/')
        || path === '.cursor/skills/dev-harness' || /^\.cursor\/agents\/dev-harness-(planner|reviewer|owner)\.md$/.test(path)
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

try {
  const [command = 'init', ...args] = process.argv.slice(2);
  if (command === 'init') init(resolve(args[0] || root));
  else if (command === 'status') status();
  else if (command === 'check') {
    const settings = config();
    for (const role of roles) {
      const body = readFileSync(join(internal, 'adapters', 'cursor', 'agents', `dev-harness-${role}.md`), 'utf8');
      if (body.match(/^model: (.+)$/m)?.[1] !== settings.models.subagents) throw new Error('Subagent model differs from config. Rerun init.');
    }
    console.log(`Valid: ${records().length} records. Structural validation only.`);
  }
  else if (command === 'new') create(args[0], args[0] === 'workstream' ? args[1] : undefined, args.slice(args[0] === 'workstream' ? 2 : 1).join(' '));
  else throw new Error('Commands: init [repository], status, new arc|workstream, check');
} catch (error) {
  console.error(`Dev Harness: ${error.message}`);
  process.exitCode = 1;
}
