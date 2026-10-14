import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const roles = ['planner', 'reviewer', 'owner'];
const valid = value => typeof value === 'string' && value.length > 0 && !new RegExp('[\\r\\n]').test(value);
export default {
  id: 'cursor', label: 'Cursor',
  defaults: Object.fromEntries(['orchestrator', ...roles].map(role => [role, { model: 'grok-4.7[effort=high]' }])),
  capabilities: { instructionDiscovery: true, delegation: true, roleSettings: true, externalWorktrees: true, backgroundExecution: true },
  validateSettings(settings) {
    if (!settings || !['orchestrator', ...roles].every(role => valid(settings.models?.[role]?.model) && settings.models[role].effort === undefined)) throw Error('Invalid Cursor model settings.');
  },
  planArtifacts({ sourceRoot, settings }) {
    return {
      files: roles.map(role => ({ path: 'dev-harness/.harness/adapters/cursor/agents/dev-harness-' + role + '.md', ownership: 'builtin', content: readFileSync(join(sourceRoot, 'adapters/cursor/agents', 'dev-harness-' + role + '.md'), 'utf8').replace(new RegExp('^model: .+$', 'm'), 'model: ' + settings.models[role].model) })),
      links: [['.cursor/skills/dev-harness', 'dev-harness/.harness/skills/dev-harness', 'dir'], ...roles.map(role => ['.cursor/agents/dev-harness-' + role + '.md', 'dev-harness/.harness/adapters/cursor/agents/dev-harness-' + role + '.md', 'file'])].map(([path, target, type]) => ({ path, target, type, legacyTargets: [target.replace('/.harness/', '/')] }))
    };
  },
  checkArtifacts(context) {
    for (const file of this.planArtifacts(context).files) {
      const body = readFileSync(join(context.targetRoot, file.path), 'utf8');
      const role = roles.find(role => file.path.endsWith('-' + role + '.md'));
      if (body.match(new RegExp('^model: (.+)$', 'm'))?.[1] !== context.settings.models[role].model) throw Error('Subagent model differs from config. Rerun init.');
    }
  },
  startupGuidance() { return 'Cursor ready. Select the configured orchestrator model, start a new chat, and say “Start dev harness.” Use --platform cursor; delegate through .cursor/agents/dev-harness-{planner,reviewer,owner}.md.'; }
};
