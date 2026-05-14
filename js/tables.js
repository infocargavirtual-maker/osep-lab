// ── js/tables.js ──────────────────────────────────────
// Tablas top de cada parte + tabla buscadora completa.
//
// FIX bug #4 (HANDOFF): los botones SACAR/AGREGAR usan addEventListener con
//   data-* attributes en vez de onclick inline (que se rompía por las comillas
//   dentro de descripciones como "ANTI- 'CORE'").

let _filter = 'all';
let _sortCol = 3;
let _sortDir = -1;

// ── Tablas top de cada parte (Parte 1/2/3) ─────────────
function buildTables(s) {
  const fill = (id, rows, maxF) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    const mx = Math.max(...rows.map(r => maxF(r)), 1);

    rows.forEach((r, i) => {
      const pct = (maxF(r) / mx * 100).toFixed(0);
      const tr  = document.createElement('tr');

      if (id === 't_global') {
        tr.innerHTML = `
          <td><span class="rk ${i<3?'t':''}">${i+1}</span></td>
          <td class="cod">${r.c}</td><td class="cod">${r.a}</td>
          <td>${r.p}${r.uu===0?' <span style="font-size:9px;color:var(--danger);font-family:monospace">[SIN UB]</span>':''}</td>
          <td class="r">${fN(r.n)}</td>
          <td class="r" style="color:${r.uu>0?'var(--accent2)':'var(--danger)'}">${r.uu>0?r.uu:'—'}</td>
          <td class="r" style="color:var(--accent2)">${r.ut>0?fN(r.ut):'—'}</td>
          <td class="r" style="color:var(--accent)">${fMpesos(r.osep)}</td>`;
      } else if (id === 't_sinub') {
        tr.innerHTML = `
          <td><span class="rk ${i<3?'t':''}">${i+1}</span></td>
          <td class="cod">${r.c}</td><td class="cod">${r.a}</td><td>${r.p}</td>
          <td class="r">${fN(r.n)}</td>
          <td class="r" style="color:var(--danger)">${fMpesos(r.osep)}</td>
          <td>
            <span class="bb"><span class="bf" style="width:${pct}%;background:linear-gradient(90deg,var(--danger),var(--warn))"></span></span>
            <span style="font-size:10px;color:var(--text-muted)">${pct}%</span>
          </td>`;
      } else {
        tr.innerHTML = `
          <td><span class="rk ${i<3?'t':''}">${i+1}</span></td>
          <td class="cod">${r.c}</td><td class="cod">${r.a}</td><td>${r.p}</td>
          <td class="r">${fN(r.n)}</td>
          <td class="r" style="color:var(--accent2)">${r.uu}</td>
          <td class="r" style="color:var(--accent2);font-weight:600">${fN(r.ut)}</td>
          <td class="r" style="color:var(--accent)">${fMpesos(r.osep)}</td>
          <td>
            <span class="bb"><span class="bf" style="width:${pct}%;background:linear-gradient(90deg,var(--accent2),var(--accent))"></span></span>
            <span style="font-size:10px;color:var(--text-muted)">${pct}%</span>
          </td>`;
      }
      el.appendChild(tr);
    });
  };

  fill('t_global', s.topGlobal, r => r.n);
  fill('t_sinub',  s.topSinUB,  r => r.n);
  fill('t_conub',  s.topConUB,  r => r.ut);
}

