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
