// ── js/storage.js ─────────────────────────────────────
// Wrapper async sobre IndexedDB para guardar las sesiones SISAO.
// localStorage tiene ~5-10MB de tope y se satura con 3-4 archivos.
// IndexedDB típicamente permite ~50MB+ sin pedirle nada al usuario.
//
// API expuesta:
//   - loadAllSessionsFromStorage()  → Promise<Array> (devuelve todas)
//   - saveSessionToStorage(session) → Promise<void>
//   - deleteSessionFromStorage(id)  → Promise<void>
//   - clearAllSessionsStorage()     → Promise<void>
//   - migrateLegacyLocalStorage()   → Promise<number> (cantidad migrada)

const DB_NAME       = 'osep_lab';
const DB_VERSION    = 1;
const DB_STORE_SESS = 'sessions';

let DB_HANDLE = null;
let DB_ERROR  = null;

function _openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Este navegador no soporta IndexedDB'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE_SESS)) {
        db.createObjectStore(DB_STORE_SESS, {keyPath: 'id'});
      }
    };
  });
}

async function _getDB() {
  if (DB_HANDLE) return DB_HANDLE;
  if (DB_ERROR)  throw DB_ERROR;
  try {
    DB_HANDLE = await _openDB();
    return DB_HANDLE;
  } catch(e) {
    DB_ERROR = e;
    throw e;
  }
}

async function loadAllSessionsFromStorage() {
  try {
    const db = await _getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE_SESS, 'readonly');
      const store = tx.objectStore(DB_STORE_SESS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror   = () => reject(req.error);
    });
  } catch(e) {
    console.warn('IndexedDB no disponible, fallback a localStorage:', e.message);
    try {
      const raw = JSON.parse(localStorage.getItem('osep_sessions_v1') || '[]');
      return Array.isArray(raw) ? raw.filter(s => s && s.id && s.pracMap) : [];
    } catch(e2) { return []; }
  }
}

async function saveSessionToStorage(session) {
  try {
    const db = await _getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE_SESS, 'readwrite');
      tx.objectStore(DB_STORE_SESS).put(session);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  } catch(e) {
    // Fallback localStorage — puede saturar
    try {
      const raw = JSON.parse(localStorage.getItem('osep_sessions_v1') || '[]');
      const idx = raw.findIndex(s => s.id === session.id);
      if (idx >= 0) raw[idx] = session; else raw.push(session);
      localStorage.setItem('osep_sessions_v1', JSON.stringify(raw));
    } catch(e2) {
      throw new Error('No se pudo guardar (storage lleno). Probá eliminar archivos viejos.');
    }
  }
}

async function deleteSessionFromStorage(id) {
  try {
    const db = await _getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE_SESS, 'readwrite');
      tx.objectStore(DB_STORE_SESS).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => resolve();
    });
  } catch(e) {
    try {
      const raw = JSON.parse(localStorage.getItem('osep_sessions_v1') || '[]');
      const filtered = raw.filter(s => s.id !== id);
      localStorage.setItem('osep_sessions_v1', JSON.stringify(filtered));
    } catch(e2) {}
  }
}

async function clearAllSessionsStorage() {
  try {
    const db = await _getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE_SESS, 'readwrite');
      tx.objectStore(DB_STORE_SESS).clear();
      tx.oncomplete = () => resolve();
      tx.onerror    = () => resolve();
    });
  } catch(e) {
    try { localStorage.removeItem('osep_sessions_v1'); } catch(e2) {}
  }
}

// Migración: si hay datos en localStorage (versión vieja), los pasa a IndexedDB
async function migrateLegacyLocalStorage() {
  try {
    const raw = localStorage.getItem('osep_sessions_v1');
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    const db = await _getDB();
    let count = 0;
    for (const s of arr) {
      if (s && s.id && s.pracMap) {
        await new Promise((res, rej) => {
          const tx = db.transaction(DB_STORE_SESS, 'readwrite');
          tx.objectStore(DB_STORE_SESS).put(s);
          tx.oncomplete = () => { count++; res(); };
          tx.onerror    = () => rej(tx.error);
        });
      }
    }
    localStorage.removeItem('osep_sessions_v1');
    console.log('Migradas', count, 'sesiones de localStorage a IndexedDB');
    return count;
  } catch(e) {
    console.warn('Migración falló:', e);
    return 0;
  }
}
