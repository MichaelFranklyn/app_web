import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";

import { formatPercent } from "../../utils";
import { AbcRow } from "./interface";

/**
 * Colunas do PDF da curva, na mesma ordem da tela.
 *
 * O acumulado fica ao lado da participação de propósito: é lendo as duas
 * juntas que se acha a linha em que a carteira fecha 80% — o número que o papel
 * existe para dar.
 */
export const ABC_PDF_COLUMNS: ReportColumn<AbcRow>[] = [
  {
    header: "#",
    width: 4,
    align: "right",
    value: (row) => String(row.rank),
  },
  {
    header: "CLIENTE",
    width: 32,
    value: (row) => row.clientName,
  },
  {
    header: "CLASSE",
    width: 7,
    bold: true,
    value: (row) => row.abcClass,
  },
  {
    header: "FATURAMENTO",
    width: 14,
    align: "right",
    bold: true,
    value: (row) => formatMoney(row.totalAmount),
  },
  {
    header: "PARTIC.",
    width: 8,
    align: "right",
    value: (row) => formatPercent(row.share),
  },
  {
    header: "ACUMULADO",
    width: 10,
    align: "right",
    value: (row) => formatPercent(row.cumulativeShare),
  },
  {
    header: "PEDIDOS",
    width: 8,
    align: "right",
    value: (row) => String(row.orderCount),
  },
  {
    header: "COMISSÃO",
    width: 10,
    align: "right",
    value: (row) => formatMoney(row.commissionAmount),
  },
  {
    header: "ÚLT. FAT.",
    width: 9,
    value: (row) =>
      row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "—",
  },
];
