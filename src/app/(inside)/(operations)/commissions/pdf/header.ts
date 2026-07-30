import { LoadedImage } from "@/utils/media";
import {
  COLOR,
  fitLogo,
  PAGE,
  Pdf,
  setDraw,
  setFill,
  setText,
  truncate,
} from "@/utils/pdf/theme";

// Caixa da logo da representação no topo. A imagem chega recortada
// (trimTransparent), então esta é a altura VISÍVEL da marca.
const LOGO_MAX_H = 44;
const LOGO_MAX_W = 180;

export interface HeaderData {
  companyName: string | null;
  companyLogo: LoadedImage | null;
  /** Mês do documento por extenso ("agosto de 2026"). */
  monthLabel: string;
  sellerName: string | null;
  /** Quantas parcelas o documento lista. */
  count: number;
  issuedAt: string;
}

/**
 * Topo do relatório: quem emite (a representação), a faixa com o título e o mês
 * e, abaixo, de quem são as comissões e quantas parcelas o papel cobre — a
 * primeira coisa que se confere ao pôr o documento ao lado da planilha da
 * fábrica.
 *
 * Devolve o `y` onde a primeira fábrica pode começar.
 */
export const drawHeader = (pdf: Pdf, data: HeaderData): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const right = pageW - PAGE.margin;
  let y = PAGE.margin;
  let markBottom = y;

  if (data.companyLogo) {
    const box = fitLogo(data.companyLogo, LOGO_MAX_W, LOGO_MAX_H);
    pdf.addImage(
      data.companyLogo.dataUrl,
      PAGE.margin,
      y,
      box.width,
      box.height
    );
    markBottom = y + box.height;
  } else if (data.companyName) {
    // Sem logo, o nome ocupa o lugar dela — o documento precisa dizer quem emite.
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    setText(pdf, COLOR.ink);
    pdf.text(truncate(pdf, data.companyName, 260), PAGE.margin, y + 12);
    markBottom = y + 18;
  }

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  setText(pdf, COLOR.muted);
  pdf.text(`Emitido em ${data.issuedAt}`, right, y + 10, { align: "right" });

  y = Math.max(markBottom, y + 14) + 14;

  setDraw(pdf, COLOR.brand);
  pdf.setLineWidth(1.5);
  pdf.line(PAGE.margin, y, right, y);
  pdf.setLineWidth(0.5);
  y += 24;

  // Faixa com o título e o mês — o recorte é sempre mensal.
  setFill(pdf, COLOR.brandSoft);
  pdf.roundedRect(PAGE.margin, y - 15, right - PAGE.margin, 34, 4, 4, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  setText(pdf, COLOR.brand);
  pdf.text("COMISSÕES A RECEBER", PAGE.margin + 12, y + 7);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, COLOR.ink);
  pdf.text(data.monthLabel.toUpperCase(), right - 12, y + 7, {
    align: "right",
  });

  y += 40;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  setText(pdf, COLOR.muted);
  const parts = [
    data.sellerName ? `Vendedor: ${data.sellerName}` : null,
    `${data.count} parcela(s) a receber`,
  ].filter(Boolean);
  pdf.text(parts.join("  ·  "), PAGE.margin, y);

  return y + 20;
};
