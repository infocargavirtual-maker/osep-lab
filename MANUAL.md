# Manual de Procedimiento
## Informe Ejecutivo — Convenio 2.868 (Laboratorio Bioquímica OSEP)

**Destinatarios:** Departamento de Bioquímica, Dirección OSEP, miembros del Directorio.
**Sistema:** https://infocargavirtual-maker.github.io/osep-lab/
**Versión:** Mayo 2026

---

## 1. ¿Para qué sirve este informe?

Mostrar, de manera **transparente y auditable**, el consumo mensual de prácticas de laboratorio del **Convenio 2.868** entre OSEP y la **Red Propia de Efectores**, con foco en:

- Qué efectores producen más prácticas
- Cuántas Unidades Bioquímicas (UB) consumimos contra Droguería **Biofarma**
- Qué prácticas están dentro del convenio y cuáles no
- Cuánto cobra OSEP y cuánto paga el afiliado de coseguro
- Evolución día por día del consumo

Es la base para decisiones de:
- Liquidación a Biofarma
- Negociación de inclusión/exclusión de prácticas
- Auditoría de prácticas con alto costo o volumen anómalo

---

## 2. Cómo abrir el informe

1. Abrí el navegador (Chrome, Edge, Firefox)
2. Entrá a **https://infocargavirtual-maker.github.io/osep-lab/**
3. El informe abre con los **datos de base** (período 01–11 Mayo 2026)

> Funciona en computadora y en celular. No requiere instalación, ni cuenta, ni clave.

---

## 3. Estructura del informe

El informe está dividido en **3 partes** + 1 buscador final:

### PARTE 1 — Total del Convenio (banda cyan)
Vista general de TODAS las prácticas consumidas en el período, sin distinguir si están en convenio Biofarma o no.

Contiene:
- 5 KPIs principales (Total Prácticas, Monto OSEP, Monto Afiliado, Afiliados Únicos, Tipos de Práctica)
- Banner UB con los indicadores clave por UB
- Gráfico de barras: prácticas por efector (top 12)
- Gráfico de dona: cuánto pone OSEP vs cuánto pone el afiliado
- Tabla: top 15 prácticas globales

### PARTE 2 — Fuera de Convenio Biofarma (banda roja)
Solo las prácticas **que NO tienen valor UB** asignado en el nomenclador Biofarma. Estas se hacen con insumos propios de OSEP y no generan pago a Biofarma.

Contiene:
- 4 KPIs (prácticas fuera de convenio, monto OSEP, afiliados, tipos)
- Gráfico top 12 por cantidad
- Gráfico top 10 por monto OSEP
- Tabla top 15

### PARTE 3 — Convenio Biofarma con UB (banda verde)
Solo las prácticas **que SÍ tienen valor UB**. Este es el subconjunto que se liquida a Biofarma.

Contiene:
- 4 KPIs (prácticas con UB, monto OSEP, afiliados, total UB)
- Gráfico top 12 por cantidad
- Gráfico top 12 por UB total
- Tabla top 15
- Top 8 afiliados por monto y por UB (requiere cargar archivo SISAO)
- Gráfico evolución diaria de UB (línea punteada verde)

### BUSCADOR (al final)
Tabla completa con las 283 prácticas del período. Permite:
- Buscar por nombre o por código
- Filtrar TODAS / CON UB / SIN UB
- Ordenar por cualquier columna
- Modificar UB de cada práctica (botón AGREGAR o SACAR del convenio)

---

## 4. Definiciones (lo importante)

| Término | Qué significa |
|---|---|
| **Práctica** | Una determinación bioquímica del nomenclador (ej: Hemograma, Glucemia, TSH). Cada una tiene un código numérico estándar. |
| **Análogo (An.)** | Sub-código de variante de la práctica (ej: Hemograma analógico 0 = común; análogo 4 = variante específica). |
| **Efector** | Lugar físico donde se hizo la práctica (Htal El Carmen, UAF Plumerillo, San Rafael, etc.). |
| **Afiliado único** | Persona con cobertura OSEP que consumió ≥1 práctica en el período. Se cuenta una sola vez aunque tenga muchas prácticas. |
| **UB (Unidad Bioquímica)** | Unidad de valor asignada a cada práctica en el **nomenclador Biofarma**. Es lo que se le paga al prestador. Una práctica puede valer 1.5 UB (urea) hasta 160 UB (carga viral HIV). |
| **Meta UB mensual** | **1.100.000 UB**. Es el techo mensual acordado con Biofarma. La barra superior del informe muestra qué tan cerca estás. |
| **Práctica "sin UB"** | Práctica que NO está en el convenio Biofarma — se hace con insumos propios de OSEP, no genera pago a Biofarma. |
| **Monto OSEP** | Lo que paga OSEP por la práctica (sin coseguro del afiliado). |
| **Monto Afiliado** | Lo que paga el afiliado de coseguro (bolsillo). |
| **Total** | Monto OSEP + Monto Afiliado = costo total de la práctica. |