// ── Tabla buscadora ──────────────────────────────────
function renderTable() {
  const q   = (document.getElementById('srch')    || {value:''}).value.trim().toLowerCase();
  const cod = (document.getElementById('srchCod') || {value:''}).value.trim();

  let rows = (ALL_PRAC || []).filter(r => {
    const matchN = !q   || r[2].toLowerCase().includes(q);
    const matchC = !cod || String(r[0]).includes(cod);
    const matchF = _filter === 'all' || (_filter === 'conub' && r[4] > 0) || (_filter === 'sinub' && r[4] === 0);
    return matchN && matchC && matchF;
  });

  rows.sort((a, b) => {
    const av = a[[0,1,2,3,4,5,6][_sortCol]];
    const bv = b[[0,1,2,3,4,5,6][_sortCol]];
    return typeof av === 'string' ? _sortDir * av.localeCompare(bv, 'es') : _sortDir * (av - bv);
  });

  const cnt = document.getElementById('srchCount');
  if (cnt) cnt.textContent = rows.length + ' práctica' + (rows.length !== 1 ? 's' : '');

  // Render usando DOM nodes — los botones se enganchan al final con dataset
  const body = document.getElementById('tblBody');
  if (!body) return;
  body.innerHTML = '';

  if (rows.length === 0) {
    body.innerHTML = '<div style="padding:24px;text-align:center;color:#4a6080;font-family:monospace;font-size:12px">Sin resultados</div>';
  } else {
    const frag = document.createDocumentFragment();
    rows.forEach((r, i) => {
      const bg     = i % 2 === 0 ? '#111827' : '#131e31';
      const hasUB  = r[4] > 0;
      const key    = r[0] + '_' + r[1];
      const hasPending   = PENDING_CHANGES.some(p => p.key === key);
      const isOverridden = key in MANUAL_UB_OVERRIDES;

      const btnLabel = hasPending ? '↩ DESHACER' : hasUB ? 'SACAR' : 'AGREGAR';
      const btnColor = hasPending ? '#facc15'    : hasUB ? '#f43f5e' : '#00ffc8';
      const btnBg    = hasPending ? 'rgba(250,204,21,.15)' : hasUB ? 'rgba(244,63,94,.12)' : 'rgba(0,255,200,.12)';

      const row = document.createElement('div');
      row.className = 'pr-row';
      row.style.background = bg;
      row.innerHTML = `
        <div class="pr-cell" style="color:#7a98bc">${r[0]}</div>
        <div class="pr-cell" style="color:#4a6080">${r[1]}</div>
        <div class="pr-cell">
          <span class="pr-badge ${hasUB?'con':'sin'}">${hasUB?'CON UB':'SIN UB'}</span>
          ${isOverridden?'<span style="font-size:8px;color:#facc15;display:block;font-family:monospace">✎MOD</span>':''}
        </div>
        <div class="pr-cell l"></div>
        <div class="pr-cell">${fN(r[3])}</div>
        <div class="pr-cell" style="color:${hasUB?'#00ffc8':'#4a6080'};font-weight:${hasUB?'600':'400'}">${hasUB?r[4]:'—'}</div>
        <div class="pr-cell" style="color:${hasUB?'#00ffc8':'#4a6080'}">${hasUB?fN(r[5]):'—'}</div>
        <div class="pr-cell" style="color:#00c8ff">${fM(r[6])}</div>
        <div class="pr-cell c"></div>`;
      // Inyectar descripción como textContent (evita interpretar HTML/comillas en r[2])
      row.children[3].textContent = r[2];

      // Botón con event listener — FIX bug #4
      const btn = document.createElement('button');
      btn.className = 'pr-btn';
      btn.textContent = btnLabel;
      btn.style.color = btnColor;
      btn.style.background = btnBg;
      btn.style.borderColor = btnColor;
      btn.dataset.cod   = r[0];
      btn.dataset.analo = r[1];
      btn.dataset.name  = r[2];
      btn.dataset.ub    = r[4];
      btn.addEventListener('click', () => proposeUBChange(r[0], r[1], r[2], r[4]));
      row.children[8].appendChild(btn);

      frag.appendChild(row);
    });
    body.appendChild(frag);
  }

  // Totales filtrados
  const totCant = rows.reduce((s,r) => s + r[3], 0);
  const totUB   = rows.reduce((s,r) => s + r[5], 0);
  const totOsep = rows.reduce((s,r) => s + r[6], 0);

  const tl = document.getElementById('tot-label');
  const tc = document.getElementById('tot-cant');
  const tu = document.getElementById('tot-ub');
  const to = document.getElementById('tot-osep');
  if (tl) tl.textContent = rows.length + ' práctica' + (rows.length !== 1 ? 's' : '') + ' · totales filtrado';
  if (tc) tc.textContent = fN(totCant);
  if (tu) tu.textContent = totUB > 0 ? fN(Math.round(totUB)) + ' UB' : '—';
  if (to) to.textContent = fM(totOsep);
}

