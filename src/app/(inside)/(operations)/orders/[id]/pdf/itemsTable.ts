import { formatMoney, formatNumber } from "@/utils/format/masks";
import { OrderItem } from "../interface";
import { taxRatesLabel } from "../utils";
import { COLOR, PAGE, Pdf, setFill, setText, truncate } from "./theme";

// Linha um pouco mais alta para caber, na coluna de imposto, a alíquota em cima
// e o valor embaixo (igual à tabela de itens na tela).
const ROW_H = 24;
const HEAD_H = 22;

const formatQty = (value: string) =>
  Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

interface Columns {
  code: number;
  codeMax: number;
  product: number;
  qty: number;
  price: number;
  discount: number;
  tax: number;
  taxMax: number;
  subtotal: number;
  productMax: number;
}

/** Largura reservada à coluna de código (o landscape sobra espaço p/ ela). */
const CODE_MAX = 88;
/** Largura para o rótulo de alíquotas (ex.: "ST 12,00% + FCP 2,00%"). */
const TAX_MAX = 84;

const columnsOf = (pageW: number): Columns => {
  const subtotal = pageW - PAGE.margin - 10;
  const tax = subtotal - 100;
  const discount = tax - TAX_MAX - 8;
  const price = discount - 80;
  const qty = price - 62;
  const code = PAGE.margin + 10;
  const product = code + CODE_MAX + 14;
  return {
    code,
    codeMax: CODE_MAX,
    product,
    qty,
    price,
    discount,
    tax,
    taxMax: TAX_MAX,
    subtotal,
    productMax: qty - product - 22,
  };
};

const drawHead = (pdf: Pdf, cols: Columns, y: number): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  setFill(pdf, COLOR.ink);
  pdf.rect(PAGE.margin, y, pageW - PAGE.margin * 2, HEAD_H, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  setText(pdf, COLOR.white);
  const textY = y + 14;
  pdf.text("CÓDIGO", cols.code, textY);
  pdf.text("PRODUTO", cols.product, textY);
  pdf.text("QTD", cols.qty, textY, { align: "right" });
  pdf.text("PREÇO UN.", cols.price, textY, { align: "right" });
  pdf.text("DESC.", cols.discount, textY, { align: "right" });
  pdf.text("IMPOSTO", cols.tax, textY, { align: "right" });
  pdf.text("SUBTOTAL", cols.subtotal, textY, { align: "right" });

  return y + HEAD_H;
};

export interface ItemsTableResult {
  y: number;
}

/**
 * Tabela dos itens, com cabeçalho escuro e linhas zebradas — numa lista longa,
 * a zebra é o que mantém o olho na mesma linha até a coluna do subtotal.
 *
 * Quebra de página repete o cabeçalho; `onNewPage` deixa o chamador redesenhar
 * o rodapé/moldura da página nova.
 */
export const drawItemsTable = (
  pdf: Pdf,
  items: OrderItem[],
  startY: number,
  onNewPage: () => number
): ItemsTableResult => {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const cols = columnsOf(pageW);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setText(pdf, COLOR.muted);
  pdf.text("ITENS", PAGE.margin, startY);
  let y = drawHead(pdf, cols, startY + 8);

  pdf.setFontSize(9);
  items.forEach((item, index) => {
    if (y > pageH - PAGE.margin - 90) {
      y = onNewPage();
      y = drawHead(pdf, cols, y);
      pdf.setFontSize(9);
    }

    if (index % 2 === 1) {
      setFill(pdf, COLOR.zebra);
      pdf.rect(PAGE.margin, y, pageW - PAGE.margin * 2, ROW_H, "F");
    }

    const textY = y + 15;
    const name = item.product?.name ?? "Produto";

    // Baseline da linha: fonte normal 9 (a coluna de imposto muda e restaura).
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    // Código na coluna própria (apagado, como um identificador secundário).
    setText(pdf, COLOR.muted);
    pdf.text(
      truncate(pdf, item.product?.sku ?? "—", cols.codeMax),
      cols.code,
      textY
    );

    setText(pdf, COLOR.ink);
    pdf.text(truncate(pdf, name, cols.productMax), cols.product, textY);

    pdf.text(formatQty(item.unitsTotal), cols.qty, textY, { align: "right" });
    pdf.text(formatMoney(item.unitPrice), cols.price, textY, {
      align: "right",
    });
    pdf.text(
      Number(item.discount) > 0 ? formatMoney(item.discount) : "—",
      cols.discount,
      textY,
      { align: "right" }
    );

    // Imposto da linha: alíquotas por cima (nome + %), valor embaixo — como na
    // tela. Sem imposto na linha, um traço no lugar.
    if (Number(item.taxAmount) > 0) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      setText(pdf, COLOR.muted);
      pdf.text(
        truncate(
          pdf,
          taxRatesLabel(item.product?.taxes, formatNumber),
          cols.taxMax
        ),
        cols.tax,
        y + 9,
        { align: "right" }
      );
      pdf.setFontSize(8.5);
      setText(pdf, COLOR.ink);
      pdf.text(formatMoney(item.taxAmount), cols.tax, y + 19, {
        align: "right",
      });
    } else {
      setText(pdf, COLOR.muted);
      pdf.text("—", cols.tax, textY, { align: "right" });
    }

    // Subtotal da linha COM o imposto embutido (mesma conta da tela): assim a
    // coluna soma para o "Subtotal" do resumo.
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    setText(pdf, COLOR.ink);
    pdf.text(
      formatMoney(Number(item.subtotal) + Number(item.taxAmount)),
      cols.subtotal,
      textY,
      { align: "right" }
    );

    y += ROW_H;
  });

  if (items.length === 0) {
    pdf.setFont("helvetica", "italic");
    setText(pdf, COLOR.muted);
    pdf.text("Nenhum item adicionado.", cols.product, y + 14);
    y += ROW_H;
  }

  return { y: y + 4 };
};
