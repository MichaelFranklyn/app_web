import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";

import { orderStatusLabel } from "@/app/(inside)/_shared/orderStatus";
import { SalesReportOrder } from "./interface";

/**
 * Colunas do PDF de vendas, na mesma ordem da tabela da tela — quem imprime está
 * conferindo contra o que viu.
 *
 * O faturamento vem primeiro porque é a data que ordena o relatório; a do pedido
 * fica ao lado para explicar a defasagem ("vendi em junho, faturou em julho").
 * Valor e comissão em negrito à direita: é o que o dedo procura.
 */
export const SALES_PDF_COLUMNS: ReportColumn<SalesReportOrder>[] = [
  {
    header: "FATURAMENTO",
    width: 10,
    value: (order) =>
      order.invoicedAt ? formatDateDMY(order.invoicedAt) : "—",
  },
  {
    header: "PEDIDO",
    width: 9,
    value: (order) => formatDateDMY(order.orderDate),
  },
  {
    header: "CLIENTE",
    width: 24,
    value: (order) => clientName(order.client),
  },
  {
    header: "FÁBRICA",
    width: 18,
    value: (order) => factoryName(order.factory),
  },
  {
    header: "VENDEDOR",
    width: 14,
    value: (order) => order.seller?.name ?? "—",
  },
  {
    header: "SITUAÇÃO",
    width: 9,
    value: (order) => orderStatusLabel(order.status),
  },
  {
    header: "VALOR",
    width: 11,
    align: "right",
    bold: true,
    value: (order) => formatMoney(order.totalAmount),
  },
  {
    header: "COMISSÃO",
    width: 10,
    align: "right",
    value: (order) => formatMoney(order.commissionAmount),
  },
];
