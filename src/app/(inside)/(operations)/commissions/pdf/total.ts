import { monthLabel } from "@/utils/format/month";
import { formatMoney } from "@/utils/format/masks";
import { COLOR, PAGE, Pdf, setDraw, setFill, setText } from "@/utils/pdf/theme";

import { NextMonthPreview } from "../utils";

const TOTAL_H = 34;
const TOTAL_W = 300;
const LINE_H = 16;
/**
 * O fechamento inteiro: as duas parcelas, a faixa, a nota do previsto e a
 * prévia do mês seguinte — que é o que decide se o bloco cabe no pé da página.
 */
const BLOCK_H = LINE_H * 2 + TOTAL_H + 62;

export interface MonthTotals {
  receivable: number;
  received: number;
  /** Não entra no total: ainda depende de a fábrica faturar ou o cliente pagar. */
  pending: number;
  /** O que as mesmas linhas já prometem para o próximo fechamento. */
  next: NextMonthPreview;
}

/**
 * O fechamento do mês, no fim do documento.
 *
 * Mostra as duas parcelas que somam — o que ainda há a receber e o que já
 * entrou — e o total delas em destaque. O previsto sai depois, em cinza e fora
 * da conta: ele não é dinheiro de ninguém ainda, e somá-lo faria o papel
 * prometer um mês maior do que o que a fábrica vai pagar.
 *
 * Por último vem o MÊS SEGUINTE, que é a pergunta que se faz assim que o mês
 * fecha. Ele fecha o documento com a mesma disciplina do total: o firme em
 * destaque, o previsto ao lado e escrito que ainda pode crescer — a comissão
 * nasce com data de recebimento no faturamento, então o número de hoje é um
 * piso, não uma promessa.
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
  y += 20;

  const { next } = totals;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, COLOR.ink);
  pdf.text(
    `Próximo mês (${monthLabel(next.month)}): ${formatMoney(next.receivable)}`,
    right,
    y,
    { align: "right" }
  );
  y += 12;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setText(pdf, COLOR.muted);
  // Zero aqui quase nunca é "vou receber zero": é um mês que ainda não foi
  // faturado. Dizer isso evita o susto de quem lê o papel no dia 1º.
  pdf.text(
    next.count === 0
      ? "Nada lançado para o próximo mês até agora — o que for faturado daqui para frente entra nele."
      : `já lançado até hoje${next.pending > 0 ? `, mais ${formatMoney(next.pending)} previsto` : ""} — o mês ainda pode crescer com o que for faturado.`,
    right,
    y,
    { align: "right" }
  );

  return y + 12;
};
