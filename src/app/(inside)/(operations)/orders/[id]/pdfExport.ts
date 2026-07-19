import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { OrderDetail, OrderItem } from "./interface";

const MARGIN = 40;
const INK = 30;
const MUTED = 120;
const LINE = 210;

const isQuote = (status: string) => status === "DRAFT" || status === "SENT";

const formatQty = (value: string) =>
  Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

const truncate = (
  pdf: import("jspdf").jsPDF,
  text: string,
  maxWidth: number
): string => {
  if (pdf.getTextWidth(text) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && pdf.getTextWidth(`${out}…`) > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
};

/**
 * Gera e baixa o PDF de um pedido (ou orçamento) para o vendedor compartilhar
 * com o cliente: cabeçalho com fábrica/cliente/vendedor, tabela de itens e os
 * totais. O documento se chama "Orçamento" ou "Pedido" conforme o status.
 */
export const exportOrderPdf = async (
  order: OrderDetail,
  items: OrderItem[]
): Promise<void> => {
  // Import dinâmico: jspdf é client-only e pesado; fora do bundle inicial/SSR.
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const quote = isQuote(order.status);
  const docKind = quote ? "Orçamento" : "Pedido";
  const number = order.id.slice(0, 8).toUpperCase();

  // Colunas da tabela (as numéricas alinhadas à direita).
  const xSubtotal = pageW - MARGIN;
  const xDiscount = xSubtotal - 95;
  const xPrice = xDiscount - 80;
  const xQty = xPrice - 70;
  const productMax = xQty - MARGIN - 55;

  let y = MARGIN;

  // ── Cabeçalho ──
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(INK);
  pdf.text(`${docKind} ${number}`, MARGIN, y);
  y += 18;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(MUTED);
  pdf.text(`Emitido em ${formatDateDMY(order.orderDate)}`, MARGIN, y);
  y += 22;

  // Blocos fornecedor / cliente.
  const putLine = (label: string, value: string) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(MUTED);
    pdf.text(label, MARGIN, y);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(INK);
    pdf.text(value, MARGIN + 70, y);
    y += 16;
  };
  putLine("Fábrica", factoryName(order.factory));
  putLine("Cliente", clientName(order.client));
  putLine("Vendedor", order.seller?.name ?? "—");
  if (order.paymentTerm?.name) putLine("Pagamento", order.paymentTerm.name);
  y += 8;

  // ── Cabeçalho da tabela ──
  const drawTableHead = () => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(MUTED);
    pdf.text("Produto", MARGIN, y);
    pdf.text("Qtd", xQty, y, { align: "right" });
    pdf.text("Preço un.", xPrice, y, { align: "right" });
    pdf.text("Desc.", xDiscount, y, { align: "right" });
    pdf.text("Subtotal", xSubtotal, y, { align: "right" });
    y += 6;
    pdf.setDrawColor(LINE);
    pdf.line(MARGIN, y, pageW - MARGIN, y);
    y += 12;
  };
  drawTableHead();

  // ── Itens ──
  pdf.setFontSize(10);
  for (const item of items) {
    if (y > pageH - MARGIN - 90) {
      pdf.addPage();
      y = MARGIN;
      drawTableHead();
      pdf.setFontSize(10);
    }

    const name = item.product?.name ?? "Produto";
    const sku = item.product?.sku ? ` · ${item.product.sku}` : "";
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(INK);
    pdf.text(truncate(pdf, `${name}${sku}`, productMax), MARGIN, y);
    pdf.text(formatQty(item.unitsTotal), xQty, y, { align: "right" });
    pdf.text(formatMoney(item.unitPrice), xPrice, y, { align: "right" });
    pdf.text(
      Number(item.discount) > 0 ? formatMoney(item.discount) : "—",
      xDiscount,
      y,
      { align: "right" }
    );
    pdf.text(formatMoney(item.subtotal), xSubtotal, y, { align: "right" });
    y += 16;
  }

  if (items.length === 0) {
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(MUTED);
    pdf.text("Nenhum item adicionado.", MARGIN, y);
    y += 16;
  }

  // ── Totais ──
  y += 6;
  pdf.setDrawColor(LINE);
  pdf.line(pageW - MARGIN - 220, y, pageW - MARGIN, y);
  y += 16;

  const hasIpi = Number(order.ipiAmount) > 0;
  const grandTotal = Number(order.totalAmount) + Number(order.ipiAmount || 0);

  const putTotal = (label: string, value: string, bold = false) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(bold ? 12 : 10);
    pdf.setTextColor(bold ? INK : MUTED);
    pdf.text(label, xDiscount, y, { align: "right" });
    pdf.setTextColor(INK);
    pdf.text(value, xSubtotal, y, { align: "right" });
    y += bold ? 20 : 16;
  };
  putTotal("Subtotal", formatMoney(order.totalAmount));
  if (hasIpi) putTotal("IPI", formatMoney(order.ipiAmount));
  putTotal("Total", formatMoney(grandTotal), true);

  // ── Observações ──
  if (order.notes) {
    y += 6;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(MUTED);
    pdf.text("Observações", MARGIN, y);
    y += 14;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(INK);
    const lines = pdf.splitTextToSize(order.notes, pageW - MARGIN * 2);
    pdf.text(lines, MARGIN, y);
  }

  pdf.save(`${docKind.toLowerCase()}-${number}.pdf`);
};
