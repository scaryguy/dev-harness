import cursor from './cursor.mjs';
import codex from './codex.mjs';
import claudeCode from './claude-code.mjs';
export const adapters = [cursor, codex, claudeCode];
export function lookup(id) {
  const adapter = adapters.find(adapter => adapter.id === id);
  if (!adapter) throw Error('Unsupported platform: ' + id);
  return adapter;
}
