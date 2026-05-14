// ── js/charts.js ──────────────────────────────────────
// Construye TODOS los gráficos Chart.js. Destruye los anteriores para no leakear.

let _charts = {};

function _hBar(canvasId, labels, data, color, fmtTooltip) {
  return new Chart(document.getElementById(canvasId), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: data.map((_, i) => i < 3 ? color : color + '59'),
        borderColor: color,
        borderWidth: 1,
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {display: false},
        tooltip: {callbacks: {label: c => ' ' + fmtTooltip(c.raw)}},
      },
      scales: {
        x: {grid: {color: 'rgba(30,58,95,.5)'}, ticks: {callback: fK}},
        y: {grid: {display: false}, ticks: {font: {size: 10}}},
      },
    },
  });
}

function _vBar(canvasId, labels, data, color, fmtTooltip, tickFmt) {
  return new Chart(document.getElementById(canvasId), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: data.map((_, i) => i < 3 ? color : color + '59'),
        borderColor: color,
        borderWidth: 1,
        borderRadius: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {display: false},
        tooltip: {callbacks: {label: c => ' ' + fmtTooltip(c.raw)}},
      },
      scales: {
        x: {grid: {display: false}, ticks: {maxRotation: 35, font: {size: 10}}},
        y: {grid: {color: 'rgba(30,58,95,.5)'}, ticks: {callback: tickFmt || fK}},
      },
    },
  });
}

function buildAllCharts(s) {
  // Defaults globales
  Chart.defaults.color       = '#7a98bc';
  Chart.defaults.font.family = "'IBM Plex Mono', monospace";
  Chart.defaults.font.size   = 11;

  // Destruir gráficos anteriores
  Object.values(_charts).forEach(c => { try { c.destroy(); } catch(e){} });
  _charts = {};

  // ── PARTE 1 ────────────────────────────────────────
  _charts.dom = _hBar(
    'c_dom',
    s.dom.map(d => d.d),
    s.dom.map(d => d.prac),
    B,
    v => fN(v) + ' prac.'
  );

  _charts.torta = new Chart(document.getElementById('c_torta'), {
    type: 'doughnut',
    data: {
      labels: ['A cargo OSEP', 'Coseguro Afiliado'],
      datasets: [{
        data: [s.totalOsep, s.totalAfil],
        backgroundColor: [B, 'rgba(0,255,200,.7)'],
        borderColor: '#0a0f1e',
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {position: 'bottom', labels: {padding: 14, boxWidth: 12}},
        tooltip: {callbacks: {label: c => ' ' + fMpesos(c.raw) + ' (' + (c.raw/(s.totalOsep+s.totalAfil)*100).toFixed(1) + '%)'}},
      },
    },
  });

  // ── PARTE 2: SIN UB ────────────────────────────────
  _charts.sCant = _hBar(
    'c_s_cant',
    s.topSinUB.slice(0, 12).map(r => trunc(r.p, 32)),
    s.topSinUB.slice(0, 12).map(r => r.n),
    R,
    v => fN(v) + ' prac.'
  );

  const sm = [...s.topSinUB].sort((a,b) => b.osep - a.osep).slice(0, 10);
  _charts.sMonto = _hBar(
    'c_s_monto',
    sm.map(r => trunc(r.p, 32)),
    sm.map(r => r.osep),
    O,
    v => fMpesos(v)
  );

  // ── PARTE 3: CON UB ────────────────────────────────
  _charts.cCant = _hBar(
    'c_c_cant',
    s.topConUB.slice(0, 12).map(r => trunc(r.p, 32)),
    s.topConUB.slice(0, 12).map(r => r.n),
    G,
    v => fN(v) + ' prac.'
  );

  const stu = [...s.topConUB].sort((a,b) => b.ut - a.ut).slice(0, 12);
  _charts.cUB = _hBar(
    'c_c_ub',
    stu.map(r => trunc(r.p, 32)),
    stu.map(r => r.ut),
    G,
    v => fN(v) + ' UB'
  );

  // ── PARTE 3: Afiliados top 8 ───────────────────────
  if (s.afil && s.afil.length > 0) {
    _charts.afilM = _vBar(
      'c_afil_m',
      s.afil.map(a => (a.n || a.id).split(' ').slice(0, 2).join(' ')),
      s.afil.map(a => a.osep),
      G,
      v => fMpesos(v),
      fMpesos
    );

    const aSort = [...s.afil].sort((a,b) => (b.ub||0) - (a.ub||0));
    _charts.afilUB = _vBar(
      'c_afil_ub',
      aSort.map(a => (a.n || a.id).split(' ').slice(0, 2).join(' ')),
      aSort.map(a => a.ub || 0),
      B,
      v => fN(v) + ' UB'
    );
  } else {
    // Limpiar canvas si no hay datos
    ['c_afil_m', 'c_afil_ub'].forEach(id => {
      const c = document.getElementById(id);
      if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
    });
  }

  // ── PARTE 3: Evolución diaria ─────────────────────
  _charts.daily = new Chart(document.getElementById('c_daily'), {
    type: 'line',
    data: {
      labels: s.daily.map(d => d.d),
      datasets: [
        {
          label: 'UB consumidas',
          data: s.daily.map(d => d.ub),
          borderColor: G,
          backgroundColor: 'rgba(0,255,200,.07)',
          borderWidth: 2.5,
          borderDash: [10, 5],
          pointBackgroundColor: s.daily.map(d => d.ub > 50000 ? G : 'rgba(0,255,200,.5)'),
          pointBorderColor: G,
          pointRadius: s.daily.map(d => d.ub > 50000 ? 8 : 4),
          pointHoverRadius: 10,
          tension: 0.3,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Prácticas / día',
          data: s.daily.map(d => d.prac),
          borderColor: 'rgba(0,200,255,.55)',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointBackgroundColor: 'rgba(0,200,255,.6)',
          pointRadius: 3,
          tension: 0.3,
          yAxisID: 'y2',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {mode: 'index', intersect: false},
      plugins: {
        legend: {display: true, position: 'top', align: 'end', labels: {boxWidth: 18, padding: 14}},
        tooltip: {callbacks: {label: c => c.datasetIndex === 0 ? ' ' + fN(c.raw) + ' UB' : ' ' + fN(c.raw) + ' prác.'}},
      },
      scales: {
        x:  {grid: {color: 'rgba(30,58,95,.4)'}, ticks: {font: {size: 10}}},
        y:  {position: 'left',  grid: {color: 'rgba(30,58,95,.4)'}, ticks: {color: G, callback: v => fK(v) + ' UB'},  title: {display: true, text: 'UB consumidas', color: G, font: {size: 10}}},
        y2: {position: 'right', grid: {display: false},               ticks: {color: B, callback: v => fK(v) + ' prac.'}, title: {display: true, text: 'Prácticas',     color: B, font: {size: 10}}},
      },
    },
  });
}
