import jsPDF from 'jspdf';

export function getPublicCertificateUrl(code: string) {
  // Usamos rutas basadas en `hash` para que funcione en SPA (sin backend).
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/certificado/${encodeURIComponent(code)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function wrapText(doc: jsPDF, text: string, maxWidth: number) {
  return (doc as any).splitTextToSize(text, maxWidth) as string[];
}

export function generateCertificatePdfDataUrl(params: {
  userName: string;
  examName: string;
  issuedAt: string; // ISO
  code: string;
  publicUrl: string;
}) {
  const { userName, examName, issuedAt, code, publicUrl } = params;

  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let y = 68;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Certificado Digital', pageWidth / 2, y, { align: 'center' });

  y += 44;
  doc.setFontSize(11);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'normal');

  const lines: Array<{ label: string; value: string }> = [
    { label: 'Nombre del usuario', value: userName },
    { label: 'Nombre del examen', value: examName },
    { label: 'Fecha de emisión', value: formatDate(issuedAt) },
    { label: 'Código único', value: code },
    { label: 'URL pública', value: publicUrl },
  ];

  for (const [idx, line] of lines.entries()) {
    const label = `${line.label}:`;
    doc.setFont('helvetica', 'bold');
    doc.text(label, marginX, y);

    const textWidth = pageWidth - marginX * 2;
    doc.setFont('helvetica', 'normal');

    const valueLines = wrapText(doc, line.value, textWidth);
    // Asegura separación entre entradas aun si el valor hace salto de línea.
    const valueBlockHeight = Math.max(1, valueLines.length) * 14;
    doc.text(valueLines, marginX, y + 16);

    y += valueBlockHeight + 10;

    // Evita imprimir fuera de la página en casos extremos.
    if (y > 760 && idx < lines.length - 1) break;
  }

  // Pie "validación simulada"
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(
    'Validación simulada: el sistema verifica el código contra la información persistida en el navegador.',
    marginX,
    792
  );

  return doc.output('datauristring') as string; // data:application/pdf;base64,...
}

