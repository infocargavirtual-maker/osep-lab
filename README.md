# OSEP — Convenio 2.868 (Laboratorio Bioquímica)

Informe ejecutivo web del consumo de prácticas de laboratorio bajo el Convenio 2.868
con la Red Propia de Efectores. Procesa archivos SISAO (.xls/.xlsx) y muestra
KPIs, gráficos y tablas con detalle por efector, afiliado y día.

## Cómo correrlo

Es un sitio 100% estático. Abrí `index.html` desde cualquier servidor:

```bash
python -m http.server 8765
# http://127.0.0.1:8765
```

## Estructura

- `index.html` — shell HTML
- `css/style.css` — tema oscuro navy/teal
- `js/data.js` — UB_MAP (nomenclador Biofarma) + BASE_STATE + BASE_ALL_PRAC
- `js/helpers.js` — formatters y paleta
- `js/state.js` — sesiones, overrides UB, pending changes (localStorage)
- `js/parser.js` — parseo de archivo SISAO (SheetJS)
- `js/aggregate.js` — combina sesiones en un STATE
- `js/kpis.js` — tarjetas + banner UB + barra de progreso
- `js/charts.js` — todos los gráficos Chart.js
- `js/tables.js` — tablas top + buscador
- `js/main.js` — bootstrap + event listeners
- `libs/` — Chart.js 4.4.1 + SheetJS 0.18.5 (locales)

## Atajos

- **Imprimir / PDF**: botón superior derecho (o Ctrl+P) — formato A4 horizontal
- **Carga acumulativa**: cada archivo SISAO suma al período; podés quitarlos individualmente
- **Toggle convenio Biofarma**: por fila en el buscador, panel de cambios pendientes

OSEP · Departamento de Bioquímica · Mendoza, Argentina
