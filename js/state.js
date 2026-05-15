// ── js/state.js ───────────────────────────────────────
// Estado persistente en localStorage:
//   - SESSIONS: archivos SISAO cargados (acumulan)
//   - MANUAL_UB_OVERRIDES: cambios manuales al UB_MAP del usuario
//   - PENDING_CHANGES: cola en memoria, no persistida

const SK_SESSIONS    = 'osep_sessions_v1';
const SK_OVERRIDES   = 'osep_ub_overrides_v1';
const SK_NEW_PRACS   = 'osep_new_pracs_v1';

// SESSIONS arranca vacío; se rellena async desde IndexedDB en main.js antes
// de la primera llamada a renderAll().
let SESSIONS = [];

let MANUAL_UB_OVERRIDES = (() => {
  try { return JSON.parse(localStorage.getItem(SK_OVERRIDES) || '{}'); }
  catch(e){ return {}; }
})();

// Prácticas agregadas a mano por el usuario (no estaban en el nomenclador base)
// Formato: [{c, a, p, uu}]
let NEW_PRACTICES = (() => {
  try {
    const raw = JSON.parse(localStorage.getItem(SK_NEW_PRACS) || '[]');
    return Array.isArray(raw) ? raw.filter(x => x && typeof x.c === 'number' && typeof x.p === 'string') : [];
  } catch(e){ return []; }
})();

let PENDING_CHANGES = [];

// Target del modal "AGREGAR al convenio"
let _modalTarget = null;

// Tabla actual de prácticas para el buscador (se reasigna en aggregate.js)
let ALL_PRAC = BASE_ALL_PRAC.slice();

// ── persistencia ──────────────────────────────────────
// Sesiones SISAO: IndexedDB (más capacidad). Overrides y nuevas: localStorage (chicos).
function saveOverrides() {
  try { localStorage.setItem(SK_OVERRIDES, JSON.stringify(MANUAL_UB_OVERRIDES)); }
  catch(e){}
}
function saveNewPractices() {
  try { localStorage.setItem(SK_NEW_PRACS, JSON.stringify(NEW_PRACTICES)); }
  catch(e){}
}

// ── UB lookup con overrides ──────────────────────────
// Búsqueda: 1) override manual del usuario  2) UB_MAP exacto  3) UB_MAP por código solo
function getUB(cod, analo) {
  const key = cod + '_' + analo;
  if (key in MANUAL_UB_OVERRIDES) return MANUAL_UB_OVERRIDES[key];
  if (key in UB_MAP)              return UB_MAP[key];
  return UB_MAP[cod + '_0'] || 0;
}
