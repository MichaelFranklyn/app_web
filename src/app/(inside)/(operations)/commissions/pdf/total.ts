import { formatMoney } from "@/utils/format/masks";
import { COLOR, PAGE, Pdf, setFill, setText } from "@/utils/pdf/theme";

const TOTAL_H = 34;
const TOTAL_W = 260;

/**
 * Total geral do mês somando todas as fábricas — o número da cobrança, na cor
 * da marca e no fim do documento, depois dos subtotais de cada fábrica.
 */
export const drawTotal = (
  pdf: Pdf,
  total: number,
  startY: number,
  onNewPage: () => number
): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const right = pageW - PAGE.margin;

  let y = startY + 6;
  // O total não pode ficar órfão colado no rodapé: sem espaço, vai para a nova.
  if (y + TOTAL_H > pageH - PAGE.margin - 20) y = onNewPage();

  setFill(pdf, COLOR.brand);
  pdf.roundedRect(right - TOTAL_W, y, TOTAL_W, TOTAL_H, 4, 4, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, COLOR.white);
  pdf.text("TOTAL A RECEBER", right - TOTAL_W + 12, y + 21);
  pdf.setFontSize(14);
  pdf.text(formatMoney(total), right - 12, y + 22, { align: "right" });

  return y + TOTAL_H + 10;
};
