import cursor from './cursor.mjs';
export const adapters = [cursor];
export function lookup(id) {
  const adapter = adapters.find(adapter => adapter.id === id);
  if (!adapter) throw Error('Unsupported platform: ' + id);
  return adapter;
}
