import { formatMoney, formatNumber } from "@/utils/format/masks";
import type { LoadedImage } from "@/utils/media";
import { OrderItem } from "../interface";
import { taxRatesLabel } from "../utils";
import {
  COLOR,
  PAGE,
  Pdf,
  setFill,
  setText,
  truncate,
  wrapLines,
} from "@/utils/pdf/theme";

// Linha um pouco mais alta para caber, na coluna de imposto, a alíquota em cima
// e o valor embaixo (igual à tabela de itens na tela).
const ROW_H = 24;
// Na versão ilustrada a linha cresce para caber a miniatura quadrada. A foto é
// o que o cliente olha para reconhecer a peça, então ela pede um pouco mais de
// papel do que o mínimo — a linha acompanha, senão a miniatura encosta na de cima.
//
// 72pt (~2,5 cm) é o maior tamanho que NÃO custa linhas por página: com a altura
// de linha resultante ainda cabem 6 itens nas páginas cheias, as mesmas de quando
// a miniatura media 48pt. Passar de 72 derruba para 5 e estica o documento.
const PHOTO_SIZE = 72;
const PHOTO_ROW_H = PHOTO_SIZE + 8;
/** Entrelinha do nome do produto quando ele ocupa duas linhas. */
const NAME_LINE_H = 11;
/** Faixa reservada à miniatura à esquerda do código. */
const PHOTO_COL = PHOTO_SIZE + 10;
const HEAD_H = 22;

const formatQty = (value: string) =>
  Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

interface Columns {
  photo: number;
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

const columnsOf = (pageW: number, withPhotos: boolean): Columns => {
  const subtotal = pageW - PAGE.margin - 10;
  const tax = subtotal - 100;
  const discount = tax - TAX_MAX - 8;
  const price = discount - 80;
  const qty = price - 62;
  const photo = PAGE.margin + 10;
  const code = withPhotos ? photo + PHOTO_COL : photo;
  const product = code + CODE_MAX + 14;
  return {
    photo,
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

const drawHead = (
  pdf: Pdf,
  cols: Columns,
  y: number,
  withPhotos: boolean
): number => {
  const pageW = pdf.internal.pageSize.getWidth();
  setFill(pdf, COLOR.ink);
  pdf.rect(PAGE.margin, y, pageW - PAGE.margin * 2, HEAD_H, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  setText(pdf, COLOR.white);
  const textY = y + 14;
  if (withPhotos) pdf.text("FOTO", cols.photo, textY);
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
 * Desenha a miniatura encaixada num quadrado, sem distorcer a foto: a menor
 * escala manda e a imagem fica centrada na célula.
 */
const drawPhoto = (
  pdf: Pdf,
  photo: LoadedImage,
  x: number,
  rowY: number
): void => {
  const scale = Math.min(PHOTO_SIZE / photo.width, PHOTO_SIZE / photo.height);
  const w = photo.width * scale;
  const h = photo.height * scale;
  pdf.addImage(
    photo.dataUrl,
    x + (PHOTO_SIZE - w) / 2,
    rowY + (PHOTO_ROW_H - h) / 2,
    w,
    h
  );
};

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
  onNewPage: () => number,
  photos?: Map<string, LoadedImage>
): ItemsTableResult => {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  // Sem nenhuma foto carregada a coluna não abre: reservar a faixa e deixá-la
  // vazia só espremeria o nome do produto.
  const withPhotos = Boolean(photos && photos.size > 0);
  const cols = columnsOf(pageW, withPhotos);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setText(pdf, COLOR.muted);
  pdf.text("ITENS", PAGE.margin, startY);
  let y = drawHead(pdf, cols, startY + 8, withPhotos);

  pdf.setFontSize(9);
  items.forEach((item, index) => {
    if (y > pageH - PAGE.margin - 90) {
      y = onNewPage();
      y = drawHead(pdf, cols, y, withPhotos);
      pdf.setFontSize(9);
    }

    // Baseline da linha: fonte normal 9 (a coluna de imposto muda e restaura).
    // Vem antes de medir o nome: `wrapLines` mede na fonte CORRENTE.
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    const name = item.product?.name ?? "Produto";
    const nameLines = wrapLines(pdf, name, cols.productMax, 2);
    // A linha cresce com o nome: sem isso a segunda linha de um nome longo
    // encostaria na linha de baixo e escaparia da faixa zebrada.
    const rowH = withPhotos
      ? PHOTO_ROW_H
      : Math.max(ROW_H, nameLines.length * NAME_LINE_H + 10);

    if (index % 2 === 1) {
      setFill(pdf, COLOR.zebra);
      pdf.rect(PAGE.margin, y, pageW - PAGE.margin * 2, rowH, "F");
    }

    // O texto fica centrado na altura da linha, que muda com a miniatura.
    const textY = y + (withPhotos ? PHOTO_ROW_H / 2 + 3 : rowH / 2 + 3);

    if (withPhotos) {
      const photo = photos?.get(item.product?.id ?? "");
      if (photo) drawPhoto(pdf, photo, cols.photo, y);
    }

    // Código na coluna própria (apagado, como um identificador secundário).
    setText(pdf, COLOR.muted);
    pdf.text(
      truncate(pdf, item.product?.sku ?? "—", cols.codeMax),
      cols.code,
      textY
    );

    // Nome em até duas linhas: cortar tudo na primeira esconderia o fim, que é
    // onde mora a medida que separa uma peça da outra. As linhas ficam centradas
    // no mesmo eixo do resto da linha.
    setText(pdf, COLOR.ink);
    const nameY = textY - ((nameLines.length - 1) * NAME_LINE_H) / 2;
    nameLines.forEach((line, lineIndex) => {
      pdf.text(line, cols.product, nameY + lineIndex * NAME_LINE_H);
    });

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
        textY - 6,
        { align: "right" }
      );
      pdf.setFontSize(8.5);
      setText(pdf, COLOR.ink);
      pdf.text(formatMoney(item.taxAmount), cols.tax, textY + 4, {
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

    y += rowH;
  });

  if (items.length === 0) {
    pdf.setFont("helvetica", "italic");
    setText(pdf, COLOR.muted);
    pdf.text("Nenhum item adicionado.", cols.product, y + 14);
    y += withPhotos ? PHOTO_ROW_H : ROW_H;
  }

  return { y: y + 4 };
};
