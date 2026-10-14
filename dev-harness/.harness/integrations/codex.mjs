import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const roles = ['planner', 'reviewer', 'owner'];
const marker = '# dev-harness-managed';
const descriptions = {
  planner: 'Research and plan a Dev Harness arc or workstream before implementation.',
  reviewer: 'Independently review a Dev Harness plan or implementation against its approved scope.',
  owner: 'Implement an approved Dev Harness workstream and verify its outcome.'
};
const valid = value => typeof value === 'string' && value.length > 0 && !new RegExp('[\\r\\n\'"\\\\]').test(value);
const hasMarker = body => body.startsWith(marker + '\n') || body.startsWith(marker + '\r\n');
function versionAtLeast(text) {
  const match = text.match(new RegExp('^codex-cli (\\d+)\\.(\\d+)\\.(\\d+)$'));
  if (!match) return false;
  const actual = [Number(match[1]), Number(match[2]), Number(match[3])];
  const floor = [0, 162, 1];
  for (let index = 0; index < floor.length; index++) {
    if (actual[index] > floor[index]) return true;
    if (actual[index] < floor[index]) return false;
  }
  return true;
}
export default {
  id: 'codex', label: 'Codex',
  defaults: Object.fromEntries(['orchestrator', ...roles].map(role => [role, { model: 'gpt-6.1-sol', effort: role === 'owner' ? 'low' : 'high' }])),
  capabilities: { instructionDiscovery: true, delegation: true, roleSettings: true, externalWorktrees: true, backgroundExecution: true },
  validateSettings(settings) {
    if (!settings || !['orchestrator', ...roles].every(role => valid(settings.models?.[role]?.model) && valid(settings.models[role].effort))) throw Error('Invalid Codex model settings.');
  },
  assertReady() {
    const result = spawnSync('codex', ['--version'], { encoding: 'utf8', shell: false });
    if (result.error || result.status !== 0) throw Error('Codex CLI is unavailable.');
    const text = String(result.stdout || '').trim();
    if (!new RegExp('^codex-cli \\d+\\.\\d+\\.\\d+$').test(text)) throw Error('Unparsable Codex CLI version.');
    if (!versionAtLeast(text)) throw Error('Codex CLI 0.162.1 or newer is required.');
  },
  planArtifacts({ settings }) {
    return {
      files: [],
      links: [{ path: '.agents/skills/dev-harness', target: 'dev-harness/.harness/skills/dev-harness', type: 'dir', legacyTargets: [] }],
      nativeFiles: roles.map(role => {
        const model = settings.models[role];
        return {
          path: '.codex/agents/dev-harness-' + role + '.toml',
          content: marker + '\n'
            + 'name = "dev-harness-' + role + '"\n'
            + 'description = "' + descriptions[role] + '"\n'
            + 'model = "' + model.model + '"\n'
            + 'model_reasoning_effort = "' + model.effort + '"\n'
            + 'developer_instructions = "Read dev-harness/.harness/skills/dev-harness/SKILL.md and follow the ' + role + ' role boundary."\n'
        };
      })
    };
  },
  checkArtifacts(context) {
    for (const file of this.planArtifacts(context).nativeFiles) {
      const body = readFileSync(join(context.targetRoot, file.path), 'utf8');
      const role = roles.find(role => file.path.endsWith('-' + role + '.toml'));
      const settings = context.settings.models[role];
      const name = body.match(new RegExp('^name = "([^"]*)"', 'm'));
      const model = body.match(new RegExp('^model = "([^"]*)"', 'm'));
      const effort = body.match(new RegExp('^model_reasoning_effort = "([^"]*)"', 'm'));
      if (!hasMarker(body) || name?.[1] !== 'dev-harness-' + role || model?.[1] !== settings.model || effort?.[1] !== settings.effort) throw Error('Codex agent differs from config. Rerun init.');
    }
  },
  startupGuidance(context) {
    const orchestrator = context.settings.models.orchestrator;
    const flag = '--config model_reasoning_effort="' + orchestrator.effort + '"';
    return 'codex --model ' + orchestrator.model + ' ' + flag + '\n'
      + 'codex exec --model ' + orchestrator.model + ' ' + flag + '\n'
      + 'Start dev harness. Use --platform codex.';
  }
};
