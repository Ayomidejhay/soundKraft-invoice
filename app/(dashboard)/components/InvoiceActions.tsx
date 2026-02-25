"use client";

import html2pdf from "html2pdf.js";

export function exportInvoicePDF(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const options = {
    margin: 0.5,
    filename: `${fileName}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  } as const;

  html2pdf().from(element).set(options).save();
}