---

## 5. Fórmulas usadas — cómo se calculan los números

Acá están **todas** las fórmulas. Si querés auditar un número, podés rehacerlo con esta lista.

### 5.1 — UB unitaria de una práctica

```
UB_unitaria(práctica)  =  valor del nomenclador Biofarma (cod_análogo)
                          o 0 si la práctica no está en el convenio
                          o lo que vos cambiaste manualmente (override)
```

> El sistema busca primero si vos modificaste la UB manualmente. Si no, usa el nomenclador. Si la práctica no está, usa 0.

### 5.2 — UB total de una práctica

```
UB_total(práctica)  =  UB_unitaria × Cantidad consumida
```

Ejemplo: Hemograma (UB=5) consumida 3.363 veces → 5 × 3.363 = **16.815 UB**.

### 5.3 — Total UB del período

```
Total_UB  =  Σ  UB_total(práctica)   para todas las prácticas
```

### 5.4 — Cobertura UB (qué porcentaje de prácticas tienen UB)

```
% Cobertura_UB  =  (Prácticas_CON_UB / Total_prácticas)  × 100
```

Ejemplo: 38.732 con UB / 42.268 total = **91,6%**.

### 5.5 — UB / práctica (promedio)

```
UB_por_práctica  =  Total_UB / Total_prácticas
```

Mide cuánto vale en promedio una práctica del período.

### 5.6 — $ OSEP / UB (costo por UB)

```
$_OSEP_por_UB  =  Monto_OSEP_de_prácticas_con_UB / Total_UB
```

Te dice cuántos pesos efectivos te cuesta a OSEP cada UB consumida. Sirve para comparar contra lo que cobra Biofarma.

### 5.7 — UB / día (consumo diario promedio)

```
UB_por_día  =  Total_UB / Días_del_período
```

Si el período son 11 días y consumiste 317.361 UB → 317.361 / 11 = **28.851 UB/día** (~28,9k).

### 5.8 — Progreso vs meta mensual

```
% Progreso_meta  =  (Total_UB / 1.100.000)  × 100
```

Es la barra superior del informe. Si llegás a 100% antes de fin de mes, estás sobre-consumiendo el techo.

### 5.9 — Monto OSEP en millones

```
Monto_OSEP_$M  =  Σ Monto_OSEP_cada_práctica  /  1.000.000
```

Se muestra abreviado: `$149,7M` = 149.694.281 pesos.

### 5.10 — Prácticas fuera de convenio (Parte 2)

```
Prácticas_fuera_convenio  =  Σ Cantidad  donde UB_unitaria = 0
% Fuera_convenio          =  Prácticas_fuera_convenio / Total_prácticas × 100
```

### 5.11 — Top afiliados por consumo (Parte 3)

```
Por afiliado i:
  Monto_OSEP_i  =  Σ Monto_OSEP  de las prácticas del afiliado i
  UB_total_i    =  Σ UB_total    de las prácticas del afiliado i

Top 8 = los 8 afiliados con mayor Monto_OSEP_i (y por UB en el otro gráfico)
```

> Estos gráficos requieren cargar un archivo SISAO (los datos de base no incluyen detalles por afiliado).

### 5.12 — Evolución diaria

```
Por día d:
  UB_día_d    =  Σ (UB_unitaria × Cantidad)  de prácticas con fecha = d
  Prac_día_d  =  Σ Cantidad                  de prácticas con fecha = d
```

---

## 6. Cómo cargar archivos SISAO

El informe arranca con **datos de base** (01–11 Mayo 2026). Para verlo actualizado:

1. Exportá del **SISAO** el archivo del período (hoja **MENSUAL**)
2. Abrí el informe en el navegador
3. En la zona superior **arrastrá el archivo `.xls` o `.xlsx`**
   - O hacé clic en la zona y seleccionalo
4. El sistema lo procesa automáticamente:
   - Detecta el encabezado (busca la columna "Año")
   - Lee todas las filas con datos
   - Suma cantidades, montos, UB
5. Aparece un panel con el archivo cargado y se actualizan **todos los gráficos, KPIs y tablas**

### Carga acumulativa
Cada archivo SUMA al período total. Podés cargar **varios archivos** (ej: 01–15 mayo y luego 16–31 mayo) y el informe los combina.

### Quitar un archivo
En el panel **"ARCHIVOS CARGADOS"**, clickeá `✕ QUITAR` al lado del nombre. El informe vuelve a recalcular sin ese archivo.

### Eliminar todo
Botón rojo `ELIMINAR TODO` en el panel. Vuelve a los datos de base.

