import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

export async function makeResultPdf({ found, meta = {} }) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const marginLeft = 50;
  let y = 780;

  // ===== Embed Vodafone Logo from public/logo.png =====
  const logoBytes = await fetch("/logo.png").then((res) => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoDims = logoImage.scale(0.15); // adjust scaling here
  page.drawImage(logoImage, {
    x: marginLeft,
    y: y - logoDims.height + 20,
    width: logoDims.width,
    height: logoDims.height,
  });
  y -= logoDims.height + 20;

  // ===== Title =====
  page.drawText("Crew Numbers Report", {
    x: marginLeft,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0.8, 0, 0), // Vodafone red
  });
  y -= 30;

  page.drawText(`Generated: ${new Date().toLocaleString()}`, {
    x: marginLeft,
    y,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 20;

  if (meta.sourceName) {
    page.drawText(`Schedule: ${meta.sourceName}`, {
      x: marginLeft,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 30;
  }

  // ===== Table Header =====
  page.drawText("Name", {
    x: marginLeft,
    y,
    size: 12,
    font: boldFont,
  });
  page.drawText("Number", {
    x: 400,
    y,
    size: 12,
    font: boldFont,
  });

  y -= 15;
  page.drawLine({
    start: { x: marginLeft, y },
    end: { x: 550, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 20;

  // ===== Data Rows =====
  for (const row of found.sort((a, b) => a.name.localeCompare(b.name))) {
    page.drawText(pretty(row.name), { x: marginLeft, y, size: 11, font });
    page.drawText(String(row.number), { x: 400, y, size: 11, font });
    y -= 20;

    // Handle page break
    if (y < 60) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 780;
    }
  }

  // ===== Footer =====
  page.drawLine({
    start: { x: marginLeft, y: 40 },
    end: { x: 550, y: 40 },
    thickness: 0.5,
    color: rgb(0.6, 0.6, 0.6),
  });
  page.drawText("Confidential • Vodafone Fiji", {
    x: marginLeft,
    y: 25,
    size: 8,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // ===== Save PDF =====
  const bytes = await pdfDoc.save();
  saveAs(
    new Blob([bytes], { type: "application/pdf" }),
    `crew-numbers-${Date.now()}.pdf`
  );
}

function pretty(nameNorm) {
  return nameNorm
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
