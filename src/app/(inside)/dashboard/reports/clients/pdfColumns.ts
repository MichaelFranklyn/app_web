import { formatDateDMY, maskCNPJ } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";

import { ClientReportRow } from "./interface";
import { cityAndState, idleLabel, scoreLabel, sellerNames } from "./utils";

/**
 * Colunas do PDF da carteira.
 *
 * A razão social leva o nome fantasia como segunda linha: é por ele que o vendedor
 * reconhece a loja ("Mercado Bom Preço"), mas é a razão social que bate com a nota
 * fiscal. "Dias sem comprar" em negrito porque é a coluna que decide a visita.
 */
export const CLIENTS_PDF_COLUMNS: ReportColumn<ClientReportRow>[] = [
  {
    header: "CLIENTE",
    width: 24,
    value: (row) => row.razaoSocial,
    sub: (row) => row.nomeFantasia,
  },
  { header: "CNPJ", width: 12, value: (row) => maskCNPJ(row.cnpj) },
  { header: "CIDADE / UF", width: 13, value: cityAndState },
  {
    header: "REDE",
    width: 10,
    value: (row) => row.companyClient?.network?.name ?? "—",
  },
  { header: "VENDEDOR", width: 13, value: sellerNames },
  {
    header: "ÚLT. COMPRA",
    width: 9,
    value: (row) =>
      row.companyClient?.lastOrderDate
        ? formatDateDMY(row.companyClient.lastOrderDate)
        : "—",
  },
  {
    header: "SEM COMPRAR",
    width: 10,
    align: "right",
    bold: true,
    value: (row) => idleLabel(row.companyClient?.lastOrderDate),
  },
  {
    header: "ÚLT. VISITA",
    width: 9,
    value: (row) =>
      row.companyClient?.lastVisitDate
        ? formatDateDMY(row.companyClient.lastVisitDate)
        : "—",
  },
  { header: "SCORE", width: 6, align: "right", value: scoreLabel },
];
