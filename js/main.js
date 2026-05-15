// ── js/main.js ────────────────────────────────────────
// Punto de entrada: engancha eventos al DOM y dispara renderAll.
// Carga al final, todos los otros módulos ya están listos.

function _bindUploadZone() {
  const zone  = document.getElementById('upload-zone');
  const input = document.getElementById('fileInput');
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());

  input.addEventListener('change', e => {
    [...e.target.files].forEach(f => processFile(f));
    e.target.value = '';
  });

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.style.borderColor = B;
  });
  zone.addEventListener('dragleave', () => {
    zone.style.borderColor = '#1e3a5f';
  });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = '#1e3a5f';
    [...e.dataTransfer.files].forEach(f => processFile(f));
  });
}

function _bindButtons() {
  // Botón eliminar todas las sesiones
  const btnClear = document.getElementById('btn-clear-all');
  if (btnClear) btnClear.addEventListener('click', clearAllSessions);

  // Filtros TODAS / CON UB / SIN UB
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // Sort en headers
  document.querySelectorAll('[data-sort]').forEach(th => {
    th.addEventListener('click', () => sortTable(Number(th.dataset.sort)));
  });

  // Buscadores
  const srch = document.getElementById('srch');
  if (srch) srch.addEventListener('input', renderTable);
  const srchCod = document.getElementById('srchCod');
  if (srchCod) srchCod.addEventListener('input', renderTable);

  // Modal UB
  const mc = document.getElementById('modal-cancel');
  const mk = document.getElementById('modal-confirm');
  const ms = document.getElementById('modal-sacar');
  if (mc) mc.addEventListener('click', closeModal);
  if (mk) mk.addEventListener('click', confirmUBChange);
  if (ms) ms.addEventListener('click', sacarFromModal);

  // Modal NUEVA PRÁCTICA
  const npBtn = document.getElementById('btnNewPrac');
  const npC   = document.getElementById('np-cancel');
  const npK   = document.getElementById('np-confirm');
  if (npBtn) npBtn.addEventListener('click', openNewPracticeModal);
  if (npC)   npC.addEventListener('click',  closeNewPracticeModal);
  if (npK)   npK.addEventListener('click',  confirmNewPractice);

  // Botón imprimir / PDF — FIX bug #5: usa Ctrl+P nativo del browser
  const pdf = document.getElementById('pdfBtn');
  if (pdf) pdf.addEventListener('click', () => window.print());

  // Teclas globales para los modales
  document.addEventListener('keydown', e => {
    const ubModal = document.getElementById('ub-modal');
    const npModal = document.getElementById('new-prac-modal');
    if (e.key === 'Escape') {
      if (ubModal && ubModal.style.display === 'flex') closeModal();
      if (npModal && npModal.style.display === 'flex') closeNewPracticeModal();
    }
    if (e.key === 'Enter') {
      if (ubModal && ubModal.style.display === 'flex') confirmUBChange();
      else if (npModal && npModal.style.display === 'flex') {
        // Solo confirmar si el foco no está en el input de descripción multiline
        confirmNewPractice();
      }
    }
  });
}

// ── INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Fecha de generado
  const hg = document.getElementById('header-generado');
  if (hg) hg.textContent = new Date().toLocaleDateString('es-AR');

  _bindUploadZone();
  _bindButtons();
  setFilter(_filter);

  // 1) Migrar datos viejos de localStorage si existen
  try { await migrateLegacyLocalStorage(); } catch(e) { console.warn('migración:', e); }

  // 2) Cargar todas las sesiones desde IndexedDB (puede tener 50MB+)
  try {
    const saved = await loadAllSessionsFromStorage();
    if (saved && saved.length) {
      SESSIONS.push(...saved.filter(s => s && s.id && s.pracMap));
      console.log('Sesiones cargadas desde IndexedDB:', SESSIONS.length);
    }
  } catch(e) {
    console.warn('No se pudieron cargar sesiones:', e);
  }

  // 3) Primer render con los datos persistidos
  renderAll();
});
