"""Genera manual-procedimiento.pdf desde MANUAL.md
Uso: python scripts/generar_manual_pdf.py
"""
import re
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, ListFlowable, ListItem
)
from reportlab.pdfgen import canvas

# ── Paths ─────────────────────────────────────────────
BASE  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT = os.path.join(BASE, "MANUAL.md")
OUTPUT= os.path.join(BASE, "manual-procedimiento.pdf")

# ── Colores OSEP ──────────────────────────────────────
NAVY   = HexColor("#0a0f1e")
ACCENT = HexColor("#00c8ff")
GREEN  = HexColor("#00ffc8")
DANGER = HexColor("#f43f5e")
MUTED  = HexColor("#7a98bc")
SURF   = HexColor("#f5f8fc")
BORDER = HexColor("#d6dde8")

# ── Estilos ───────────────────────────────────────────
ss = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=ss["Heading1"], fontName="Helvetica-Bold", fontSize=20, textColor=NAVY, spaceAfter=10, spaceBefore=18, alignment=TA_LEFT)
H2 = ParagraphStyle("H2", parent=ss["Heading2"], fontName="Helvetica-Bold", fontSize=14, textColor=NAVY, spaceAfter=8,  spaceBefore=14, alignment=TA_LEFT, borderPadding=4, leftIndent=0)
H3 = ParagraphStyle("H3", parent=ss["Heading3"], fontName="Helvetica-Bold", fontSize=11, textColor=ACCENT, spaceAfter=5, spaceBefore=10)
BODY = ParagraphStyle("Body", parent=ss["BodyText"], fontName="Helvetica", fontSize=10, leading=14, alignment=TA_JUSTIFY, textColor=black, spaceAfter=6)
CODE = ParagraphStyle("Code", parent=BODY, fontName="Courier", fontSize=9, textColor=NAVY, leading=12, leftIndent=12, rightIndent=12, spaceBefore=4, spaceAfter=8, backColor=SURF, borderColor=BORDER, borderWidth=0.5, borderPadding=8)
QUOTE = ParagraphStyle("Quote", parent=BODY, fontSize=9, textColor=MUTED, leftIndent=14, fontName="Helvetica-Oblique")
SMALL = ParagraphStyle("Small", parent=BODY, fontSize=8, textColor=MUTED, alignment=TA_CENTER)

# ── Helpers de parsing ───────────────────────────────
def inline_format(t: str) -> str:
    """Convierte markdown inline a tags de ReportLab."""
    # **bold**
    t = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", t)
    # *italic*  (después del bold)
    t = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<i>\1</i>", t)
    # `code`
    t = re.sub(r"`([^`]+)`", r'<font face="Courier" color="#1e3a5f">\1</font>', t)
    # [text](url)  → solo text porque PDF impreso no clica
    t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<font color="#00c8ff">\1</font>', t)
    return t

def parse_table(lines, i):
    """Lee una tabla markdown desde lines[i]. Devuelve (Table, índice siguiente)."""
    headers = [c.strip() for c in lines[i].strip().strip("|").split("|")]
    i += 2  # saltear separador
    rows = []
    while i < len(lines) and lines[i].strip().startswith("|"):
        cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
        rows.append(cells)
        i += 1

    # Formato de celdas con inline markdown
    style_cell = ParagraphStyle("tc", parent=BODY, fontSize=9, leading=11, alignment=TA_LEFT)
    style_head = ParagraphStyle("th", parent=BODY, fontSize=9, leading=11, alignment=TA_LEFT, fontName="Helvetica-Bold", textColor=white)
    data = [[Paragraph(inline_format(h), style_head) for h in headers]]
    for r in rows:
        data.append([Paragraph(inline_format(c), style_cell) for c in r])

    # Ancho de columnas auto
    n = len(headers)
    avail = 170 * mm
    col_w = [avail / n] * n

    t = Table(data, colWidths=col_w, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY),
        ("TEXTCOLOR",  (0,0), (-1,0), white),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [white, SURF]),
        ("GRID", (0,0), (-1,-1), 0.4, BORDER),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]))
    return t, i

# ── Footer con número de página ──────────────────────
def _footer(canv, doc):
    canv.saveState()
    canv.setFont("Helvetica", 8)
    canv.setFillColor(MUTED)
    canv.drawString(20*mm, 12*mm, "OSEP · Bioquímica · Convenio 2.868 · Manual v1.0")
    canv.drawRightString(190*mm, 12*mm, f"Página {doc.page}")
    canv.setStrokeColor(BORDER)
    canv.setLineWidth(0.4)
    canv.line(20*mm, 14*mm, 190*mm, 14*mm)
    canv.restoreState()

