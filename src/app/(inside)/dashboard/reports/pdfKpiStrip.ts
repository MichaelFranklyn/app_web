import {
  COLOR,
  PAGE,
  Pdf,
  setDraw,
  setText,
  truncate,
} from "@/utils/pdf/theme";

import { ReportKpi } from "./interface";

/** Altura da faixa e folga até a tabela. */
const STRIP_H = 42;
const GAP = 16;
/** Quatro por linha: é o que caberia legível na largura útil do A4 paisagem. */
const PER_ROW = 4;

/**
 * Escreve os números de fechamento do relatório antes da tabela — os mesmos
 * cartões que a tela mostra em cima.
 *
 * O papel precisa deles pelo motivo que a tela precisa: quem confere começa pelo
 * total e só desce à linha quando ele não bate. Sem a faixa, o total só existiria
 * somando a coluna à mão.
 *
 * Devolve o `y` livre abaixo da faixa (o próprio `y` recebido, se não há KPI).
 */
export const drawKpiStrip = (
  pdf: Pdf,
  kpis: ReportKpi[],
  y: number
): number => {
  if (kpis.length === 0) return y;

  const pageW = pdf.internal.pageSize.getWidth();
  const usable = pageW - PAGE.margin * 2;
  let cursor = y;

  for (let start = 0; start < kpis.length; start += PER_ROW) {
    const row = kpis.slice(start, start + PER_ROW);
    const width = usable / row.length;

    row.forEach((kpi, index) => {
      const x = PAGE.margin + index * width;
      const maxWidth = width - 12;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      setText(pdf, COLOR.muted);
      pdf.text(
        truncate(pdf, kpi.label.toUpperCase(), maxWidth),
        x,
        cursor + 10
      );

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      setText(pdf, COLOR.ink);
      pdf.text(truncate(pdf, kpi.value, maxWidth), x, cursor + 28);

      if (kpi.hint) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        setText(pdf, COLOR.muted);
        pdf.text(truncate(pdf, kpi.hint, maxWidth), x, cursor + 38);
      }
    });

    cursor += STRIP_H;
  }

  setDraw(pdf, COLOR.line);
  pdf.line(PAGE.margin, cursor + 4, pageW - PAGE.margin, cursor + 4);

  return cursor + GAP;
};
