// ── js/helpers.js ─────────────────────────────────────
// Formatters + paleta de colores para charts.
// Únicas funciones fmt* del proyecto — no redeclarar en otros módulos.

const COLOR = {
  accent:  '#00c8ff',  // cyan OSEP
  accent2: '#00ffc8',  // verde UB / Biofarma
  danger:  '#f43f5e',  // rojo sin UB
  warn:    '#fb923c',  // naranja
  muted:   '#7a98bc',
};
const B = COLOR.accent, G = COLOR.accent2, R = COLOR.danger, O = COLOR.warn;

// Número con separador miles AR
function fN(v){ return Number(v||0).toLocaleString('es-AR'); }

// Monto en formato compacto $X.XM / $Xk
// Espera valor en MILLONES si v<1000 ó en pesos si v>1000
function fM(v){
  v = Number(v||0);
  if (v >= 1) return '$' + v.toFixed(1) + 'M';
  if (v >  0) return '$' + Math.round(v*1000) + 'k';
  return '$0';
}

// Monto en pesos -> formato compacto
function fMpesos(v){
  v = Number(v||0);
  if (v >= 1e6) return '$' + (v/1e6).toFixed(1) + 'M';
  if (v >= 1e3) return '$' + (v/1e3).toFixed(0) + 'k';
  return '$' + Math.round(v);
}

// Compactar miles
function fK(v){
  v = Number(v||0);
  return v >= 1000 ? (v/1000).toFixed(1) + 'k' : String(v);
}

// Truncar texto largo para labels de chart
function trunc(s, n){
  s = String(s||'');
  return s.length > n ? s.slice(0, n-1) + '…' : s;
}
