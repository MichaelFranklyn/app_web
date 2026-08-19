import { clientName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import {
  COLOR,
  PAGE,
  Pdf,
  setDraw,
  setFill,
  setText,
  truncate,
} from "@/utils/pdf/theme";
import { ReceivableFactoryGroup } from "../utils";

const ROW_H = 18;
const HEAD_H = 20;
/** Espaço mínimo para não abrir uma fábrica no pé da página. */
const MIN_BLOCK = 90;

export interface Columns {
  client: number;
  clientMax: number;
  order: number;
  invoice: number;
  invoiceMax: number;
  sequence: number;
  date: number;
  amount: number;
}

/**
 * Colunas do A4 retrato: cliente à esquerda, dinheiro colado na direita. Os
 * vãos são medidos pelo pior caso de cada coluna (valor na casa dos milhares,
 * data completa) — com folga menor, o valor encostava na data.
 *
 * A nota fica entre o pedido e a parcela porque é por ela que a fábrica
 * identifica o repasse na planilha dela: quem confere lê "cliente, nota,
 * quanto". O espaço dela saiu do nome do cliente, que tinha folga de sobra.
 */
export const columnsOf = (pageW: number): Columns => {
  const amount = pageW - PAGE.margin - 10;
  const date = amount - 120;
  const sequence = date - 20;
  const invoice = sequence - 72;
  const order = invoice - 62;
  const client = PAGE.margin + 10;
  return {
    client,
    clientMax: order - client - 12,
    order,
    invoice,
    invoiceMax: sequence - invoice - 14,
    sequence,
    date,
    amount,
  };
};

const drawHead = (pdf: Pdf, cols: Columns, y: number): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  setFill(pdf, COLOR.ink);
  pdf.rect(PAGE.margin, y, pageW - PAGE.margin * 2, HEAD_H, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  setText(pdf, COLOR.white);
  const textY = y + 13;
  pdf.text("CLIENTE", cols.client, textY);
  pdf.text("PEDIDO", cols.order, textY);
  pdf.text("NOTA", cols.invoice, textY);
  pdf.text("PARC.", cols.sequence, textY, { align: "right" });
  pdf.text("RECEBER EM", cols.date, textY);
  pdf.text("COMISSÃO", cols.amount, textY, { align: "right" });

  return y + HEAD_H;
};

/**
 * Bloco de uma fábrica: nome, tabela das parcelas a receber e o subtotal dela.
 * A fábrica é a unidade de cobrança — cada uma manda a sua planilha e paga
 * separado, então o subtotal por fábrica é o número que o gestor compara.
 *
 * Quebra de página repete o cabeçalho da tabela; `onNewPage` devolve o `y` do
 * topo da página nova.
 */
export const drawFactorySection = (
  pdf: Pdf,
  group: ReceivableFactoryGroup,
  startY: number,
  onNewPage: () => number
): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const cols = columnsOf(pageW);
  const limit = pageH - PAGE.margin - 30;

  // Abre a tabela: nome da fábrica + cabeçalho das colunas. Na virada de
  // página o nome se repete com "(continuação)" — sem ele, a segunda página
  // seria uma tabela sem dono, e quem confere não sabe de qual planilha é.
  const openTable = (top: number, continued: boolean): number => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    setText(pdf, COLOR.ink);
    const title = continued
      ? `${group.name.toUpperCase()} (continuação)`
      : group.name.toUpperCase();
    pdf.text(truncate(pdf, title, 380), PAGE.margin, top);
    return drawHead(pdf, cols, top + 8);
  };

  let y = startY;
  if (y + MIN_BLOCK > limit) y = onNewPage();

  y = openTable(y, false);

  group.rows.forEach((row, index) => {
    if (y + ROW_H > limit) {
      y = openTable(onNewPage() + 10, true);
    }

    if (index % 2 === 1) {
      setFill(pdf, COLOR.zebra);
      pdf.rect(PAGE.margin, y, pageW - PAGE.margin * 2, ROW_H, "F");
    }

    const textY = y + 12;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);

    setText(pdf, COLOR.ink);
    pdf.text(
      truncate(pdf, clientName(row.client), cols.clientMax),
      cols.client,
      textY
    );

    setText(pdf, COLOR.muted);
    pdf.text(row.orderId.slice(0, 8).toUpperCase(), cols.order, textY);
    // Pedido faturado antes de a nota chegar sai com o traço: o papel diz que
    // falta o dado, em vez de deixar a célula vazia e parecer erro de impressão.
    pdf.text(
      truncate(pdf, row.invoiceNumber ?? "—", cols.invoiceMax),
      cols.invoice,
      textY
    );
    pdf.text(String(row.sequence), cols.sequence, textY, { align: "right" });
    pdf.text(
      formatDateDMY(row.receiveDate ?? undefined) || "—",
      cols.date,
      textY
    );

    pdf.setFont("helvetica", "bold");
    setText(pdf, COLOR.ink);
    pdf.text(formatMoney(row.amount), cols.amount, textY, { align: "right" });

    y += ROW_H;
  });

  // Subtotal da fábrica, encostado na coluna de dinheiro.
  setDraw(pdf, COLOR.line);
  pdf.line(PAGE.margin, y, pageW - PAGE.margin, y);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  setText(pdf, COLOR.muted);
  pdf.text(
    truncate(pdf, `SUBTOTAL ${group.name.toUpperCase()}`, 240),
    cols.date,
    y + 13,
    { align: "right" }
  );
  setText(pdf, COLOR.ink);
  pdf.setFontSize(10);
  pdf.text(formatMoney(group.subtotal), cols.amount, y + 13, {
    align: "right",
  });

  return y + 34;
};
