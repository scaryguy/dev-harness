import { lstatSync, readFileSync, readlinkSync } from 'node:fs';
import { dirname, join, relative, posix } from 'node:path';
import { lookup } from './registry.mjs';
const codexMarker = '# dev-harness-managed';
const claudeComment = '<!-- dev-harness-managed -->';
const claudeInstruction = '@AGENTS.md\n';
function codexManaged(body) {
  return body.startsWith(codexMarker + '\n') || body.startsWith(codexMarker + '\r\n');
}
function claudeLines(body) {
  return body.split('\n').map(line => line.endsWith('\r') ? line.slice(0, -1) : line);
}
function claudeAgentManaged(body) {
  const lines = claudeLines(body);
  if (lines[0] !== '---') return false;
  let close = -1;
  for (let index = 1; index < lines.length; index++) {
    if (lines[index] === '---') { close = index; break; }
  }
  if (close < 0 || lines[close + 1] !== claudeComment) return false;
  for (let index = 0; index < lines.length; index++) if (lines[index] === claudeComment && index !== close + 1) return false;
  return true;
}
function claudeInstructionManaged(body) {
  return body === claudeInstruction;
}
function nativeFamily(path) {
  if (path === 'CLAUDE.md') return 'claude-instruction';
  if (path.startsWith('.claude/agents/') && path.endsWith('.md')) return 'claude-agent';
  if (path.startsWith('.codex/agents/') && path.endsWith('.toml')) return 'codex';
  return '';
}
function nativeManaged(path, body) {
  const family = nativeFamily(path);
  if (family === 'codex') return codexManaged(body);
  if (family === 'claude-agent') return claudeAgentManaged(body);
  if (family === 'claude-instruction') return claudeInstructionManaged(body);
  return false;
}
export function stat(path) { try { return lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } }
export function safePath(path) {
  if (typeof path !== 'string' || !path || path === '.' || path.includes('\0') || path.includes('\\') || posix.normalize(path) !== path || path.startsWith('/') || path === '..' || path.startsWith('../')) throw Error('Unsafe artifact path: ' + (path));
  return path;
}
export function safeParents(root, path, includeLeaf = false) {
  safePath(path);
  const parts = path.split('/');
  if (!includeLeaf) parts.pop();
  let current = root;
  for (const part of parts) { current = join(current, part); const item = stat(current); if (item && (!item.isDirectory() || item.isSymbolicLink())) throw Error('Unsafe parent: ' + (current)); }
}
export function planArtifacts(targetRoot, sourceRoot, config) {
  const result = { files: [], links: [], nativeFiles: [] };
  const occupied = ['dev-harness/.harness/config.json', 'dev-harness/.harness/cli.mjs', 'dev-harness/.harness/integrations', 'dev-harness/.harness/templates', 'dev-harness/.harness/skills', 'dev-harness/.harness/knowledge', 'dev-harness/.harness/state', 'dev-harness/.harness/local', 'dev-harness/.harness/cache', 'dev-harness/.harness/.gitignore', 'dev-harness/.harness/cli.test.mjs', 'dev-harness/arcs', 'dev-harness/workstreams', 'AGENTS.md'];
  for (const id of config.installedPlatforms) {
    const plan = lookup(id).planArtifacts({ targetRoot, sourceRoot, settings: config.adapters[id], id });
    for (const file of plan.files) {
      safePath(file.path);
      if (!file.path.startsWith('dev-harness/.harness/') || file.ownership !== 'builtin' || typeof file.content !== 'string') throw Error('Invalid generated artifact.');
      const sourceItem = stat(join(sourceRoot, file.path.slice('dev-harness/.harness/'.length)));
      if (sourceItem?.isDirectory()) throw Error('Generated file conflicts with shared directory: ' + (file.path));
      result.files.push(file);
    }
    for (const link of plan.links) {
      safePath(link.path); safePath(link.target);
      if (link.path === 'AGENTS.md' || link.path === 'dev-harness' || link.path.startsWith('dev-harness/')) throw Error('Discovery links must be native entrypoints.');
      if (!link.target.startsWith('dev-harness/.harness/') || !['file', 'dir'].includes(link.type) || !Array.isArray(link.legacyTargets)) throw Error('Invalid discovery artifact.');
      link.legacyTargets.forEach(safePath);
      result.links.push({ ...link, to: relative(dirname(join(targetRoot, link.path)), join(targetRoot, link.target)), legacy: link.legacyTargets.map(target => relative(dirname(join(targetRoot, link.path)), join(targetRoot, target))) });
    }
    if (plan.nativeFiles !== undefined && !Array.isArray(plan.nativeFiles)) throw Error('Invalid native artifact.');
    const nativePaths = [];
    for (const file of plan.nativeFiles || []) {
      safePath(file.path);
      if (file.path === 'AGENTS.md' || file.path === 'dev-harness' || file.path.startsWith('dev-harness/')) throw Error('Native files must stay outside the harness.');
      if (typeof file.content !== 'string' || !nativeManaged(file.path, file.content)) throw Error('Invalid native artifact.');
      result.nativeFiles.push(file);
      nativePaths.push(file.path);
    }
    occupied.push(...plan.files.map(file => file.path), ...plan.links.map(link => link.path), ...nativePaths);
  }
  for (const link of result.links) {
    const generated = result.files.some(file => file.path === link.target);
    const shared = stat(join(sourceRoot, link.target.slice('dev-harness/.harness/'.length)));
    if (!generated && (!shared || shared.isSymbolicLink() || (!shared.isFile() && !shared.isDirectory()))) throw Error('Missing internal link target: ' + (link.target));
  }
  const sorted = occupied.sort();
  if (sorted.some((path, index) => sorted.slice(0, index).some(prior => path === prior || path.startsWith('' + (prior) + '/')))) throw Error('Integration artifact collision.');
  return result;
}
const requiredCapabilities = ['instructionDiscovery', 'delegation', 'roleSettings', 'externalWorktrees', 'backgroundExecution'];
export function assertCapabilities(ids) {
  for (const id of ids) {
    const capabilities = lookup(id).capabilities;
    for (const name of requiredCapabilities) if (!capabilities || capabilities[name] !== true) throw Error('Missing required capability: ' + name + '.');
  }
}
export function preflightNatives(targetRoot, plan) {
  for (const file of plan.nativeFiles) {
    safeParents(targetRoot, file.path);
    const path = join(targetRoot, file.path);
    const item = stat(path);
    if (!item) continue;
    if (item.isSymbolicLink() || !item.isFile()) throw Error('Native file is occupied: ' + file.path);
    const body = readFileSync(path, 'utf8');
    if (!nativeManaged(file.path, body)) throw Error('Native file lacks the managed marker: ' + file.path);
  }
}
export function preflight(targetRoot, plan) {
  for (const file of plan.files) { safeParents(targetRoot, file.path); const item = stat(join(targetRoot, file.path)); if (item && !item.isFile()) throw Error('Invalid managed file: ' + (file.path)); }
  for (const link of plan.links) {
    safeParents(targetRoot, link.path); safeParents(targetRoot, link.target);
    const item = stat(join(targetRoot, link.path));
    if (item && (!item.isSymbolicLink() || ![link.to, ...link.legacy].includes(readlinkSync(join(targetRoot, link.path))))) throw Error('Entry point already exists: ' + (join(targetRoot, link.path)));
  }
}

export function checkLinks(targetRoot, plan) {
  for (const link of plan.links) {
    safeParents(targetRoot, link.path);
    safeParents(targetRoot, link.target);
    const target = stat(join(targetRoot, link.target));
    if (!target || target.isSymbolicLink() || (link.type === 'dir' ? !target.isDirectory() : !target.isFile())) throw Error('Invalid discovery target: ' + (link.target));
    const path = join(targetRoot, link.path);
    const item = stat(path);
    if (!item?.isSymbolicLink() || readlinkSync(path) !== link.to) throw Error('Invalid discovery link: ' + (link.path) + '. Rerun init.');
  }
}
