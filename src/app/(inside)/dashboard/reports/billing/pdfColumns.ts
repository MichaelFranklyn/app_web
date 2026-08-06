import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";

import { BillingRow } from "./interface";
import { BILLING_SITUATION_LABEL, dueDateLabel, overdueLabel } from "./utils";

/**
 * Colunas do PDF das duplicatas, na mesma ordem da tela — quem imprime está
 * conferindo contra o que viu.
 *
 * O vencimento abre a linha porque é por ele que o papel se ordena e é o que o
 * dedo procura ao ligar para o cliente; o atraso vem logo depois, para a
 * conversa começar pelo pior.
 */
export const BILLING_PDF_COLUMNS: ReportColumn<BillingRow>[] = [
  {
    header: "VENCIMENTO",
    width: 10,
    value: (row) => dueDateLabel(row.dueDate),
  },
  {
    header: "SITUAÇÃO",
    width: 9,
    value: (row) => BILLING_SITUATION_LABEL[row.situation],
  },
  {
    header: "ATRASO",
    width: 8,
    value: (row) => overdueLabel(row.daysOverdue),
  },
  {
    header: "CLIENTE",
    width: 24,
    value: (row) => row.clientName,
  },
  {
    header: "FÁBRICA",
    width: 15,
    value: (row) => row.factoryName,
  },
  {
    header: "FATURADO",
    width: 9,
    value: (row) => (row.invoicedAt ? formatDateDMY(row.invoicedAt) : "—"),
  },
  {
    header: "PARC.",
    width: 5,
    align: "right",
    value: (row) => String(row.sequence),
  },
  {
    header: "VALOR",
    width: 11,
    align: "right",
    bold: true,
    value: (row) => formatMoney(row.amount),
  },
  {
    header: "COMISSÃO",
    width: 9,
    align: "right",
    value: (row) => formatMoney(row.commissionAmount),
  },
];
