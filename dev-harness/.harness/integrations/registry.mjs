import cursor from './cursor.mjs';
import codex from './codex.mjs';
export const adapters = [cursor, codex];
export function lookup(id) {
  const adapter = adapters.find(adapter => adapter.id === id);
  if (!adapter) throw Error('Unsupported platform: ' + id);
  return adapter;
}
