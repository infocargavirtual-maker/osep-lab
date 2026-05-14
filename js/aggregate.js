// ── js/aggregate.js ───────────────────────────────────
// Combina todas las sesiones en un único STATE consumible por charts/tablas.
// También arma window.ALL_PRAC para el buscador.

function aggregateAll() {
  const merged   = {};
  const domMap   = {};
  const dailyMap = {};
  const afilGlob = {};
  const afilSet  = new Set();
  let totalOsep = 0, totalAfil = 0;

  SESSIONS.forEach(sess => {
    // Por práctica (recalcula UB con override actual)
    Object.entries(sess.pracMap).forEach(([key, r]) => {
      const ub_u = getUB(r.c, r.a);
      const ub_t = ub_u * r.n;
      if (!merged[key]) merged[key] = {c:r.c, a:r.a, p:r.p, n:0, uu:ub_u, ut:0, osep:0};
      merged[key].n    += r.n;
      merged[key].uu    = ub_u;
      merged[key].ut   += ub_t;
      merged[key].osep += r.osep;
    });

    // Por efector
    Object.entries(sess.domMap || {}).forEach(([d, v]) => {
      if (!domMap[d]) domMap[d] = {prac:0, osep:0};
      domMap[d].prac += v.prac;
      domMap[d].osep += v.osep;
    });

    // Por día (prac y osep)
    Object.entries(sess.dailyMap || {}).forEach(([d, v]) => {
      if (!dailyMap[d]) dailyMap[d] = {d, ub:0, prac:0, osep:0};
      dailyMap[d].prac += v.prac;
      dailyMap[d].osep += v.osep;
    });

    // FIX bug #2: UB por día desde pracDailyMap × UB actual
    Object.entries(sess.pracDailyMap || {}).forEach(([dk, count]) => {
      const parts = dk.split('|');
      if (parts.length < 2) return;
      const d = parts[0], pkey = parts[1];
      const r = sess.pracMap[pkey];
      if (!r || !d) return;
      if (!dailyMap[d]) dailyMap[d] = {d, ub:0, prac:0, osep:0};
      dailyMap[d].ub += getUB(r.c, r.a) * count;
    });

    // FIX bug #1: afiliados — sumar de afilMap de cada sesión y RECALCULAR ub con override
    Object.entries(sess.afilMap || {}).forEach(([id, a]) => {
      if (!afilGlob[id]) afilGlob[id] = {id, n:a.n||id, osep:0, ub:0, prac:0};
      afilGlob[id].osep += a.osep || 0;
      afilGlob[id].prac += a.prac || 0;
      // ub guardado en sesión usa UB_MAP del momento — para sesiones viejas vale como aprox.
      afilGlob[id].ub   += a.ub   || 0;
      if (!afilGlob[id].n && a.n) afilGlob[id].n = a.n;
    });

    totalOsep += sess.totalOsep || 0;
    totalAfil += sess.totalAfil || 0;
    (sess.afilIds || []).forEach(id => afilSet.add(id));
  });

  // Listas ordenadas
  const allPrac = Object.values(merged).sort((a,b) => b.n - a.n);
  const totalPrac = allPrac.reduce((s,r) => s + r.n, 0);
  const totalUB   = allPrac.reduce((s,r) => s + r.ut, 0);
  const conUB     = allPrac.filter(r => r.uu > 0);
  const sinUB     = allPrac.filter(r => r.uu === 0);
  const pracConUB = conUB.reduce((s,r) => s + r.n, 0);
  const osepConUB = conUB.reduce((s,r) => s + r.osep, 0);
  const afilConUB = new Set();
  SESSIONS.forEach(sess => {
    Object.entries(sess.afilMap || {}).forEach(([id, a]) => {
      if ((a.ub || 0) > 0) afilConUB.add(id);
    });
  });

  const domArr = Object.entries(domMap)
    .map(([d,v]) => ({d, prac:v.prac, osep:v.osep}))
    .sort((a,b) => b.prac - a.prac)
    .slice(0, 12);

  const dailyArr = Object.values(dailyMap).sort((a,b) => {
    // Comparar como DD/MM (mismo año) — ordena correctamente dentro del mes
    const [da, ma] = a.d.split('/').map(Number);
    const [db, mb] = b.d.split('/').map(Number);
    return (ma - mb) || (da - db);
  });

  // Top 8 afiliados — los más caros por OSEP, y los que más UB consumen
  const afilArr = Object.values(afilGlob)
    .filter(a => a.osep > 0)
    .sort((a,b) => b.osep - a.osep)
    .slice(0, 8);

  const fechas  = dailyArr.map(d => d.d);
  const periodo = fechas.length > 1 ? fechas[0] + ' al ' + fechas[fechas.length-1] : (fechas[0] || '—');
  const dias    = Math.max(dailyArr.length, 1);

  // Para el buscador: tabla [cod, analo, nombre, cant, ub_unit, ub_total, osep_M]
  // osep guardado en millones (para que fM funcione directo)
  ALL_PRAC = allPrac.map(r => [
    r.c, r.a, r.p, Math.round(r.n), r.uu,
    Math.round(r.ut * 10) / 10,
    Math.round(r.osep / 1e4) / 100,
  ]);

  return {
    periodo, diasPeriodo: dias,
    totalPrac: Math.round(totalPrac),
    totalOsep: Math.round(totalOsep),
    totalAfil: Math.round(totalAfil),
    totalAfiliados: afilSet.size,
    totalUB:   Math.round(totalUB * 10) / 10,
    pracConUB: Math.round(pracConUB),
    pracSinUB: Math.round(totalPrac - pracConUB),
    osepConUB: Math.round(osepConUB),
    osepSinUB: Math.round(totalOsep - osepConUB),
    afilConUBcount: afilConUB.size,
    tiposPrac: allPrac.length,
    tiposConUB: conUB.length,
    tiposSinUB: sinUB.length,
    dom: domArr,
    topGlobal: allPrac.slice(0, 15),
    topConUB:  conUB.sort((a,b) => b.n - a.n).slice(0, 15),
    topSinUB:  sinUB.sort((a,b) => b.n - a.n).slice(0, 15),
    afil:      afilArr,
    daily:     dailyArr,
  };
}

// Orquestador: recalcula todo y vuelve a pintar
function renderAll() {
  let displayState = BASE_STATE;
  let isBase = true;
  if (SESSIONS.length > 0) {
    try {
      const agg = aggregateAll();
      if (agg && agg.totalPrac > 0) {
        displayState = agg;
        isBase = false;
      }
    } catch(e) { console.error('aggregateAll:', e); }
  }

  // Si estamos en BASE_STATE, restaurar ALL_PRAC al fallback
  if (isBase) ALL_PRAC = BASE_ALL_PRAC.slice();

  try { buildAllCharts(displayState); } catch(e) { console.error('charts:', e); }
  try { buildTables(displayState);    } catch(e) { console.error('tables:', e); }
  try { updateKPIs(displayState);     } catch(e) { console.error('kpis:', e); }

  renderSessionsPanel();
  renderPendingPanel();
  renderTable();
}
