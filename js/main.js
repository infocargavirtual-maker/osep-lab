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
  if (mc) mc.addEventListener('click', closeModal);
  if (mk) mk.addEventListener('click', confirmAddToConvenio);

  // Botón imprimir / PDF — FIX bug #5: usa Ctrl+P nativo del browser
  const pdf = document.getElementById('pdfBtn');
  if (pdf) pdf.addEventListener('click', () => window.print());

  // Teclas globales para el modal
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('ub-modal');
    if (!modal) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && modal.style.display === 'flex') confirmAddToConvenio();
  });
}

// ── INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Fecha de generado
  const hg = document.getElementById('header-generado');
  if (hg) hg.textContent = new Date().toLocaleDateString('es-AR');

  _bindUploadZone();
  _bindButtons();

  // Estado activo del filtro
  setFilter(_filter);

  // Render principal
  renderAll();
});
