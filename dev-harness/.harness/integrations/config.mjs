import { lookup } from './registry.mjs';
const object = value => value && typeof value === 'object' && !Array.isArray(value);
export function normalize(value) {
  if (!object(value) || ![1, 2].includes(value.version) || typeof value.git?.integrationBranch !== 'string' || !value.git.integrationBranch || typeof value.git.requireExplicitWriteApproval !== 'boolean' || !Array.isArray(value.checks) || value.checks.some(check => typeof check !== 'string')) throw Error('Invalid config.json: version, Git policy, or checks.');
  let installedPlatforms, adapters;
  if (value.version === 1) {
    if (value.platform !== 'cursor' || ![value.models?.orchestrator, value.models?.subagents].every(model => typeof model === 'string' && model.length && !new RegExp('[\\r\\n]').test(model))) throw Error('Invalid config.json: Cursor models.');
    installedPlatforms = ['cursor'];
    adapters = { cursor: { models: Object.fromEntries(['orchestrator', 'planner', 'reviewer', 'owner'].map(role => [role, { model: role === 'orchestrator' ? value.models.orchestrator : value.models.subagents }])) } };
  } else {
    if (!Array.isArray(value.installedPlatforms) || !value.installedPlatforms.length || value.installedPlatforms.some(id => typeof id !== 'string') || new Set(value.installedPlatforms).size !== value.installedPlatforms.length || !object(value.adapters)) throw Error('Invalid config.json: installedPlatforms/adapters.');
    ({ installedPlatforms, adapters } = value);
  }
  for (const id of installedPlatforms) lookup(id).validateSettings(adapters[id]);
  return { ...value, installedPlatforms, adapters };
}
export function planConfig(current, defaults, requested) {
  for (const id of requested) lookup(id);
  const original = current || defaults;
  const normalized = normalize(original);
  if (!requested.length && original.version === 1) return structuredClone(original);
  if (original.version === 1 && ('installedPlatforms' in original || 'adapters' in original)) throw Error('Config migration extension collision: installedPlatforms/adapters.');
  const installedPlatforms = [...new Set([...(current ? normalized.installedPlatforms : []), ...(requested.length ? requested : normalized.installedPlatforms)])];
  const adapters = original.version === 2 ? structuredClone(original.adapters) : current ? structuredClone(normalized.adapters) : {};
  for (const id of installedPlatforms) adapters[id] ??= { models: structuredClone(lookup(id).defaults) };
  const result = { ...structuredClone(original), version: 2, installedPlatforms, adapters };
  normalize(result);
  return result;
}