# ── Build ────────────────────────────────────────────
def build():
    with open(INPUT, "r", encoding="utf-8") as f:
        lines = f.readlines()

    story = []

    # Portada
    story.append(Spacer(1, 80*mm))
    portada_h = ParagraphStyle("ph", parent=H1, fontSize=28, alignment=TA_CENTER, textColor=NAVY, spaceAfter=4)
    portada_sub = ParagraphStyle("ps", parent=H2, fontSize=16, alignment=TA_CENTER, textColor=ACCENT, spaceAfter=24)
    portada_meta = ParagraphStyle("pm", parent=BODY, fontSize=11, alignment=TA_CENTER, textColor=MUTED)
    story.append(Paragraph("Manual de Procedimiento", portada_h))
    story.append(Paragraph("Informe Ejecutivo — Convenio 2.868", portada_sub))
    story.append(Paragraph("Laboratorio de Bioquímica · OSEP Mendoza", portada_meta))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph("Red Propia de Efectores · Prestador externo: Droguería Biofarma", portada_meta))
    story.append(Spacer(1, 40*mm))
    story.append(Paragraph("Versión 1.0 — Mayo 2026", portada_meta))
    story.append(PageBreak())

    # Cuerpo: procesar líneas
    i = 0
    in_code = False
    code_buf = []
    skip_first_h1 = True  # ya pusimos la portada

    while i < len(lines):
        line = lines[i].rstrip()

        # Fences de código
        if line.startswith("```"):
            if not in_code:
                in_code = True
                code_buf = []
            else:
                in_code = False
                txt = "<br/>".join(code_buf).replace(" ", "&nbsp;")
                story.append(Paragraph(txt, CODE))
            i += 1
            continue
        if in_code:
            code_buf.append(re.sub(r"[<>&]", lambda m: {"<":"&lt;",">":"&gt;","&":"&amp;"}[m.group()], line))
            i += 1
            continue

        # H1 / H2 / H3
        if line.startswith("# "):
            if skip_first_h1:
                skip_first_h1 = False
                i += 1
                continue
            story.append(Paragraph(inline_format(line[2:]), H1))
        elif line.startswith("## "):
            story.append(Paragraph(inline_format(line[3:]), H2))
        elif line.startswith("### "):
            story.append(Paragraph(inline_format(line[4:]), H3))
        # Tabla
        elif line.startswith("|") and i + 1 < len(lines) and re.match(r"^\|[\s\-:|]+\|$", lines[i+1].strip()):
            t, i = parse_table(lines, i)
            story.append(Spacer(1, 4))
            story.append(t)
            story.append(Spacer(1, 8))
            continue
        # Quote
        elif line.startswith("> "):
            story.append(Paragraph(inline_format(line[2:]), QUOTE))
        # Lista
        elif re.match(r"^\s*[-*]\s+", line):
            # acumular ítems consecutivos
            items = []
            while i < len(lines) and re.match(r"^\s*[-*]\s+", lines[i]):
                items.append(Paragraph(inline_format(re.sub(r"^\s*[-*]\s+", "", lines[i].rstrip())), BODY))
                i += 1
            story.append(ListFlowable(
                [ListItem(p, leftIndent=8, value="circle") for p in items],
                bulletType="bullet",
                start="•",
                leftIndent=14,
            ))
            continue
        # Lista numerada
        elif re.match(r"^\s*\d+\.\s+", line):
            items = []
            while i < len(lines) and re.match(r"^\s*\d+\.\s+", lines[i]):
                items.append(Paragraph(inline_format(re.sub(r"^\s*\d+\.\s+", "", lines[i].rstrip())), BODY))
                i += 1
            story.append(ListFlowable(items, bulletType="1", leftIndent=14))
            continue
        # Separador
        elif line.strip() == "---":
            story.append(Spacer(1, 2))
        # Línea vacía
        elif line.strip() == "":
            story.append(Spacer(1, 4))
        # Párrafo normal
        else:
            # Combinar líneas hasta hallar línea vacía
            buf = [line]
            j = i + 1
            while j < len(lines) and lines[j].strip() != "" and not lines[j].startswith(("#", "|", "-", "*", "```", ">", "1.", "2.", "3.")):
                buf.append(lines[j].rstrip())
                j += 1
            story.append(Paragraph(inline_format(" ".join(buf)), BODY))
            i = j
            continue

        i += 1

    doc = SimpleDocTemplate(
        OUTPUT, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=18*mm, bottomMargin=20*mm,
        title="Manual de Procedimiento — Convenio 2.868 OSEP",
        author="OSEP Bioquímica",
    )
    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f"OK: {OUTPUT} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    build()
