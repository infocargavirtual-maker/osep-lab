// ── js/kpis.js ────────────────────────────────────────
// Actualiza las tarjetas KPI + banner UB + barra de progreso.

function _set(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function updateProgressBar(ubTotal) {
  const pct      = Math.min((ubTotal / UB_META_MENSUAL) * 100, 100);
  const barColor = pct < 50 ? G : pct < 80 ? O : R;
  const el       = document.getElementById('ub-progress-fill');
  const elPct    = document.getElementById('ub-progress-pct');
  const elVal    = document.getElementById('ub-progress-val');
  const elRest   = document.getElementById('ub-progress-rest');

  if (el)     { el.style.width = pct + '%'; el.style.background = `linear-gradient(90deg,${barColor},${barColor}88)`; }
  if (elPct)  elPct.textContent  = pct.toFixed(1) + '%';
  if (elVal)  elVal.textContent  = fN(Math.round(ubTotal)) + ' UB consumidas';
  if (elRest) elRest.textContent = fN(Math.round(Math.max(UB_META_MENSUAL - ubTotal, 0))) + ' UB restantes para la meta';
}

function updateKPIs(s) {
  // ── Parte 1: KPIs globales ────────────────────────
  _set('kpi-total-prac', fN(s.totalPrac));
  _set('kpi-monto-osep', '$' + fN(Math.round(s.totalOsep / 1e5) / 10) + 'M');
  _set('kpi-monto-afil', '$' + fN(Math.round(s.totalAfil / 1e5) / 10) + 'M');
  _set('kpi-afiliados',  fN(s.totalAfiliados || 0));
  _set('kpi-tipos',      fN(s.tiposPrac || 283));
  _set('kpi-total-ub',   fN(Math.round(s.totalUB * 10) / 10).replace('.', ','));
  _set('kpi-ub-prac',    s.totalPrac > 0 ? (s.totalUB / s.totalPrac).toFixed(1).replace('.', ',') : '0');
  _set('kpi-osep-ub',    s.osepConUB > 0 && s.totalUB > 0 ? '$' + Math.round(s.osepConUB / s.totalUB) : '—');
  _set('kpi-ub-dia',     fK(Math.round(s.totalUB / s.diasPeriodo)));
  if (s.totalAfiliados > 0) _set('kpi-ub-afil', '~' + Math.round(s.totalUB / s.totalAfiliados));

  if (s.periodo)       _set('kpi-periodo', s.periodo);
  if (s.periodo)       _set('header-periodo', 'Período: ' + s.periodo + ' · ' + s.diasPeriodo + ' día' + (s.diasPeriodo!==1?'s':''));

  // Cobertura UB
  const cob = s.totalPrac > 0 ? (s.pracConUB / s.totalPrac * 100).toFixed(1).replace('.', ',') : '0';
  _set('kpi-cobertura', `${fN(s.tiposConUB || 140)} tipos de práctica con UB asignada · Cobertura: ${fN(s.pracConUB)} de ${fN(s.totalPrac)} prácticas (${cob}%)`);

  // ── Parte 2: SIN UB ───────────────────────────────
  const pctSin = s.totalPrac > 0 ? (s.pracSinUB / s.totalPrac * 100).toFixed(1).replace('.', ',') : '0';
  const pctSinM = s.totalOsep > 0 ? (s.osepSinUB / s.totalOsep * 100).toFixed(1).replace('.', ',') : '0';
  _set('kpi-sinub-prac',     fN(s.pracSinUB));
  _set('kpi-sinub-pct',      pctSin + '%');
  _set('kpi-sinub-monto',    '$' + fN(Math.round(s.osepSinUB / 1e5) / 10) + 'M');
  _set('kpi-sinub-monto-d',  '$' + fN(s.osepSinUB) + ' · ' + pctSinM + '% del total');
  _set('kpi-sinub-tipos',    fN(s.tiposSinUB || 166));
  // Afiliados con prácticas sin UB
  if (s.afil) {
    // No tenemos el número exacto sin recorrer las sesiones — se queda el fallback de la base
  }

  // ── Parte 3: CON UB ───────────────────────────────
  const pctCon  = s.totalPrac > 0 ? (s.pracConUB / s.totalPrac * 100).toFixed(1).replace('.', ',') : '0';
  const pctConM = s.totalOsep > 0 ? (s.osepConUB / s.totalOsep * 100).toFixed(1).replace('.', ',') : '0';
  _set('kpi-conub-prac',    fN(s.pracConUB));
  _set('kpi-conub-pct',     pctCon + '%');
  _set('kpi-conub-monto',   '$' + fN(Math.round(s.osepConUB / 1e5) / 10) + 'M');
  _set('kpi-conub-monto-d', '$' + fN(s.osepConUB) + ' · ' + pctConM + '% del total');
  if (s.afilConUBcount) _set('kpi-conub-afil', fN(s.afilConUBcount));
  _set('kpi-conub-ub',      fN(Math.round(s.totalUB * 10) / 10).replace('.', ','));

  updateProgressBar(s.totalUB);
}
