import { ReportColumn } from "@/utils/pdf/table";

import { formatPercent } from "../../utils";
import { ExecutionSellerRow } from "./interface";
import { recordedByPerson } from "./utils";

/** Colunas do PDF da execução, na mesma ordem da tela. */
export const EXECUTION_PDF_COLUMNS: ReportColumn<ExecutionSellerRow>[] = [
  { header: "VENDEDOR", width: 22, value: (row) => row.sellerName },
  {
    header: "PLANEJADAS",
    width: 10,
    align: "right",
    value: (row) => String(row.planned),
  },
  {
    header: "EXECUÇÃO",
    width: 10,
    align: "right",
    bold: true,
    value: (row) => formatPercent(row.executionRate),
  },
  {
    header: "REGISTRADAS",
    width: 11,
    align: "right",
    value: (row) => String(recordedByPerson(row)),
  },
  {
    header: "PELO PEDIDO",
    width: 11,
    align: "right",
    value: (row) => String(row.workedInferred),
  },
  {
    header: "AGUARDANDO",
    width: 11,
    align: "right",
    value: (row) => String(row.pending),
  },
  {
    header: "FECHADAS S/ RESPOSTA",
    width: 14,
    align: "right",
    value: (row) => String(row.autoClosed),
  },
  {
    header: "VIRARAM PEDIDO",
    width: 11,
    align: "right",
    value: (row) => String(row.converted),
  },
];
