import { factoryName } from "@/utils/company";
import { formatDateDMY } from "@/utils/format/masks";
import { trimTransparent } from "@/utils/image";
import { loadImage } from "@/utils/media";
import { drawFooters, loadGirusLogo } from "@/utils/pdf/footer";
import { PAGE } from "@/utils/pdf/theme";
import { OrderDetail, OrderItem } from "../interface";
import { paymentTermLabel } from "../utils";
import { clientCard, factoryCard } from "./cards";
import { drawHeader } from "./header";
import { drawItemsTable } from "./itemsTable";
import { drawParties } from "./parties";
import { drawNotes, drawPayment, drawTotals } from "./summary";

export interface PdfBranding {
  companyLogoUrl?: string | null;
  companyName?: string | null;
}

const isQuote = (status: string) => status === "DRAFT" || status === "SENT";

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

  y = drawItemsTable(pdf, items, y, startNewPage).y;

  // Mesma conta do resumo financeiro na tela (OrderSummaryCard): o subtotal já
  // embute o imposto (ST) — como a coluna Subtotal dos itens — e o total final
  // soma o IPI por cima. O cliente quer o valor a pagar.
  const subtotalWithTax =
    Number(order.totalAmount) + Number(order.taxAmount ?? 0);
  y = drawTotals(
    pdf,
    {
      subtotal: subtotalWithTax.toFixed(2),
      ipiAmount: order.ipiAmount,
      total: subtotalWithTax + Number(order.ipiAmount || 0),
    },
    y
  );

  y = drawPayment(pdf, order.installments ?? [], y);

  drawNotes(pdf, order.notes, y);

  drawFooters(pdf, girusLogo);

  pdf.save(`${docKind.toLowerCase()}-${number}.pdf`);
};
