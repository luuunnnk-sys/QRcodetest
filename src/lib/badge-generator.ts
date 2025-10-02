import { jsPDF } from 'jspdf';
import { generateQRCodeImage } from './qrcode';

export interface BadgeData {
  firstName: string;
  lastName: string;
  company: string;
  qrCodeData: string;
  eventName: string;
  logoUrl?: string;
}

export async function generateBadgePDF(
  badges: BadgeData[],
  eventName: string
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let isFirstPage = true;

  for (const badge of badges) {
    if (!isFirstPage) {
      pdf.addPage();
    }
    isFirstPage = false;

    await drawBadge(pdf, badge, eventName);
  }

  return pdf.output('blob');
}

async function drawBadge(
  pdf: jsPDF,
  badge: BadgeData,
  eventName: string
): Promise<void> {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.5);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(eventName, pageWidth / 2, 35, { align: 'center' });

  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.2);
  pdf.line(30, 45, pageWidth - 30, 45);

  const qrImage = await generateQRCodeImage(badge.qrCodeData);
  const qrSize = 80;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 60;
  pdf.addImage(qrImage, 'PNG', qrX, qrY, qrSize, qrSize);

  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  const fullName = `${badge.firstName} ${badge.lastName}`;
  pdf.text(fullName, pageWidth / 2, qrY + qrSize + 20, { align: 'center' });

  if (badge.company) {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'normal');
    pdf.text(badge.company, pageWidth / 2, qrY + qrSize + 32, {
      align: 'center',
    });
  }

  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    'Présentez ce badge à l\'entrée',
    pageWidth / 2,
    pageHeight - 25,
    { align: 'center' }
  );
}

export async function generateSingleBadgeImage(
  badge: BadgeData
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#E5E5E5';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(badge.eventName, canvas.width / 2, 100);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 130);
  ctx.lineTo(canvas.width - 60, 130);
  ctx.stroke();

  const qrImage = await generateQRCodeImage(badge.qrCodeData);
  const qrImg = new Image();
  await new Promise<void>((resolve, reject) => {
    qrImg.onload = () => resolve();
    qrImg.onerror = reject;
    qrImg.src = qrImage;
  });

  const qrSize = 400;
  const qrX = (canvas.width - qrSize) / 2;
  const qrY = 180;
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  const fullName = `${badge.firstName} ${badge.lastName}`;
  ctx.fillText(fullName, canvas.width / 2, qrY + qrSize + 80);

  if (badge.company) {
    ctx.font = '36px system-ui, -apple-system, sans-serif';
    ctx.fillText(badge.company, canvas.width / 2, qrY + qrSize + 130);
  }

  ctx.fillStyle = '#999999';
  ctx.font = '24px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    'Présentez ce badge à l\'entrée',
    canvas.width / 2,
    canvas.height - 60
  );

  return canvas.toDataURL('image/png');
}