function setFilter(f) {
  _filter = f;
  ['fAll','fConUB','fSinUB'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = '#1e3a5f';
    el.style.background  = id === 'fConUB' ? 'rgba(0,255,200,.06)' : id === 'fSinUB' ? 'rgba(244,63,94,.06)' : 'rgba(0,200,255,.06)';
  });
  const map = {all:'fAll', conub:'fConUB', sinub:'fSinUB'};
  const el = document.getElementById(map[f]);
  if (!el) return;
  if (f === 'all')        { el.style.borderColor = B; el.style.background = 'rgba(0,200,255,.2)'; }
  else if (f === 'conub') { el.style.borderColor = G; el.style.background = 'rgba(0,255,200,.2)'; }
  else                    { el.style.borderColor = R; el.style.background = 'rgba(244,63,94,.2)'; }
  renderTable();
}

function sortTable(col) {
  if (_sortCol === col) _sortDir *= -1;
  else { _sortCol = col; _sortDir = col === 2 ? 1 : -1; }
  renderTable();
}

// ── Toggle convenio Biofarma ─────────────────────────
function proposeUBChange(cod, analo, name, currentUB) {
  const key = cod + '_' + analo;
  // Si ya está pendiente, deshacer
  const idx = PENDING_CHANGES.findIndex(p => p.key === key);
  if (idx >= 0) {
    PENDING_CHANGES.splice(idx, 1);
    renderPendingPanel();
    renderTable();
    return;
  }

  if (currentUB > 0) {
    // SACAR del convenio — UB = 0, sin modal
    PENDING_CHANGES.push({key, name, cod, analo, oldUB:currentUB, newUB:0, action:'SACAR del convenio Biofarma'});
    renderPendingPanel();
    renderTable();
  } else {
    // AGREGAR al convenio — pedir UB
    _modalTarget = {cod, analo, name, key};
    document.getElementById('modal-prac-name').textContent = name;
    document.getElementById('modal-prac-cod').textContent  = 'Código: ' + cod + ' · Análogo: ' + analo;
    document.getElementById('modal-ub-input').value = '';
    const modal = document.getElementById('ub-modal');
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('modal-ub-input').focus(), 100);
  }
}

function closeModal() {
  document.getElementById('ub-modal').style.display = 'none';
  _modalTarget = null;
}

function confirmAddToConvenio() {
  const t = _modalTarget;
  if (!t) return;
  const val = parseFloat(document.getElementById('modal-ub-input').value);
  if (!val || val <= 0) {
    alert('Ingresá un valor de UB válido (mayor a 0).');
    return;
  }
  PENDING_CHANGES.push({
    key:t.key, name:t.name, cod:t.cod, analo:t.analo,
    oldUB:0, newUB:val, action:'AGREGAR al convenio Biofarma (' + val + ' UB)',
  });
  closeModal();
  renderPendingPanel();
  renderTable();
}

