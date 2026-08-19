import { COMMISSION_STATUS_LABEL } from "@/app/(inside)/_shared/commissions";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";

import { CommissionRow } from "./interface";

/**
 * Colunas do PDF de comissões — a ordem em que se confere contra a planilha da
 * fábrica: quando cai, de quem, de qual fábrica, e quanto.
 *
 * A parcela leva o valor do boleto ao lado da comissão porque é o par que se
 * checa: a fábrica manda o valor faturado, e a comissão é o percentual dele.
 */
export const COMMISSIONS_PDF_COLUMNS: ReportColumn<CommissionRow>[] = [
  {
    header: "RECEBIMENTO",
    width: 11,
    value: (row) => (row.receiveDate ? formatDateDMY(row.receiveDate) : "—"),
  },
  { header: "CLIENTE", width: 20, value: (row) => clientName(row.client) },
  { header: "FÁBRICA", width: 15, value: (row) => factoryName(row.factory) },
  { header: "VENDEDOR", width: 11, value: (row) => row.seller?.name ?? "—" },
  // A planilha que a fábrica manda vem pela NOTA: sem esta coluna, casar o
  // repasse com a parcela é feito por cliente + valor, no olho.
  { header: "NOTA", width: 6, value: (row) => row.invoiceNumber ?? "—" },
  {
    header: "PARC.",
    width: 5,
    align: "right",
    value: (row) => String(row.sequence),
  },
  {
    header: "VALOR PARCELA",
    width: 11,
    align: "right",
    value: (row) => formatMoney(row.installmentAmount),
  },
  {
    header: "COMISSÃO",
    width: 10,
    align: "right",
    bold: true,
    value: (row) => formatMoney(row.amount),
  },
  {
    header: "SITUAÇÃO",
    width: 9,
    value: (row) => COMMISSION_STATUS_LABEL[row.status],
  },
  {
    header: "CONF.",
    width: 5,
    value: (row) => (row.isReconciled ? "sim" : "—"),
  },
];