> **Privacidad:** los archivos NUNCA salen de tu computadora. Todo el procesamiento es local, en el navegador. Nadie más ve los datos del SISAO.

---

## 7. Cómo modificar UB de una práctica (toggle convenio)

A veces necesitás cambiar manualmente si una práctica está o no en el convenio Biofarma (por errores del nomenclador, prácticas nuevas, negociaciones, etc.).

### Flujo completo (2 pasos):

**PASO 1 — Crear el cambio pendiente:**
1. Bajá al **buscador** al final de la página
2. Buscá la práctica por nombre o código
3. En la columna **Convenio** (última a la derecha) hacé clic en:
   - **SACAR** (rojo) — si la práctica tiene UB y querés sacarla del convenio → la UB pasa a 0
   - **AGREGAR** (verde) — si la práctica no tiene UB y querés agregarla → se abre un cuadrito donde ingresás cuántas UB le asignás
4. Confirmás

**PASO 2 — Aplicar los cambios:**
- La página se desplaza sola al **panel amarillo arriba**: "⚠️ N CAMBIOS PENDIENTES"
- Podés acumular varios cambios (ej: sacar 3 prácticas y agregar 1)
- Cuando los revisaste, clic en **✓ APLICAR CAMBIOS**
- Se recalculan TODOS los gráficos, KPIs, tablas con los nuevos valores
- Las prácticas modificadas muestran un `✎MOD` para que se vea que fueron cambiadas manualmente

### Deshacer un cambio
Si te equivocaste antes de aplicar: botón `↩ DESHACER` en la fila, o `CANCELAR TODO` en el panel.

Si ya aplicaste: vas a la fila, clickeás SACAR o AGREGAR de nuevo y aplicás.

### Persistencia
Los cambios se guardan en el navegador (localStorage). Si cerrás y abrís de nuevo, siguen ahí.

> Si cambiás de computadora o navegador, los cambios manuales **no se trasladan**. Cada equipo tiene los suyos.

---

## 8. Imprimir / generar PDF

1. Clic en el botón **`IMPRIMIR / PDF`** arriba a la derecha (turquesa)
2. O `Ctrl + P` (Windows) / `Cmd + P` (Mac)
3. En el cuadro de impresión:
   - Destino: **Guardar como PDF** (o impresora física)
   - Orientación: **Horizontal**
   - Tamaño: **A4**
   - Márgenes: **Mínimos**
   - Marcá **"Gráficos en segundo plano"** si la opción está disponible
4. Guardar / Imprimir

El informe está preparado para imprimirse en **A4 horizontal** con saltos de página correctos entre las 3 partes.

---

## 9. Glosario rápido (para audiencia no técnica)

- **Nomenclador**: tabla de prácticas de laboratorio con su código y valor UB asignado.
- **Biofarma**: droguería externa que provee los reactivos. Cobra a OSEP por UB consumida.
- **EP (Efector Propio)**: laboratorios que pertenecen a la red propia de OSEP (no terceros).
- **SISAO**: sistema de autorización interno de OSEP. Es la fuente de datos.
- **Coseguro**: el dinero que pone el afiliado del bolsillo cuando consume una práctica.
- **Override**: cambio manual de un valor UB hecho por el usuario del informe.

---

## 10. Soporte técnico

- **Repositorio del código:** https://github.com/infocargavirtual-maker/osep-lab
- **Documentación técnica:** archivo `README.md` del repo
- **Bugs / mejoras:** abrir un issue en GitHub o avisar al área de Sistemas

---

## 11. Anexo — Nomenclador UB (valores de referencia)

Las **UB unitarias** vienen del nomenclador Biofarma. Algunos valores importantes para auditar:

| Cód. | Práctica | UB |
|---|---|---|
| 1 | Acto Bioquímico | 6.0 |
| 404 | Gases en sangre (PCO2 / PO2) | 10.0 |
| 412 | Glucemia | 15.0 |
| 475 | Hemograma | 5.0 |
| 481 | Hepatograma | 6.0 |
| 546 | Ionograma sérico | 2.5 |
| 711 | Orina completa | 5.0 |
| 767 | Proteinuria | 1.5 |
| 865 | TSH (Tirotrofina) | 9.0 |
| 873 | GOT (AST) | 1.5 |
| 902 | Urea sérica | 1.5 |
| 904 | Ácido úrico sérico | 1.5 |
| 1070 | HbA1c | 15.0 |
| 1105 | HIV carga viral | 160.0 |
| 8298 | Perfil lipídico | 13.0 |
| 9913 | Vitamina D3 (25-OH) | 37.0 |

El nomenclador completo (336 entradas) está en el archivo `js/data.js` del repo.

---

*OSEP · Departamento de Bioquímica · Convenio 2.868 con Droguería Biofarma*
*Manual versión 1.0 — Mayo 2026*
