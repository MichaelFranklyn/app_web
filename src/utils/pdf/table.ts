import { COLOR, PAGE, Pdf, setDraw, setFill, setText, truncate } from "./theme";

export interface ReportColumn<T> {
  header: string;
  /** Peso da coluna: as larguras são distribuídas proporcionalmente na página. */
  width: number;
  align?: "left" | "right";
  value: (row: T) => string;
  /** Segunda linha, menor e em cinza (ex.: nome fantasia sob a razão social). */
  sub?: (row: T) => string | null;
  /** Valor em negrito — para a coluna que a pessoa procura primeiro (dinheiro). */
  bold?: boolean;
}

export interface ColumnBox {
  /** Onde o texto começa (ou termina, em coluna alinhada à direita). */
  x: number;
  /** Largura disponível para o texto, já descontado o vão entre colunas. */
  maxWidth: number;
}

/** Vão entre colunas: sem ele, um nome longo encosta no valor da coluna seguinte. */
const GUTTER = 10;
const PADDING = 10;

/**
 * Distribui as colunas na largura útil da página, proporcionalmente ao peso de
 * cada uma. Trabalhar com peso em vez de pontos deixa a mesma tabela servir em
 * retrato e paisagem — e é o que permite testar o layout sem abrir um PDF.
 */
export const layoutColumns = <T>(
  columns: ReportColumn<T>[],
  pageWidth: number
): ColumnBox[] => {
  const usable = pageWidth - PAGE.margin * 2 - PADDING * 2;
  const total = columns.reduce((sum, column) => sum + column.width, 0) || 1;

  let cursor = PAGE.margin + PADDING;
  return columns.map((column) => {
    const width = (column.width / total) * usable;
    const maxWidth = Math.max(width - GUTTER, 8);
    const box: ColumnBox =
      column.align === "right"
        ? { x: cursor + width - GUTTER, maxWidth }
        : { x: cursor, maxWidth };
    cursor += width;
    return box;
  });
};

export interface TableOptions<T> {
  columns: ReportColumn<T>[];
  rows: T[];
  startY: number;
  /** Abre página nova e devolve o `y` do topo dela. */
  onNewPage: () => number;
  /** Linha de fechamento (ex.: "TOTAL"), colada nas colunas da tabela. */
  totals?: Partial<Record<number, string>>;
  totalsLabel?: string;
}

const HEAD_H = 20;
const ROW_H = 19;
/** Linha mais alta quando alguma coluna tem segunda linha (nome + fantasia). */
const ROW_H_SUB = 25;
/** Altura da faixa de totais, reservada para ela não abrir página sozinha. */
const TOTALS_H = 24;

const drawHead = <T>(
  pdf: Pdf,
  columns: ReportColumn<T>[],
  boxes: ColumnBox[],
  y: number
): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  setFill(pdf, COLOR.ink);
  pdf.rect(PAGE.margin, y, pageW - PAGE.margin * 2, HEAD_H, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  setText(pdf, COLOR.white);

  columns.forEach((column, index) => {
    const box = boxes[index];
    pdf.text(truncate(pdf, column.header, box.maxWidth), box.x, y + 13, {
      align: column.align === "right" ? "right" : "left",
    });
  });

  return y + HEAD_H;
};

/**
 * Tabela de relatório: cabeçalho escuro, linhas zebradas e, opcionalmente, uma
 * linha de totais no fim.
 *
 * A zebra não é enfeite — numa lista de dezenas de linhas com data e dinheiro
 * nas pontas, é o que mantém o olho na mesma linha até a última coluna. O
 * cabeçalho se repete a cada página pelo mesmo motivo: sem ele, a partir da
 * segunda folha as colunas viram números sem nome.
 *
 * Devolve o `y` livre abaixo da tabela.
 */
export const drawReportTable = <T>(
  pdf: Pdf,
  { columns, rows, startY, onNewPage, totals, totalsLabel }: TableOptions<T>
): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const boxes = layoutColumns(columns, pageW);
  const limit = pageH - PAGE.margin - 30;
  const hasSub = columns.some((column) => column.sub);
  const rowHeight = hasSub ? ROW_H_SUB : ROW_H;

  let y = drawHead(pdf, columns, boxes, startY);

  rows.forEach((row, index) => {
    // A última linha reserva também a faixa de totais: sem isso, uma tabela que
    // termina no pé da página empurra o total sozinho para a folha seguinte.
    const needed =
      rowHeight + (totals && index === rows.length - 1 ? TOTALS_H + 10 : 0);

    if (y + needed > limit) {
      y = drawHead(pdf, columns, boxes, onNewPage());
    }

    if (index % 2 === 1) {
      setFill(pdf, COLOR.zebra);
      pdf.rect(PAGE.margin, y, pageW - PAGE.margin * 2, rowHeight, "F");
    }

    const textY = y + (hasSub ? 11 : 12.5);

    columns.forEach((column, columnIndex) => {
      const box = boxes[columnIndex];
      const align = column.align === "right" ? "right" : "left";

      pdf.setFont("helvetica", column.bold ? "bold" : "normal");
      pdf.setFontSize(8.5);
      setText(pdf, COLOR.ink);
      pdf.text(truncate(pdf, column.value(row), box.maxWidth), box.x, textY, {
        align,
      });

      const sub = column.sub?.(row);
      if (sub) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        setText(pdf, COLOR.muted);
        pdf.text(truncate(pdf, sub, box.maxWidth), box.x, textY + 9, { align });
      }
    });

    y += rowHeight;
  });

  if (!totals) return y + 10;

  // Linha de fechamento: mesma grade das colunas, para o total cair exatamente
  // sob os valores que ele soma.
  if (y + TOTALS_H + 2 > limit) y = onNewPage();

  setDraw(pdf, COLOR.line);
  pdf.line(PAGE.margin, y, pageW - PAGE.margin, y);

  setFill(pdf, COLOR.brandSoft);
  pdf.rect(PAGE.margin, y, pageW - PAGE.margin * 2, TOTALS_H, "F");

  const totalsY = y + 16;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setText(pdf, COLOR.ink);
  if (totalsLabel) pdf.text(totalsLabel, boxes[0].x, totalsY);

  columns.forEach((column, index) => {
    const value = totals[index];
    if (!value) return;
    const box = boxes[index];
    pdf.text(truncate(pdf, value, box.maxWidth), box.x, totalsY, {
      align: column.align === "right" ? "right" : "left",
    });
  });

  return y + 34;
};
