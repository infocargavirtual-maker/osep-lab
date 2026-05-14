// ── js/parser.js ──────────────────────────────────────
// Lee un .xls/.xlsx del SISAO y arma una sesión:
//   { id, filename, uploadedAt, periodo, totalPrac, totalOsep, rows,
//     pracMap:   {key:{c,a,p,n,osep}},     ← por práctica
//     domMap:    {dom:{prac,osep}},        ← por efector
//     dailyMap:  {fecha:{d,prac,osep}},    ← por día
//     pracDailyMap: {'fecha|key':count},   ← cruce práctica × día (para UB diaria)
//     afilMap:   {afilId:{n,osep,ub,prac}},← por afiliado (para gráficos top 8)
//     afilIds:   [string] }
//
// FIX bug #1 (HANDOFF): se calcula afilMap con totales OSEP y UB por afiliado.
// FIX bug #2 (HANDOFF): pracDailyMap permite recalcular UB diaria post-load.

function processFile(file) {
  const label  = document.getElementById('upload-label');
  const status = document.getElementById('upload-status');

  const setMsg = (lbl, lblColor, st, stColor) => {
    if (label)  { label.textContent  = lbl; label.style.color  = lblColor; }
    if (status) { status.textContent = st;  status.style.color = stColor; }
  };

  setMsg('⏳ Procesando: ' + file.name, O, 'Leyendo archivo…', O);

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const wb   = XLSX.read(data, {type:'array', cellDates:false});
      const sheetName = wb.SheetNames.find(n => n.toUpperCase().includes('MENSUAL')) || wb.SheetNames[0];

      const ws   = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});

      // Detectar fila de encabezados — buscamos columna "Año"
      let headerIdx = -1, D = {};
      for (let i = 0; i < Math.min(rows.length, 15); i++) {
        const r = rows[i];
        const anioIdx = r.findIndex(c => /^a[ñn]o$/i.test(String(c).trim()));
        if (anioIdx >= 0) {
          headerIdx = i;
          r.forEach((h, idx) => {
            const hn = String(h).toLowerCase().replace(/[\s\n.]/g, '');
            if (/^a[ñn]o$/.test(hn))                                  D.anio    = idx;
            else if (/^mes$/.test(hn))                                D.mes     = idx;
            else if (/domicilio/.test(hn))                            D.dom     = idx;
            else if (/num.*afil|afil.*num/i.test(hn))                 D.numafil = idx;
            else if (/apellido.*afiliado|afiliado.*nombre/i.test(hn)) D.afilNombre = idx;
            else if (/cod.*pr[aá]ctica/i.test(hn))                    D.cod     = idx;
            else if (/analog[ií]a/i.test(hn))                         D.analo   = idx;
            else if (/^pr[aá]ctica$/.test(hn))                        D.prac    = idx;
            else if (/fecha.*consumo|consumo.*fecha/i.test(hn))       D.fecha   = idx;
            else if (/cant.*prac/i.test(hn))                          D.cant    = idx;
            else if (/monto.*osep.*ori|osep.*ori/i.test(hn))          D.osepOri = idx;
            else if (/monto.*osep|osep/i.test(hn) && !D.osep && !D.osepOri) D.osep = idx;
            else if (/monto.*afil.*ori/i.test(hn))                    D.afilOri = idx;
            else if (/monto.*a\/c.*afil|monto.*afil/i.test(hn) && !D.afil_m && !D.afilOri) D.afil_m = idx;
          });
          break;
        }
      }
      if (headerIdx < 0) throw new Error('No se encontró fila de encabezados (columna "Año").');

      // Fallback a estructura SISAO estándar si faltaron mapeos
      D = {anio:2, mes:3, dom:4, numafil:8, afilNombre:10, cod:16, analo:17, prac:18, fecha:19, cant:21, osep:22, afil_m:23, ...D};

      const dataRows = rows.slice(headerIdx + 1).filter(r => {
        const v = r[D.anio];
        return /^20\d{2}$/.test(String(v).trim()) || (typeof v === 'number' && v >= 2020 && v <= 2035);
      });
      if (dataRows.length === 0) {
        throw new Error('Sin filas de datos en hoja "' + sheetName + '" (header fila ' + (headerIdx + 1) + ').');
      }

      // Anti-duplicado por filename
      const isDuplicate = SESSIONS.some(s => s.filename === file.name);
      if (isDuplicate) {
        const ok = confirm('⚠️ Ya existe un archivo "' + file.name + '".\n¿Cargarlo igual? (podría duplicar datos)');
        if (!ok) {
          setMsg('AGREGAR ARCHIVO SISAO (.xls / .xlsx)', B, 'Carga cancelada.', '#4a6080');
          return;
        }
      }

      // Acumuladores
      const pracMap     = {};
      const domMap      = {};
      const dailyMap    = {};
      const pracDailyMap= {};
      const afilMap     = {};   // ← FIX bug #1: totales por afiliado
      const afilIds     = new Set();
      let totalOsep = 0, totalAfil = 0;

      dataRows.forEach(r => {
        const cant  = parseFloat(r[D.cant])   || 0;
        const osep  = parseFloat(r[D.osep])   || 0;
        const afilM = parseFloat(r[D.afil_m]) || 0;
        const cod   = parseInt(r[D.cod])   || 0;
        const analo = parseInt(r[D.analo]) || 0;
        const dom   = String(r[D.dom]||'').replace(/^OSEP\s*/, '').trim() || 'Sin efector';
        const afilID   = String(r[D.numafil]   || '').trim();
        const afilName = String(r[D.afilNombre]|| '').trim();
        const prac  = String(r[D.prac] || '').trim();
        const key   = cod + '_' + analo;

        totalOsep += osep;
        totalAfil += afilM;
        if (afilID) afilIds.add(afilID);

        // Por práctica
        if (!pracMap[key]) pracMap[key] = {c:cod, a:analo, p:prac, n:0, osep:0};
        pracMap[key].n    += cant;
        pracMap[key].osep += osep;

        // Por efector
        if (!domMap[dom]) domMap[dom] = {prac:0, osep:0};
        domMap[dom].prac += cant;
        domMap[dom].osep += osep;

        // FIX bug #1: por afiliado — sumamos osep, prac y UB
        if (afilID) {
          if (!afilMap[afilID]) afilMap[afilID] = {id:afilID, n:afilName || afilID, osep:0, ub:0, prac:0};
          afilMap[afilID].osep += osep;
          afilMap[afilID].prac += cant;
          afilMap[afilID].ub   += getUB(cod, analo) * cant;
          if (!afilMap[afilID].n && afilName) afilMap[afilID].n = afilName;
        }

        // Fecha (puede ser serial Excel, Date o string)
        let fechaStr = '';
        const fv = r[D.fecha];
        if (typeof fv === 'number' && fv > 40000) {
          const dd = XLSX.SSF.parse_date_code(fv);
          fechaStr = String(dd.d).padStart(2,'0') + '/' + String(dd.m).padStart(2,'0');
        } else if (fv instanceof Date) {
          fechaStr = String(fv.getDate()).padStart(2,'0') + '/' + String(fv.getMonth()+1).padStart(2,'0');
        } else {
          fechaStr = String(fv||'').slice(5,10).replace('-','/');
        }
        if (fechaStr) {
          if (!dailyMap[fechaStr]) dailyMap[fechaStr] = {d:fechaStr, prac:0, osep:0};
          dailyMap[fechaStr].prac += cant;
          dailyMap[fechaStr].osep += osep;
          const dk = fechaStr + '|' + key;
          pracDailyMap[dk] = (pracDailyMap[dk] || 0) + cant;
        }
      });

      // Período del archivo
      const fechas = Object.keys(dailyMap).sort();
      const periodo = fechas.length > 1
        ? fechas[0] + ' al ' + fechas[fechas.length-1]
        : (fechas[0] || '—');
      const totalPrac = Object.values(pracMap).reduce((s,r) => s + r.n, 0);

      const session = {
        id:        Date.now() + '_' + Math.random().toString(36).slice(2,7),
        filename:  file.name,
        uploadedAt:new Date().toLocaleString('es-AR'),
        periodo,
        totalPrac: Math.round(totalPrac),
        totalOsep: Math.round(totalOsep),
        totalAfil: Math.round(totalAfil),
        rows:      dataRows.length,
        pracMap, domMap, dailyMap, pracDailyMap, afilMap,
        afilIds:   [...afilIds],
      };
      SESSIONS.push(session);
      saveSessions();

      renderAll();

      setMsg(
        '✓ Agregado: ' + file.name, G,
        `${fN(dataRows.length)} registros · ${fN(Math.round(totalPrac))} prácticas · período: ${periodo}`,
        G
      );

    } catch(err) {
      console.error(err);
      setMsg('✗ Error: ' + err.message, R, 'Verificá que sea el archivo SISAO correcto.', R);
    }
  };
  reader.readAsArrayBuffer(file);
}

function removeSession(id) {
  const idx = SESSIONS.findIndex(s => s.id === id);
  if (idx < 0) return;
  const s = SESSIONS[idx];
  if (!confirm('¿Eliminás el archivo "' + s.filename + '" (' + s.periodo + ')?\nSus datos se quitarán del informe.')) return;
  SESSIONS.splice(idx, 1);
  saveSessions();
  renderAll();
}

function clearAllSessions() {
  if (!confirm('¿Eliminás TODOS los archivos cargados? El informe volverá a los datos de base.')) return;
  SESSIONS = [];
  saveSessions();
  renderAll();
}
