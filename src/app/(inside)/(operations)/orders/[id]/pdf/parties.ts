import { COLOR, PAGE, Pdf, setDraw, setText, truncate } from "./theme";

export interface PartyCard {
  title: string;
  lines: string[];
}

const CARD_GAP = 16;
const PADDING = 12;
const LINE_H = 13;
/** Razão social costuma ser longa; até 2 linhas antes de cortar. */
const NAME_MAX_LINES = 2;

interface PreparedCard {
  title: string;
  /** Nome quebrado em até duas linhas. */
  nameLines: string[];
  details: string[];
}

const prepare = (pdf: Pdf, card: PartyCard, width: number): PreparedCard => {
  const [name = "", ...details] = card.lines;
  const inner = width - PADDING * 2;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  const wrapped: string[] = pdf.splitTextToSize(name, inner);
  const nameLines = wrapped.slice(0, NAME_MAX_LINES);
  // Estourou o limite: a última linha exibida ganha as reticências.
  if (wrapped.length > NAME_MAX_LINES) {
    nameLines[NAME_MAX_LINES - 1] = truncate(
      pdf,
      `${nameLines[NAME_MAX_LINES - 1]}…`,
      inner
    );
  }

  return { title: card.title, nameLines, details };
};

/**
 * Dois cartões lado a lado (fábrica e cliente). Blocos com moldura separam as
 * partes do negócio melhor do que a lista corrida de "rótulo: valor" que o
 * documento tinha antes.
 */
export const drawParties = (
  pdf: Pdf,
  cards: [PartyCard, PartyCard],
  startY: number
): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const usable = pageW - PAGE.margin * 2;
  const cardW = (usable - CARD_GAP) / 2;

  const prepared = cards.map((card) => prepare(pdf, card, cardW));
  // Os dois cartões compartilham a altura do maior: desalinhados, parecem erro.
  const maxLines = Math.max(
    ...prepared.map((card) => card.nameLines.length + card.details.length)
  );
  const cardH = PADDING * 2 + 14 + maxLines * LINE_H;

  prepared.forEach((card, index) => {
    const x = PAGE.margin + index * (cardW + CARD_GAP);

    setDraw(pdf, COLOR.line);
    pdf.roundedRect(x, startY, cardW, cardH, 4, 4, "S");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    setText(pdf, COLOR.brand);
    pdf.text(card.title.toUpperCase(), x + PADDING, startY + PADDING + 4);

    let lineY = startY + PADDING + 20;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    setText(pdf, COLOR.ink);
    card.nameLines.forEach((line) => {
      pdf.text(line, x + PADDING, lineY);
      lineY += LINE_H;
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    setText(pdf, COLOR.muted);
    card.details.forEach((line) => {
      pdf.text(truncate(pdf, line, cardW - PADDING * 2), x + PADDING, lineY);
      lineY += LINE_H;
    });
  });

  return startY + cardH + 26;
};
