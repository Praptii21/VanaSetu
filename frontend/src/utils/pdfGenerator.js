import { jsPDF } from 'jspdf';

/**
 * Generate a styled VanaSetu traceability PDF report.
 * Uses only ASCII characters (jsPDF's built-in Helvetica has no Unicode support).
 */
export function generatePDF(product, qrDataUrl) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  // -- Header band --
  doc.setFillColor(27, 94, 32);
  doc.rect(0, 0, pageW, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('VanaSetu', 14, y + 5);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Ayurvedic Supply Chain Traceability Report', 14, y + 13);
  doc.setFontSize(8);
  doc.text('Generated: ' + new Date().toLocaleString('en-IN'), 14, y + 19);

  // QR in top-right
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', pageW - 40, 5, 28, 28);
  }

  y = 46;

  // -- Product Info Box --
  doc.setFillColor(240, 247, 240);
  doc.roundedRect(10, y, pageW - 20, 36, 3, 3, 'F');
  doc.setTextColor(27, 94, 32);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(product.product_name, 16, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const trustLabel = product.trust_score >= 80
    ? 'Trust Score: ' + product.trust_score + '/100  -  Verified Premium'
    : 'Trust Score: ' + product.trust_score + '/100';
  doc.text(trustLabel, 16, y + 16);

  const mfgDate = new Date(product.manufacturing_date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const expDate = new Date(product.expiry_date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  doc.text('Mfg: ' + mfgDate + '    Expiry: ' + expDate, 16, y + 22);
  doc.text('Total Input: ' + product.total_input_weight + ' kg    Output: ' + product.output_units + ' units', 16, y + 28);

  y += 42;

  // -- Ingredients Table --
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 94, 32);
  doc.text('Ingredients Journey', 14, y);
  y += 6;

  // Table header
  const colX = [14, 26, 52, 82, 112, 142, 160, 178];
  const headers = ['#', 'Herb', 'Collector', 'Location', 'Weight', 'Purity', 'pH', 'Status'];
  doc.setFillColor(46, 125, 50);
  doc.rect(10, y - 1, pageW - 20, 7, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  headers.forEach((h, i) => doc.text(h, colX[i], y + 4));
  y += 10;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(7);

  product.ingredients.forEach((ing, idx) => {
    const lab = ing.lab_report || {};
    if (y > 255) {
      doc.addPage();
      y = 15;
    }

    // Alternating row bg
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 248);
      doc.rect(10, y - 3, pageW - 20, 20, 'F');
    }

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(7);

    doc.text(String(idx + 1), colX[0], y);
    doc.text(ing.herb_name || '', colX[1], y);
    doc.text((ing.collector_name || '').substring(0, 16), colX[2], y);
    doc.text((ing.gps_place_name || '').substring(0, 18), colX[3], y);

    // Weight column — ASCII only
    const weightStr = ing.weight_kg + ' -> ' + (lab.weight_verified_kg || '?') + ' kg';
    doc.text(weightStr, colX[4], y);

    doc.text((lab.purity_percentage || '?') + '%', colX[5], y);
    doc.text(String(lab.ph_level || '?'), colX[6], y);

    // Status with color
    if (lab.overall_status === 'pass') {
      doc.setTextColor(27, 94, 32);
      doc.text('PASS', colX[7], y);
    } else {
      doc.setTextColor(200, 50, 50);
      doc.text('FAIL', colX[7], y);
    }
    doc.setTextColor(60, 60, 60);

    // Safety details row — ASCII only
    doc.setFontSize(6);
    const hmResult = lab.heavy_metals_pass ? 'Pass' : 'Fail';
    const contResult = lab.contamination_pass ? 'Pass' : 'Fail';
    const mismatchNote = lab.weight_match ? '' : '  |  (!) Weight Mismatch';
    doc.text(
      'AI: ' + ing.ai_confidence + '%  |  Heavy Metals: ' + hmResult + '  |  Contamination: ' + contResult + mismatchNote,
      colX[1],
      y + 5
    );
    doc.setFontSize(7);

    // Batch hash
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(5);
    doc.text('TX: ' + (ing.tx_hash || ''), colX[1], y + 10);
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);

    y += 20;
  });

  y += 6;

  // -- Blockchain Summary --
  if (y > 250) {
    doc.addPage();
    y = 15;
  }

  doc.setFillColor(30, 30, 30);
  doc.roundedRect(10, y, pageW - 20, 20, 3, 3, 'F');
  doc.setTextColor(167, 214, 167);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Hash (SHA-256)', 16, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(200, 200, 200);
  doc.text(product.product_hash || '', 16, y + 13);

  // -- Footer --
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(
    'VanaSetu  |  Blockchain-Powered Ayurvedic Supply Chain Traceability  |  vanasetu.app',
    pageW / 2,
    footerY,
    { align: 'center' }
  );

  return doc;
}
