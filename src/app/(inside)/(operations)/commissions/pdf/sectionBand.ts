import { formatMoney } from "@/utils/format/masks";
import {
  COLOR,
  PAGE,
  Pdf,
  setFill,
  setText,
  truncate,
} from "@/utils/pdf/theme";

const BAND_H = 26;
/**
 * A faixa mais o começo da tabela que vem embaixo dela.
 *
 * Faixa órfã no pé da página não serve a ninguém — e foi o que aconteceu na
 * primeira versão: "PREVISTO" ficava sozinho no fim de uma folha e a tabela
 * abria na seguinte, como se a seção estivesse vazia. A conta é a da própria
 * faixa (26 + 14 de respiro) somada ao bloco mínimo de uma fábrica (90).
 */
const MIN_BLOCK = 130;

export interface SectionBandData {
  title: string;
  /**
   * O recorte da seção, escrito. As seções de comissão seguem o mês; as de
   * boleto, não — e quem lê o papel precisa saber disso na própria faixa, senão
   * soma um número de mês com outro de todos os vencimentos.
   */
  scope: string;
  /** Soma da seção, à direita. Omitida nas seções que não fecham em dinheiro. */
  total?: number;
  count: number;
}

/**
 * A faixa que abre uma seção do relatório.
 *
 * O papel do mês tem cinco seções que respondem perguntas diferentes ("quanto
 * tenho a receber", "quem não pagou"), e sem uma marca forte entre elas as
 * tabelas viram uma só, com subtotais que parecem do mesmo bolo.
 */
export const drawSectionBand = (
  pdf: Pdf,
  data: SectionBandData,
  startY: number,
  onNewPage: () => number
): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const right = pageW - PAGE.margin;

  let y = startY;
  // O mesmo limite das tabelas (a faixa do rodapé ocupa os últimos 30pt).
  if (y + MIN_BLOCK > pageH - PAGE.margin - 30) y = onNewPage();

  setFill(pdf, COLOR.brandSoft);
  pdf.roundedRect(PAGE.margin, y, right - PAGE.margin, BAND_H, 3, 3, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setText(pdf, COLOR.brand);
  pdf.text(data.title, PAGE.margin + 10, y + 17);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setText(pdf, COLOR.muted);
  const scopeX = PAGE.margin + 12 + pdf.getTextWidth(data.title) + 60;
  pdf.text(
    truncate(
      pdf,
      `${data.scope} · ${data.count} parcela(s)`,
      right - scopeX - 130
    ),
    scopeX,
    y + 17
  );

  if (data.total !== undefined) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    setText(pdf, COLOR.ink);
    pdf.text(formatMoney(data.total), right - 10, y + 17, { align: "right" });
  }

  return y + BAND_H + 14;
};
