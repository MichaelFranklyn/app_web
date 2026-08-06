import { formatDate } from "@/utils/format/date";
import { maskCNPJ } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";
import { Client } from "../interface";

/** Cidade e UF na mesma célula — sozinhas, cada uma desperdiçaria uma coluna. */
const cityAndState = (client: Client): string =>
  [client.addressCity, client.addressState].filter(Boolean).join(" / ") || "—";

const sellerNames = (client: Client): string =>
  (client.companyClient?.sellers ?? [])
    .map((seller) => seller.name)
    .join(", ") || "—";

const score = (client: Client): string => {
  const total = client.companyClient?.visitScoreTotal;
  return total ? Number(total).toFixed(0) : "—";
};

/**
 * Colunas do relatório da carteira: as MESMAS que a tela mostra, na mesma ordem
 * — quem imprime está conferindo contra o que viu, e uma coluna a mais no papel
 * faz a conferência procurar na tela um dado que não está lá.
 *
 * Por isso o CNPJ é coluna aqui e não na tela: lá ele vive dentro da célula do
 * cliente (ver `ClientCell`), que no papel não caberia em duas linhas junto com
 * o nome fantasia. É o mesmo dado, remanejado — não um dado novo.
 *
 * A razão social leva o nome fantasia como segunda linha: é por ele que o
 * vendedor reconhece a loja ("Mercado Bom Preço"), mas é a razão social que
 * bate com a nota fiscal.
 */
export const CLIENT_COLUMNS: ReportColumn<Client>[] = [
  {
    header: "CLIENTE",
    width: 30,
    value: (client) => client.razaoSocial,
    sub: (client) => client.nomeFantasia,
  },
  { header: "CNPJ", width: 13, value: (client) => maskCNPJ(client.cnpj) },
  { header: "CIDADE / UF", width: 15, value: cityAndState },
  { header: "VENDEDOR", width: 16, value: sellerNames },
  {
    header: "ÚLT. COMPRA",
    width: 10,
    value: (client) => formatDate(client.companyClient?.lastOrderDate),
  },
  {
    header: "ÚLT. VISITA",
    width: 10,
    value: (client) => formatDate(client.companyClient?.lastVisitDate),
  },
  { header: "SCORE", width: 6, align: "right", bold: true, value: score },
];
