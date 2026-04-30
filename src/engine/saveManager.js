import { SAVE_KEY, SAVE_VERSION, finiteNumber } from './shared.js';

export const SAVE_SLOT_COUNT = 4;
export const SAVE_SLOT_PREFIX = 'island_save_slot_';
export const SAVE_SLOT_SCHEMA = 1;

export function slotKey(slotId){
  return `${SAVE_SLOT_PREFIX}${normalizeSlotId(slotId)}_v${SAVE_SLOT_SCHEMA}`;
}

export function normalizeSlotId(slotId){
  const n = Math.max(1, Math.min(SAVE_SLOT_COUNT, Math.floor(finiteNumber(slotId, 1))));
  return String(n);
}

export function safeLocalStorage(){
  try {
    const key = '__island_storage_probe__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return localStorage;
  } catch (_e) {
    return null;
  }
}

export function summarizeSave(data, slotId){
  if (!data || typeof data !== 'object') return null;
  const player = data.player || {};
  const inv = player.inv || {};
  return {
    slotId: normalizeSlotId(slotId),
    version: finiteNumber(data.version, SAVE_VERSION),
    savedAt: finiteNumber(data.savedAt, 0),
    day: Math.max(1, Math.floor(finiteNumber(data.day, 1))),
    island: Math.max(1, Math.floor(finiteNumber(data.island, 1))),
    seed: finiteNumber(data.seed, 0),
    playTime: Math.max(0, finiteNumber(data.playTime, 0)),
    health: Math.round(finiteNumber(player.health, 100)),
    hunger: Math.round(finiteNumber(player.hunger, 100)),
    animals: Array.isArray(data.world?.animals) ? data.world.animals.length : 0,
    homes: Array.isArray(data.world?.buildings) ? data.world.buildings.filter(b => b && b.built).length : 0,
    title: data.title || `Island ${Math.max(1, Math.floor(finiteNumber(data.island, 1)))}`
  };
}

export function readSlot(slotId){
  const storage = safeLocalStorage();
  if (!storage) return { slotId: normalizeSlotId(slotId), empty: true, error: 'storage_unavailable' };
  const id = normalizeSlotId(slotId);
  const raw = storage.getItem(slotKey(id));
  if (!raw) return { slotId: id, empty: true };
  try {
    const data = JSON.parse(raw);
    return { slotId: id, empty: false, data, meta: summarizeSave(data, id) };
  } catch (error) {
    return { slotId: id, empty: true, corrupt: true, error: error.message };
  }
}

export function writeSlot(slotId, data){
  const storage = safeLocalStorage();
  if (!storage) throw new Error('Browser storage is unavailable.');
  const id = normalizeSlotId(slotId);
  const payload = {
    ...data,
    schema: SAVE_SLOT_SCHEMA,
    slotId: id,
    savedAt: Date.now()
  };
  storage.setItem(slotKey(id), JSON.stringify(payload));
  // Keep the old one-save key as a compatibility mirror for players who used L before slots.
  storage.setItem(SAVE_KEY, JSON.stringify(payload));
  return payload;
}

export function deleteSlot(slotId){
  const storage = safeLocalStorage();
  if (!storage) return false;
  storage.removeItem(slotKey(slotId));
  return true;
}

export function listSlots(){
  return Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => readSlot(index + 1));
}

export function latestSlot(){
  return listSlots()
    .filter(slot => !slot.empty && slot.meta)
    .sort((a, b) => b.meta.savedAt - a.meta.savedAt)[0] || null;
}

export function readLegacySave(){
  const storage = safeLocalStorage();
  if (!storage) return null;
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_e) { return null; }
}

export function formatPlayTime(seconds){
  seconds = Math.max(0, Math.floor(finiteNumber(seconds, 0)));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${Math.max(1, m)}m`;
}

export function formatSaveDate(ts){
  if (!ts) return 'Never';
  try {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
  } catch (_e) {
    return new Date(ts).toLocaleString();
  }
}
