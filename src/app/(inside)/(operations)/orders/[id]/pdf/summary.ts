import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { OrderInstallment } from "../interface";
import { COLOR, PAGE, Pdf, setDraw, setFill, setText, truncate } from "./theme";

const BLOCK_W = 230;

export interface TotalsData {
  /** Subtotal COM o imposto embutido (ST) — soma da coluna Subtotal dos itens. */
  subtotal: string;
  ipiAmount: string;
  total: number;
}

/** Bloco de totais alinhado à direita, com o total final destacado na marca. */
export const drawTotals = (
  pdf: Pdf,
  data: TotalsData,
  startY: number
): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const right = pageW - PAGE.margin;
  const left = right - BLOCK_W;
  const hasIpi = Number(data.ipiAmount) > 0;
  let y = startY + 10;

  const line = (label: string, value: string) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    setText(pdf, COLOR.muted);
    pdf.text(label, left + 12, y);
    setText(pdf, COLOR.ink);
    pdf.text(value, right - 12, y, { align: "right" });
    y += 16;
  };

  // O imposto já está dentro do subtotal (e detalhado por linha na tabela); uma
  // linha "Impostos" aqui contaria em dobro. IPI, quando existe, é à parte.
  line("Subtotal", formatMoney(data.subtotal));
  if (hasIpi) line("IPI", formatMoney(data.ipiAmount));

  setFill(pdf, COLOR.brand);
  pdf.roundedRect(left, y - 4, BLOCK_W, 30, 4, 4, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, COLOR.white);
  pdf.text("TOTAL", left + 12, y + 15);
  pdf.setFontSize(14);
  pdf.text(formatMoney(data.total), right - 12, y + 16, { align: "right" });

  return y + 44;
};

/**
 * Parcelas do pedido.
 *
 * A condição de pagamento ("30/60 dias") saiu daqui e foi para o cartão da
 * fábrica no topo — ela interessa antes de faturar, quando ainda não há
 * parcela. Aqui fica só o cronograma de parcelas, que só existe após o
 * faturamento; sem parcelas, não há bloco.
 */
export const drawPayment = (
  pdf: Pdf,
  installments: OrderInstallment[],
  startY: number
): number => {
  if (installments.length === 0) return startY;

  let y = startY;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setText(pdf, COLOR.muted);
  pdf.text("PARCELAS", PAGE.margin, y);
  y += 12;

  const pageW = pdf.internal.pageSize.getWidth();
  const perRow = 3;
  const gap = 10;
  const cellW = (pageW - PAGE.margin * 2 - gap * (perRow - 1)) / perRow;

  installments.forEach((installment, index) => {
    const col = index % perRow;
    const row = Math.floor(index / perRow);
    const x = PAGE.margin + col * (cellW + gap);
    const cellY = y + row * 40;

    setDraw(pdf, COLOR.line);
    pdf.roundedRect(x, cellY, cellW, 32, 3, 3, "S");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    setText(pdf, COLOR.muted);
    pdf.text(
      `${installment.sequence}ª parcela${
        installment.dueDate ? ` · ${formatDateDMY(installment.dueDate)}` : ""
      }`,
      x + 10,
      cellY + 12
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    setText(pdf, COLOR.ink);
    pdf.text(
      truncate(pdf, formatMoney(installment.amount), cellW - 20),
      x + 10,
      cellY + 25
    );
  });

  const rows = Math.ceil(installments.length / perRow);
  return y + rows * 40 + 12;
};

/** Observações digitadas no pedido, quando houver. */
export const drawNotes = (
  pdf: Pdf,
  notes: string | null,
  startY: number
): number => {
  if (!notes) return startY;

  const pageW = pdf.internal.pageSize.getWidth();
  let y = startY;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setText(pdf, COLOR.muted);
  pdf.text("OBSERVAÇÕES", PAGE.margin, y);
  y += 14;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  setText(pdf, COLOR.ink);
  const lines = pdf.splitTextToSize(notes, pageW - PAGE.margin * 2);
  pdf.text(lines, PAGE.margin, y);

  return y + lines.length * 12 + 8;
};
