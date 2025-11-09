import { db, ref, get, set, update, remove, push } from "./firebase-config.js";

export const api = {
  getClinics: async () => {
    const s = await get(ref(db, "clinics"));
    const d = s.val() || {};
    return Object.keys(d).map(id => ({ id, ...d[id] }));
  },
  getClinic: async id => {
    const s = await get(ref(db, `clinics/${id}`));
    return s.exists() ? { id, ...s.val() } : null;
  },
  addClinic: async name => {
    const r = push(ref(db, "clinics"));
    const c = { id: r.key, name, currentNumber: 0 };
    await set(r, c);
    return c;
  },
  renameClinic: (id, n) => update(ref(db, `clinics/${id}`), { name: n }),
  deleteClinic: id => remove(ref(db, `clinics/${id}`)),
  advanceNumber: async id => {
    const c = await api.getClinic(id);
    if (!c) return null;
    const nn = (c.currentNumber || 0) + 1;
    await update(ref(db, `clinics/${id}`), { currentNumber: nn });
    return { ...c, currentNumber: nn };
  },
  goBackNumber: async id => {
    const c = await api.getClinic(id);
    if (!c) return null;
    const nn = Math.max(0, (c.currentNumber || 0) - 1);
    await update(ref(db, `clinics/${id}`), { currentNumber: nn });
    return { ...c, currentNumber: nn };
  },
  setNumber: async (id, v) => {
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 0) await update(ref(db, `clinics/${id}`), { currentNumber: n });
  },
  resetNumber: async id => update(ref(db, `clinics/${id}`), { currentNumber: 0 })
};