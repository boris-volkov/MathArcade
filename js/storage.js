// Guest mode: a per-tab flag (cleared when the tab closes) that makes
// saved-progress reads/writes no-ops, so a guest never sees or overwrites
// the owner's levels and lifetime stats.
const GUEST_KEY = 'matharcade_guest';

export function isGuestMode() {
  try { return sessionStorage.getItem(GUEST_KEY) === '1'; }
  catch { return false; }
}

export function setGuestMode(on) {
  try {
    if (on) sessionStorage.setItem(GUEST_KEY, '1');
    else sessionStorage.removeItem(GUEST_KEY);
  } catch {}
}

// Drop-in localStorage.getItem/setItem replacement for saved progress —
// reads back empty and writes are discarded while guest mode is active.
export const progressStorage = {
  getItem(key) {
    if (isGuestMode()) return null;
    try { return localStorage.getItem(key); } catch { return null; }
  },
  setItem(key, value) {
    if (isGuestMode()) return;
    try { localStorage.setItem(key, value); } catch {}
  },
};

// ---------- Per-mode level + position within that level ----------
// The level stays in its own key as a plain integer (that's what earlier
// builds wrote, and they should keep reading it). How far through the level
// the player got rides alongside in a second key, so reopening a game picks
// up mid-level instead of dropping back to an empty bar.
const levelKey    = (mode) => `matharcade_level_${mode}`;
const progressKey = (mode) => `matharcade_progress_${mode}`;

export function loadLevelState(mode) {
  const level = parseInt(progressStorage.getItem(levelKey(mode)), 10);
  const progress = parseFloat(progressStorage.getItem(progressKey(mode)));
  return {
    level: (Number.isFinite(level) && level > 0) ? level : null,
    // Clamp inside the level: a stored ±1 would trip a level change on load.
    progress: Number.isFinite(progress) ? Math.max(-0.95, Math.min(0.95, progress)) : 0,
  };
}

export function saveLevelState(mode, level, progress) {
  if (Number.isFinite(level)) progressStorage.setItem(levelKey(mode), String(level));
  if (Number.isFinite(progress)) progressStorage.setItem(progressKey(mode), progress.toFixed(3));
}