// ── Panel pendientes ─────────────────────────────────
function renderPendingPanel() {
  const panel = document.getElementById('pending-panel');
  if (!panel) return;
  if (PENDING_CHANGES.length === 0) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }
  panel.style.display = 'block';

  // Encabezado + botones
  panel.innerHTML = `
    <div style="background:#0d1f3c;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#facc15;letter-spacing:1px">
        ⚠️ ${PENDING_CHANGES.length} CAMBIO${PENDING_CHANGES.length>1?'S':''} PENDIENTE${PENDING_CHANGES.length>1?'S':''} — revisá antes de aplicar
      </div>
      <div style="display:flex;gap:8px">
        <button id="btn-cancel-changes" style="padding:6px 14px;background:none;border:1px solid #4a6080;border-radius:2px;color:#7a98bc;font-family:'IBM Plex Mono',monospace;font-size:10px;cursor:pointer">CANCELAR TODO</button>
        <button id="btn-apply-changes"  style="padding:6px 18px;background:linear-gradient(90deg,#00ffc8,#00c8ff);border:none;border-radius:2px;color:#0a0f1e;font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:700;cursor:pointer">✓ APLICAR CAMBIOS</button>
      </div>
    </div>`;

  // Items
  PENDING_CHANGES.forEach((p, i) => {
    const item = document.createElement('div');
    item.style.cssText = `display:flex;align-items:center;gap:12px;padding:8px 12px;background:${i%2===0?'#111827':'#131e31'};border-left:3px solid ${p.oldUB>0?R:G}`;
    item.innerHTML = `
      <div style="flex:1">
        <div class="pname" style="font-size:12px;color:var(--text)"></div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:${p.oldUB>0?'#f43f5e':'#00ffc8'};margin-top:2px">
          Cód.${p.cod} · ${p.action}
        </div>
      </div>
      <button class="btn-rm-pending" style="background:none;border:none;color:#4a6080;cursor:pointer;font-size:14px;padding:0 4px">✕</button>`;
    item.querySelector('.pname').textContent = p.name;
    item.querySelector('.btn-rm-pending').addEventListener('click', () => {
      PENDING_CHANGES.splice(i, 1);
      renderPendingPanel();
      renderTable();
    });
    panel.appendChild(item);
  });

  // Engachar header buttons
  const ba = document.getElementById('btn-apply-changes');
  const bc = document.getElementById('btn-cancel-changes');
  if (ba) ba.addEventListener('click', applyChanges);
  if (bc) bc.addEventListener('click', cancelChanges);
}

function applyChanges() {
  PENDING_CHANGES.forEach(p => {
    if (p.newUB === 0)      MANUAL_UB_OVERRIDES[p.key] = 0;
    else if (p.newUB > 0)   MANUAL_UB_OVERRIDES[p.key] = p.newUB;
  });
  PENDING_CHANGES = [];
  saveOverrides();
  renderPendingPanel();
  renderAll();
}

function cancelChanges() {
  PENDING_CHANGES = [];
  renderPendingPanel();
  renderTable();
}

// ── Panel sesiones ───────────────────────────────────
function renderSessionsPanel() {
  const panel = document.getElementById('sessions-panel');
  const list  = document.getElementById('sessions-list');
  if (!panel || !list) return;
  if (SESSIONS.length === 0) {
    panel.style.display = 'none';
    list.innerHTML = '';
    return;
  }
  panel.style.display = 'block';
  list.innerHTML = '';

  SESSIONS.forEach((s, i) => {
    const item = document.createElement('div');
    item.style.cssText = `display:flex;align-items:center;gap:12px;padding:8px 14px;background:${i%2===0?'#111827':'#131e31'};border-left:3px solid ${B}`;
    item.innerHTML = `
      <div style="flex:1;min-width:0">
        <div class="fn" style="font-size:12px;color:var(--text);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:#7a98bc;margin-top:2px">
          Período: ${s.periodo} · ${fN(s.totalPrac)} prácticas · Subido: ${s.uploadedAt}
        </div>
      </div>
      <button class="btn-rm-sess" style="flex-shrink:0;padding:4px 10px;background:rgba(244,63,94,.12);border:1px solid rgba(244,63,94,.4);border-radius:2px;color:#f43f5e;font-family:'IBM Plex Mono',monospace;font-size:9px;cursor:pointer;letter-spacing:.5px">✕ QUITAR</button>`;
    item.querySelector('.fn').textContent = s.filename;
    item.querySelector('.btn-rm-sess').addEventListener('click', () => removeSession(s.id));
    list.appendChild(item);
  });
}
