import { orderStatusLabel } from "@/app/(inside)/_shared/orderStatus";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";

import { SentOrder } from "./interface";

/**
 * Colunas do PDF de pedidos enviados.
 *
 * A coluna de faturamento traz "aguardando" em vez de um traço quando a fábrica
 * ainda não faturou: num papel levado para cobrar a fábrica, o traço se confunde
 * com dado faltando, e é exatamente essa linha que se quer apontar.
 */
export const SENT_ORDERS_PDF_COLUMNS: ReportColumn<SentOrder>[] = [
  {
    header: "PEDIDO",
    width: 9,
    value: (order) => formatDateDMY(order.orderDate),
  },
  { header: "CLIENTE", width: 24, value: (order) => clientName(order.client) },
  {
    header: "FÁBRICA",
    width: 18,
    value: (order) => factoryName(order.factory),
  },
  {
    header: "VENDEDOR",
    width: 13,
    value: (order) => order.seller?.name ?? "—",
  },
  {
    header: "SITUAÇÃO",
    width: 9,
    value: (order) => orderStatusLabel(order.status),
  },
  {
    header: "FATURAMENTO",
    width: 11,
    value: (order) =>
      order.invoicedAt ? formatDateDMY(order.invoicedAt) : "aguardando",
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
