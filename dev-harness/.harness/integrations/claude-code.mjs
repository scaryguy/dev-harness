import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const roles = ['planner', 'reviewer', 'owner'];
const comment = '<!-- dev-harness-managed -->';
const descriptions = {
  planner: 'Research and plan a Dev Harness arc or workstream before implementation.',
  reviewer: 'Independently review a Dev Harness plan or implementation against its approved scope.',
  owner: 'Implement an approved Dev Harness workstream and verify its outcome.'
};
const valid = value => typeof value === 'string' && value.length > 0 && !new RegExp('[\\r\\n\'"\\\\]').test(value);
function linesOf(body) {
  return body.split('\n').map(line => line.endsWith('\r') ? line.slice(0, -1) : line);
}
function managed(body) {
  const lines = linesOf(body);
  if (lines[0] !== '---') return false;
  let close = -1;
  for (let index = 1; index < lines.length; index++) {
    if (lines[index] === '---') { close = index; break; }
  }
  if (close < 0 || lines[close + 1] !== comment) return false;
  for (let index = 0; index < lines.length; index++) if (lines[index] === comment && index !== close + 1) return false;
  return true;
}
function versionAtLeast(text) {
  const match = text.match(new RegExp('^(\\d+)\\.(\\d+)\\.(\\d+) \\(Claude Code\\)$'));
  if (!match) return false;
  const actual = [Number(match[1]), Number(match[2]), Number(match[3])];
  const floor = [2, 1, 44];
  for (let index = 0; index < floor.length; index++) {
    if (actual[index] > floor[index]) return true;
    if (actual[index] < floor[index]) return false;
  }
  return true;
}
function agent(role, settings) {
  const model = settings.models[role];
  return '---\n'
    + 'name: dev-harness-' + role + '\n'
    + 'description: ' + descriptions[role] + '\n'
    + 'model: ' + model.model + '\n'
    + 'effort: ' + model.effort + '\n'
    + '---\n'
    + comment + '\n'
    + 'Read dev-harness/.harness/skills/dev-harness/SKILL.md and follow the ' + role + ' role boundary.\n';
}
export default {
  id: 'claude-code', label: 'Claude Code',
  defaults: Object.fromEntries(['orchestrator', ...roles].map(role => [role, { model: 'opus', effort: role === 'owner' ? 'low' : 'high' }])),
  capabilities: { instructionDiscovery: true, delegation: true, roleSettings: true, externalWorktrees: true, backgroundExecution: true },
  validateSettings(settings) {
    if (!settings || !['orchestrator', ...roles].every(role => valid(settings.models?.[role]?.model) && valid(settings.models[role].effort))) throw Error('Invalid Claude Code model settings.');
  },
  assertReady() {
    const result = spawnSync('claude', ['--version'], { encoding: 'utf8', shell: false });
    if (result.error || result.status !== 0) throw Error('Claude Code CLI is unavailable.');
    const text = String(result.stdout || '').trim();
    if (!new RegExp('^\\d+\\.\\d+\\.\\d+ \\(Claude Code\\)$').test(text)) throw Error('Unparsable Claude Code CLI version.');
    if (!versionAtLeast(text)) throw Error('Claude Code CLI 2.1.44 or newer is required.');
  },
  planArtifacts({ settings }) {
    return {
      files: [],
      links: [{ path: '.claude/skills/dev-harness', target: 'dev-harness/.harness/skills/dev-harness', type: 'dir', legacyTargets: [] }],
      nativeFiles: [{ path: 'CLAUDE.md', content: '@AGENTS.md\n' }, ...roles.map(role => ({ path: '.claude/agents/dev-harness-' + role + '.md', content: agent(role, settings) }))]
    };
  },
  checkArtifacts(context) {
    const instruction = readFileSync(join(context.targetRoot, 'CLAUDE.md'), 'utf8');
    if (instruction !== '@AGENTS.md\n') throw Error('CLAUDE.md differs from the managed import. Rerun init.');
    for (const role of roles) {
      const body = readFileSync(join(context.targetRoot, '.claude/agents/dev-harness-' + role + '.md'), 'utf8');
      const settings = context.settings.models[role];
      const name = body.match(new RegExp('^name: (.+)$', 'm'));
      const model = body.match(new RegExp('^model: (.+)$', 'm'));
      const effort = body.match(new RegExp('^effort: (.+)$', 'm'));
      if (!managed(body) || name?.[1] !== 'dev-harness-' + role || model?.[1] !== settings.model || effort?.[1] !== settings.effort) throw Error('Claude Code agent differs from config. Rerun init.');
    }
  },
  startupGuidance(context) {
    const orchestrator = context.settings.models.orchestrator;
    return 'claude --model ' + orchestrator.model + ' --effort ' + orchestrator.effort + '\n'
      + 'claude -p --model ' + orchestrator.model + ' --effort ' + orchestrator.effort + '\n'
      + 'Start dev harness. Use --platform claude-code.';
  }
};
