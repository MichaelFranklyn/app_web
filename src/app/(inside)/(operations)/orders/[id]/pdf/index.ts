import { factoryName } from "@/utils/company";
import { formatDateDMY } from "@/utils/format/masks";
import { trimTransparent } from "@/utils/image";
import { loadImage } from "@/utils/media";
import type { LoadedImage } from "@/utils/media";
import { contentBottom, drawFooters, loadGirusLogo } from "@/utils/pdf/footer";
import { PAGE } from "@/utils/pdf/theme";
import { OrderDetail, OrderItem } from "../interface";
import { paymentTermLabel } from "../../../_shared/orderPaymentTerms";
import { clientCard, factoryCard } from "./cards";
import { drawHeader } from "./header";
import { drawItemsTable } from "./itemsTable";
import { drawParties } from "./parties";
import {
  drawNotes,
  drawPayment,
  drawTotals,
  notesHeight,
  paymentHeight,
  totalsHeight,
} from "./summary";

export interface PdfBranding {
  companyLogoUrl?: string | null;
  companyName?: string | null;
  /**
   * Inclui a foto de cada produto numa coluna à esquerda.
   *
   * Fica desligado por padrão: baixar dezenas de imagens e embuti-las engorda o
   * arquivo e demora (a geração é toda no navegador). Vale quando o documento
   * vai ao cliente e o que importa é ele reconhecer o produto.
   */
  withPhotos?: boolean;
}

const isQuote = (status: string) => status === "DRAFT" || status === "SENT";

/** Baixa as fotos dos produtos do pedido, indexadas pelo id do produto. */
const loadItemPhotos = async (
  items: OrderItem[]
): Promise<Map<string, LoadedImage>> => {
  const withImage = items.filter((item) => item.product?.imageUrl);
  const loaded = await Promise.all(
    withImage.map(async (item) => {
      const image = await loadImage(item.product!.imageUrl);
      return [item.product!.id, image] as const;
    })
  );
  return new Map(
    loaded.filter((entry): entry is [string, LoadedImage] => Boolean(entry[1]))
  );
};

/**
 * Gera e baixa o PDF de um pedido (ou orçamento) para o vendedor compartilhar
 * com o cliente.
 *
 * O documento é a cara da representação na mão do cliente: leva a logo da
 * empresa e a da fábrica no topo, os dados das duas partes, os itens, os
 * totais, as parcelas e a marca do sistema no rodapé. Cada logo é opcional —
 * falha de download não impede a emissão.
 */
export const exportOrderPdf = async (
  order: OrderDetail,
  items: OrderItem[],
  branding: PdfBranding = {}
): Promise<void> => {
  // Import dinâmico: jspdf é client-only e pesado; fora do bundle inicial/SSR.
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  // O recorte da moldura transparente é o que faz as duas logos do topo
  // aparecerem do mesmo tamanho (ver trimTransparent).
  const [companyLogo, factoryLogo, girusLogo] = await Promise.all(
    [
      loadImage(branding.companyLogoUrl),
      loadImage(order.factory?.logoUrl),
      loadGirusLogo(),
    ].map((pending) => pending.then(trimTransparent))
  );

  // Uma requisição por produto com foto; falha individual só tira a miniatura
  // daquela linha. Roda em paralelo para não somar as latências.
  const photos = branding.withPhotos ? await loadItemPhotos(items) : undefined;

  const quote = isQuote(order.status);
  const docKind = quote ? "Orçamento" : "Pedido";
  const number = order.id.slice(0, 8).toUpperCase();

  let y = drawHeader(pdf, {
    docKind,
    number,
    issuedAt: formatDateDMY(order.orderDate),
    companyName: branding.companyName ?? null,
    companyLogo,
    factoryName: factoryName(order.factory),
    factoryLogo,
  });

  const paymentLabel = order.paymentTerm
    ? paymentTermLabel(order.paymentTerm)
    : null;

  y = drawParties(
    pdf,
    [factoryCard(order, paymentLabel), clientCard(order)],
    y
  );

  // Página nova durante a tabela: o cabeçalho completo não se repete (poluiria);
  // basta a margem superior, e o rodapé é desenhado no fim para todas.
  const startNewPage = () => {
    pdf.addPage();
    return PAGE.margin;
  };

  y = drawItemsTable(pdf, items, y, startNewPage, photos).y;

  // Cada bloco depois da tabela sai INTEIRO na página: se não cabe no que
  // sobrou, vai para a próxima. Sem isto, com os itens terminando no pé da
  // folha (o caso comum da versão com fotos, de linhas altas), o TOTAL era
  // desenhado por cima do rodapé e das últimas linhas.
  const fit = (height: number) =>
    height > 0 && y + height > contentBottom(pdf) ? startNewPage() : y;

  // Mesma decomposição do resumo financeiro na tela (OrderSummaryCard):
  // `totalAmount` é a mercadoria NUA, `taxAmount` é o ST que o preço embute e o
  // IPI vem por cima. O TOTAL é o valor a pagar, que é o que o cliente procura.
  const taxAmount = Number(order.taxAmount ?? 0);
  const ipiAmount = Number(order.ipiAmount || 0);
  const totals = {
    merchandise: order.totalAmount,
    taxAmount: taxAmount.toFixed(2),
    ipiAmount: ipiAmount.toFixed(2),
    total: Number(order.totalAmount) + taxAmount + ipiAmount,
  };
  y = fit(totalsHeight(totals));
  y = drawTotals(pdf, totals, y);

  const installments = order.installments ?? [];
  y = fit(paymentHeight(installments));
  y = drawPayment(pdf, installments, y);

  y = fit(notesHeight(pdf, order.notes));
  drawNotes(pdf, order.notes, y);

  drawFooters(pdf, girusLogo);

  pdf.save(`${docKind.toLowerCase()}-${number}.pdf`);
};
