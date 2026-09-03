import { formatMoney } from "@/utils/format/masks";
import { COLOR, PAGE, Pdf, setDraw, setFill, setText } from "@/utils/pdf/theme";

const TOTAL_H = 34;
const TOTAL_W = 300;
const LINE_H = 16;
/** O fechamento inteiro: as duas parcelas, a faixa e a nota do previsto. */
const BLOCK_H = LINE_H * 2 + TOTAL_H + 30;

export interface MonthTotals {
  receivable: number;
  received: number;
  /** Não entra no total: ainda depende de a fábrica faturar ou o cliente pagar. */
  pending: number;
}

/**
 * O fechamento do mês, no fim do documento.
 *
 * Mostra as duas parcelas que somam — o que ainda há a receber e o que já
 * entrou — e o total delas em destaque. O previsto sai por último, em cinza e
 * fora da conta: ele não é dinheiro de ninguém ainda, e somá-lo faria o papel
 * prometer um mês maior do que o que a fábrica vai pagar.
 */
export const drawMonthTotal = (
  pdf: Pdf,
  totals: MonthTotals,
  startY: number,
  onNewPage: () => number
): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const right = pageW - PAGE.margin;
  const left = right - TOTAL_W;

  let y = startY + 6;
  // O fechamento não pode ficar órfão colado no rodapé.
  if (y + BLOCK_H > pageH - PAGE.margin - 20) y = onNewPage();

  const line = (label: string, value: number) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    setText(pdf, COLOR.muted);
    pdf.text(label, left + 12, y + 11);
    pdf.setFont("helvetica", "bold");
    setText(pdf, COLOR.ink);
    pdf.text(formatMoney(value), right - 12, y + 11, { align: "right" });
    y += LINE_H;
  };

  line("A receber das fábricas", totals.receivable);
  line("Já recebido no mês", totals.received);

  setDraw(pdf, COLOR.line);
  pdf.line(left, y, right, y);
  y += 6;

  setFill(pdf, COLOR.brand);
  pdf.roundedRect(left, y, TOTAL_W, TOTAL_H, 4, 4, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, COLOR.white);
  pdf.text("TOTAL DO MÊS", left + 12, y + 21);
  pdf.setFontSize(14);
  pdf.text(
    formatMoney(totals.receivable + totals.received),
    right - 12,
    y + 22,
    {
      align: "right",
    }
  );
  y += TOTAL_H + 14;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setText(pdf, COLOR.muted);
  pdf.text(
    `Previsto ${formatMoney(totals.pending)} — depende do faturamento e não entra no total.`,
    right,
    y,
    { align: "right" }
  );

  return y + 12;
};
