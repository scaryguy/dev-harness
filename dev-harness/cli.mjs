#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const home = join(root, 'dev-harness');
const markerStart = '<!-- dev-harness:start -->';
const markerEnd = '<!-- dev-harness:end -->';
const entry = `${markerStart}\nAt the start of a session, run \`node dev-harness/cli.mjs status\` and show its banner.\nRead \`dev-harness/skills/dev-harness/SKILL.md\` before planning or changing this project.\n${markerEnd}`;
const gates = ['RESEARCH', 'IMPLEMENT', 'REVIEW', 'USER CONFIRM', 'MERGED', 'DEFERRED', 'CANCELLED'];
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

function config(folder = home) {
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
    ['.cursor/skills/dev-harness', 'dev-harness/skills/dev-harness', 'dir'],
    ...roles.map(role => [`.cursor/agents/dev-harness-${role}.md`, `dev-harness/adapters/cursor/agents/dev-harness-${role}.md`, 'file'])
  ].map(([from, to, type]) => ({ path: join(target, from), to: relative(dirname(join(target, from)), join(target, to)), type }));
}

function exists(path) {
  try { return lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

function init(target) {
  const folder = join(target, 'dev-harness');
  if (!existsSync(target) || !lstatSync(target).isDirectory()) throw new Error('Target must be an existing repository directory.');
  if (!git(['rev-parse', '--show-toplevel'], target) || resolve(git(['rev-parse', '--show-toplevel'], target)) !== target) {
    throw new Error('Run init at the Git repository root.');
  }
  if (exists(folder) && !existsSync(join(folder, 'config.json'))) throw new Error('Existing dev-harness/ is not managed by this scaffold.');
  if (exists(folder)) config(folder);
  const discovery = links(target);
  for (const link of discovery) {
    const stat = exists(link.path);
    if (stat && (!stat.isSymbolicLink() || readlinkSync(link.path) !== link.to)) throw new Error(`Entry point already exists: ${link.path}`);
  }
  const agents = join(target, 'AGENTS.md');
  const previous = existsSync(agents) ? readFileSync(agents, 'utf8') : '';
  if (previous.includes(markerStart) !== previous.includes(markerEnd)) throw new Error('Incomplete Dev Harness block in AGENTS.md.');
  if (!exists(folder)) {
    mkdirSync(folder);
    for (const item of ['config.json', 'cli.mjs', 'templates', 'skills', 'adapters']) {
      cpSync(join(source, item), join(folder, item), { recursive: true, errorOnExist: true, force: false });
    }
    cpSync(join(source, 'templates', 'gitignore'), join(folder, '.gitignore'));
    mkdirSync(join(folder, 'knowledge'));
    cpSync(join(source, 'templates', 'context.md'), join(folder, 'knowledge', 'context.md'));
  }
  for (const group of ['arcs', 'workstreams']) mkdirSync(join(folder, group), { recursive: true });
  for (const role of roles) {
    const path = join(folder, 'adapters', 'cursor', 'agents', `dev-harness-${role}.md`);
    const body = readFileSync(path, 'utf8');
    const next = body.replace(/^model: .+$/m, `model: ${config(folder).models.subagents}`);
    if (next !== body) writeFileSync(path, next);
  }
  if (!previous.includes(markerStart)) writeFileSync(agents, `${previous}${previous ? '\n\n' : ''}${entry}\n`);
  for (const link of discovery) {
    mkdirSync(dirname(link.path), { recursive: true });
    if (!exists(link.path)) symlinkSync(link.to, link.path, link.type);
  }
  console.log('Cursor ready. Select Grok 4.7 · High, start a new chat, and say “Start dev harness.”');
  console.log('Setup preserves existing configuration. Rerun init after changing the subagent model.');
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
  }
  return result;
}

function status() {
  const settings = config();
  const user = identity();
  const active = records().filter(record => !['complete', 'cancelled', 'MERGED', 'DEFERRED', 'CANCELLED'].includes(record.status || record.gate));
  console.log(`Dev Harness · ${user.name} · ${git(['branch', '--show-current']) || 'detached/unborn'}\nModel: ${settings.models.orchestrator} (select in Cursor)`);
  if (!active.length) console.log('No active arcs or workstreams. Describe what you want to build.');
  for (const record of active.sort((a, b) => Number(b.owner.id === user.id) - Number(a.owner.id === user.id))) {
    console.log(`${record.owner.id === user.id ? 'Yours' : record.owner.name} · ${record.id} · ${record.title} · ${record.gate || record.status}\nNext: ${record.next}`);
  }
}

function create(kind, arc, title) {
  if (!['arc', 'workstream'].includes(kind) || !title?.trim()) throw new Error('Usage: new arc "Title" | new workstream ARC_ID "Title"');
  config();
  const existing = records();
  if (kind === 'workstream' && !existing.some(record => record.kind === 'arc' && record.id === arc && !['complete', 'cancelled'].includes(record.status))) {
    throw new Error('Workstream needs an existing open arc.');
  }
  const owner = identity();
  const slug = owner.name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'user';
  const id = `${kind === 'arc' ? 'ARC' : 'WS'}-${slug}-${owner.id}-${randomUUID().slice(0, 8)}`;
  const data = { id, kind, title: title.trim(), owner, revision: 1, updated: new Date().toISOString(), next: 'Agree scope, decisions, and verification.' };
  if (kind === 'arc') data.status = 'draft'; else Object.assign(data, { arc, gate: 'RESEARCH' });
  const folder = join(home, kind === 'arc' ? 'arcs' : 'workstreams');
  mkdirSync(folder, { recursive: true });
  const template = readFileSync(join(home, 'templates', `${kind}.md`), 'utf8').replace('{{title}}', data.title.replace(/[\r\n]+/g, ' '));
  writeFileSync(join(folder, `${id}.md`), `---\n${JSON.stringify(data, null, 2)}\n---\n\n${template}- ${data.updated} · ${owner.name} · Created.\n`, { flag: 'wx' });
  console.log(id);
}

try {
  const [command = 'init', ...args] = process.argv.slice(2);
  if (command === 'init') init(resolve(args[0] || root));
  else if (command === 'status') status();
  else if (command === 'check') {
    const settings = config();
    for (const role of roles) {
      const body = readFileSync(join(home, 'adapters', 'cursor', 'agents', `dev-harness-${role}.md`), 'utf8');
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
