from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from io import BytesIO
from datetime import datetime


# ── Shared Styles ─────────────────────────────────────────────────────────────

def _base_doc(buffer):
    return SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

def _styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Center", alignment=1, fontSize=11))
    styles.add(ParagraphStyle(name="Header", fontSize=18, fontName="Helvetica-Bold", alignment=1, spaceAfter=4))
    styles.add(ParagraphStyle(name="SubHeader", fontSize=11, fontName="Helvetica-Bold", spaceAfter=4, spaceBefore=10))
    styles.add(ParagraphStyle(name="Small", fontSize=9, textColor=colors.grey))
    return styles

def _divider():
    return HRFlowable(width="100%", thickness=1, color=colors.HexColor("#2d6a4f"), spaceAfter=6, spaceBefore=6)

def _kv_table(rows, col_widths=None):
    """Render a list of (key, value) tuples as a two-column table."""
    col_widths = col_widths or [6 * cm, 10 * cm]
    table = Table([[Paragraph(f"<b>{k}</b>", getSampleStyleSheet()["Normal"]),
                    Paragraph(str(v), getSampleStyleSheet()["Normal"])]
                   for k, v in rows], colWidths=col_widths)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8f9fa")),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f0f7f4")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#dee2e6")),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


# ── Lab Report PDF ────────────────────────────────────────────────────────────

def generate_lab_report_pdf(batch, lab_report) -> bytes:
    buffer = BytesIO()
    doc = _base_doc(buffer)
    s = _styles()
    story = []

    weight_diff = abs(batch.weight_kg - lab_report.weight_verified_kg)
    weight_status = "✓ Matched" if lab_report.weight_match else f"⚠ Discrepancy ({weight_diff:.2f} kg)"

    story.append(Paragraph("VANASETU LAB REPORT", s["Header"]))
    story.append(_divider())
    story.append(Paragraph(f"Report Hash: {lab_report.report_hash}", s["Small"]))
    story.append(Paragraph(f"Generated At: {datetime.utcnow().strftime('%d %b %Y, %I:%M %p')} UTC", s["Small"]))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("BATCH INFORMATION", s["SubHeader"]))
    story.append(_kv_table([
        ("Batch ID", f"#{batch.id}"),
        ("Herb Name", batch.herb_name),
        ("Collector", batch.collector_name),
        ("Collection GPS", f"{batch.gps_lat}°N, {batch.gps_lng}°E"),
        ("Location", batch.gps_place_name or "N/A"),
        ("Collection Time", batch.time_of_collection.strftime('%d %b %Y, %I:%M %p') if batch.time_of_collection else "N/A"),
    ]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("WEIGHT ANALYSIS", s["SubHeader"]))
    story.append(_kv_table([
        ("Claimed Weight", f"{batch.weight_kg} kg"),
        ("Verified Weight", f"{lab_report.weight_verified_kg} kg"),
        ("Difference", f"{weight_diff:.2f} kg"),
        ("Weight Match", weight_status),
    ]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("LAB TEST RESULTS", s["SubHeader"]))
    story.append(_kv_table([
        ("pH Level", str(lab_report.ph_level)),
        ("Purity", f"{lab_report.purity_percentage}%"),
        ("Heavy Metals", "PASS ✓" if lab_report.heavy_metals_pass else "FAIL ✗"),
        ("Contamination", "PASS ✓" if lab_report.contamination_pass else "FAIL ✗"),
        ("Overall Status", lab_report.overall_status.upper()),
        ("Tested By", lab_report.tested_by if hasattr(lab_report, "tested_by") else "N/A"),
        ("Test Date", lab_report.time_tested.strftime('%d %b %Y') if lab_report.time_tested else "N/A"),
    ]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("BLOCKCHAIN RECORD", s["SubHeader"]))
    story.append(_kv_table([
        ("Batch Hash", batch.tx_hash),
        ("Report Hash", lab_report.report_hash),
    ]))

    story.append(Spacer(1, 0.5 * cm))
    story.append(_divider())
    story.append(Paragraph("Digitally signed by VanaSetu", s["Center"]))
    story.append(_divider())

    doc.build(story)
    return buffer.getvalue()


# ── Manufacturing Report PDF ──────────────────────────────────────────────────

def generate_manufacturing_pdf(product, batches_with_reports) -> bytes:
    buffer = BytesIO()
    doc = _base_doc(buffer)
    s = _styles()
    story = []

    story.append(Paragraph("VANASETU MANUFACTURING REPORT", s["Header"]))
    story.append(_divider())
    story.append(Paragraph(f"Product Hash: {product.product_hash}", s["Small"]))
    story.append(Paragraph(f"Generated At: {datetime.utcnow().strftime('%d %b %Y, %I:%M %p')} UTC", s["Small"]))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("PRODUCT INFORMATION", s["SubHeader"]))
    story.append(_kv_table([
        ("Product Name", product.product_name),
        ("Mfg Date", product.manufacturing_date.strftime('%d %b %Y') if product.manufacturing_date else "N/A"),
        ("Expiry Date", product.expiry_date.strftime('%d %b %Y') if product.expiry_date else "N/A"),
        ("Output Units", str(product.output_units)),
        ("Trust Score", f"{product.trust_score}/100"),
    ]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("INGREDIENTS USED", s["SubHeader"]))

    for idx, (batch, lab) in enumerate(batches_with_reports, 1):
        story.append(Paragraph(f"Ingredient {idx} — {batch.herb_name}", s["SubHeader"]))
        rows = [
            ("Batch ID", f"#{batch.id}"),
            ("Collector", batch.collector_name),
            ("GPS", f"{batch.gps_lat}°N, {batch.gps_lng}°E"),
            ("Location", batch.gps_place_name or "N/A"),
            ("Collected", batch.time_of_collection.strftime('%d %b %Y, %I:%M %p') if batch.time_of_collection else "N/A"),
            ("Claimed Weight", f"{batch.weight_kg} kg"),
            ("Verified Weight", f"{lab.weight_verified_kg} kg" if lab else "N/A"),
            ("Purity", f"{lab.purity_percentage}%" if lab else "N/A"),
            ("pH", str(lab.ph_level) if lab else "N/A"),
            ("Heavy Metals", ("PASS ✓" if lab.heavy_metals_pass else "FAIL ✗") if lab else "N/A"),
            ("Contamination", ("PASS ✓" if lab.contamination_pass else "FAIL ✗") if lab else "N/A"),
            ("Batch Hash", batch.tx_hash),
            ("Lab Report Hash", lab.report_hash if lab else "N/A"),
        ]
        story.append(_kv_table(rows))
        story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("WEIGHT SUMMARY", s["SubHeader"]))
    story.append(_kv_table([
        ("Total Input", f"{product.total_input_weight} kg"),
        ("Total Output", f"{product.output_units} units"),
    ]))

    story.append(Spacer(1, 0.5 * cm))
    story.append(_divider())
    story.append(Paragraph("Digitally signed by VanaSetu", s["Center"]))
    story.append(_divider())

    doc.build(story)
    return buffer.getvalue()
