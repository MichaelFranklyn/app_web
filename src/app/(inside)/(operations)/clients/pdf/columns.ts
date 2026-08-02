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
 * Colunas do relatório da carteira, na mesma ordem em que a tela mostra os
 * dados — quem imprime está conferindo contra o que viu.
 *
 * A razão social leva o nome fantasia como segunda linha: é por ele que o
 * vendedor reconhece a loja ("Mercado Bom Preço"), mas é a razão social que
 * bate com a nota fiscal.
 */
export const CLIENT_COLUMNS: ReportColumn<Client>[] = [
  {
    header: "CLIENTE",
    width: 26,
    value: (client) => client.razaoSocial,
    sub: (client) => client.nomeFantasia,
  },
  { header: "CNPJ", width: 13, value: (client) => maskCNPJ(client.cnpj) },
  { header: "CIDADE / UF", width: 14, value: cityAndState },
  { header: "VENDEDOR", width: 14, value: sellerNames },
  {
    header: "ÚLT. COMPRA",
    width: 9,
    value: (client) => formatDate(client.companyClient?.lastOrderDate),
  },
  {
    header: "FATURAMENTO",
    width: 9,
    value: (client) => formatDate(client.companyClient?.lastInvoiceDate),
  },
  {
    header: "ÚLT. VISITA",
    width: 9,
    value: (client) => formatDate(client.companyClient?.lastVisitDate),
  },
  { header: "SCORE", width: 6, align: "right", bold: true, value: score },
];

export interface ContextParams {
  /** Filtros ativos na tela, como estão na URL. */
  inputValues: Record<string, string>;
  /** Nome do vendedor escolhido no filtro — o id sozinho não diz nada no papel. */
  sellerLabel?: string | null;
}

/**
 * Descreve, em uma linha, o recorte que o documento cobre.
 *
 * Uma lista filtrada impressa sem essa linha passa por "a carteira inteira" —
 * e é assim que uma reunião discute o número errado. A contagem fica de fora:
 * ela já aparece na faixa do título.
 */
export const buildClientsContext = ({
  inputValues,
  sellerLabel,
}: ContextParams): string[] =>
  [
    sellerLabel ? `Vendedor: ${sellerLabel}` : null,
    inputValues.search ? `Busca: "${inputValues.search}"` : null,
    inputValues.state ? `UF: ${inputValues.state}` : null,
    inputValues.needsAttention === "true"
      ? "Somente: precisa de atenção"
      : null,
  ].filter((part): part is string => Boolean(part));
