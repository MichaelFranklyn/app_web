import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";

import { formatPercent } from "../../utils";
import { FactoryOrdersRow } from "./interface";
import { invoicedRate } from "./utils";

/**
 * Colunas do PDF das fábricas, na mesma ordem da tela.
 *
 * O valor colocado vem em negrito porque é por ele que a tabela se ordena e é a
 * pergunta do papel ("quanto mandei para cada uma"); a fatia do período fecha a
 * linha, que é a leitura de dependência.
 */
export const FACTORIES_PDF_COLUMNS: ReportColumn<FactoryOrdersRow>[] = [
  {
    header: "FÁBRICA",
    width: 24,
    value: (row) => row.entityName,
  },
  {
    header: "PEDIDOS",
    width: 8,
    align: "right",
    value: (row) => String(row.orderCount),
  },
  {
    header: "CLIENTES",
    width: 8,
    align: "right",
    value: (row) => String(row.clientCount),
  },
  {
    header: "VALOR COLOCADO",
    width: 13,
    align: "right",
    bold: true,
    value: (row) => formatMoney(row.totalAmount),
  },
  {
    header: "TICKET MÉDIO",
    width: 11,
    align: "right",
    value: (row) => formatMoney(row.avgTicket),
  },
  {
    header: "JÁ FATURADO",
    width: 12,
    align: "right",
    value: (row) =>
      `${formatMoney(row.invoicedAmount)} (${formatPercent(invoicedRate(row))})`,
  },
  {
    header: "COMISSÃO",
    width: 10,
    align: "right",
    value: (row) => formatMoney(row.commissionAmount),
  },
  {
    header: "ÚLT. PEDIDO",
    width: 9,
    value: (row) =>
      row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "—",
  },
  {
    header: "% PERÍODO",
    width: 8,
    align: "right",
    value: (row) => formatPercent(row.share),
  },
];
