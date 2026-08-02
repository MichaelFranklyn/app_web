import { clientName, factoryName } from "@/utils/company";
import { formatAmount, formatDateDMY, maskCNPJ } from "@/utils/format/masks";
import { downloadSheet } from "@/utils/import/writer";
import { orderStatusLabel } from "../utils";
import { OrderDetail, OrderItem } from "./interface";
import { INSTALLMENT_STATUS_LABEL, paymentTermLabel } from "./utils";

const ITEM_HEADERS = [
  "Código",
  "Produto",
  "Nível",
  "Unidades",
  "Preço un. (R$)",
  "Desconto (R$)",
  "Imposto (R$)",
  "IPI (R$)",
  "Subtotal (R$)",
];

/** Rascunho/enviado ainda é orçamento — o arquivo não pode se chamar "pedido". */
const isQuote = (status: string) => status === "DRAFT" || status === "SENT";

/**
 * Monta a planilha de um pedido: uma ficha com os dados do negócio no topo, os
 * itens em tabela, os totais e as parcelas.
 *
 * Os números saem sem "R$" e no formato brasileiro ("1.234,56") para o Excel
 * pt-BR tratá-los como número — quem baixa a planilha (em vez do PDF) quer
 * somar, filtrar e conferir contra a nota da fábrica.
 *
 * As contas são as mesmas da tela e do PDF: o subtotal da linha já embute o
 * imposto (ST) e o IPI entra por fora, no total.
 */
export const buildOrderSheetRows = (
  order: OrderDetail,
  items: OrderItem[]
): string[][] => {
  const number = order.id.slice(0, 8).toUpperCase();
  const subtotalWithTax =
    Number(order.totalAmount) + Number(order.taxAmount ?? 0);
  const total = subtotalWithTax + Number(order.ipiAmount || 0);

  const rows: string[][] = [
    [isQuote(order.status) ? "Orçamento" : "Pedido", number],
    ["Data", formatDateDMY(order.orderDate)],
    ["Situação", orderStatusLabel(order.status)],
    ["Cliente", order.client ? clientName(order.client) : ""],
    ["CNPJ", order.client?.cnpj ? maskCNPJ(order.client.cnpj) : ""],
    [
      "Cidade / UF",
      [order.client?.addressCity, order.client?.addressState]
        .filter(Boolean)
        .join(" / "),
    ],
    ["Fábrica", order.factory ? factoryName(order.factory) : ""],
    ["Vendedor", order.seller?.name ?? ""],
    [
      "Condição de pagamento",
      order.paymentTerm ? paymentTermLabel(order.paymentTerm) : "",
    ],
    ["Faturado em", order.invoicedAt ? formatDateDMY(order.invoicedAt) : ""],
    ["Entregue em", order.deliveredAt ? formatDateDMY(order.deliveredAt) : ""],
    [],
    ITEM_HEADERS,
    ...items.map((item) => [
      item.product?.sku ?? "",
      item.product?.name ?? "",
      item.tier?.name ?? "",
      formatAmount(item.unitsTotal),
      formatAmount(item.unitPrice),
      formatAmount(item.discount),
      formatAmount(item.taxAmount),
      formatAmount(item.ipiAmount),
      formatAmount(Number(item.subtotal) + Number(item.taxAmount)),
    ]),
    [],
    ["Subtotal (R$)", formatAmount(subtotalWithTax)],
    ["IPI (R$)", formatAmount(order.ipiAmount || 0)],
    ["Total (R$)", formatAmount(total)],
  ];

  if (order.installments.length > 0) {
    rows.push(
      [],
      ["Parcelas"],
      ["Nº", "Vencimento", "Valor (R$)", "Comissão (R$)", "Situação"],
      ...order.installments.map((installment) => [
        String(installment.sequence),
        installment.dueDate ? formatDateDMY(installment.dueDate) : "",
        formatAmount(installment.amount),
        formatAmount(installment.commissionAmount),
        INSTALLMENT_STATUS_LABEL[installment.status] ?? installment.status,
      ])
    );
  }

  if (order.notes) rows.push([], ["Observações", order.notes]);

  return rows;
};

/** Gera e baixa a planilha do pedido (ou orçamento). */
export const exportOrderSheet = async (
  order: OrderDetail,
  items: OrderItem[]
): Promise<void> => {
  const kind = isQuote(order.status) ? "orcamento" : "pedido";
  const number = order.id.slice(0, 8).toUpperCase();
  await downloadSheet(
    `${kind}-${number}.xlsx`,
    buildOrderSheetRows(order, items),
    "Pedido"
  );
};
