import { KpiItem } from "@/components/Card/Kpi/Root/interface";
import { FieldConfig } from "@/hooks/useTableState";
import { ClientsStats } from "./interface";

export const formatCity = (
  city: string | null,
  state: string | null
): string => {
  return [city, state].filter(Boolean).join(" / ") || "—";
};

// Itens por página da lista. Compartilhado entre o fetch SSR (page.tsx) e o
// useTableData (content.tsx) para as variáveis da query não divergirem.
export const ITEMS_PER_PAGE = 5;

export const TABLE_FIELDS: Record<string, FieldConfig> = {
  // Colunas separadas por vírgula: o backend combina o `like` de cada uma com OR.
  search: { type: "text", queryField: "razao_social,nome_fantasia" },
  // Não é coluna de cliente: o backend traduz em "clientes da carteira desse
  // vendedor". Só o gestor manda; vendedor logado já vê apenas a própria carteira.
  sellerId: { type: "select", queryField: "seller_id" },
  state: { type: "select", queryField: "address_state" },
  // Vai como "true"/"false"; o `parse_value` do backend já converte em booleano.
  needsAttention: { type: "select", queryField: "is_needs_attention" },
  // Rede e segmento são colunas do VÍNCULO (company_clients), não de Client: o
  // backend as retira dos filtros e transforma em recorte do join.
  networkId: { type: "select", queryField: "network_id" },
  segmentId: { type: "select", queryField: "segment_id" },
};

/**
 * UFs para o filtro de estado, em ordem alfabética.
 *
 * Lista fixa em vez de "os estados que aparecem na carteira": a carteira é
 * paginada, então só daria para montar a lista a partir da página atual — e o
 * seletor mudaria de conteúdo conforme a pessoa navega.
 */
export const STATE_OPTIONS = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
].map((uf) => ({ value: uf, label: uf }));

export const buildKpis = (stats: ClientsStats): KpiItem[] => {
  // Defensivo: se `clientStats` vier ausente, degrada para zeros sem quebrar a página.
  const {
    totalClients = 0,
    activeClients = 0,
    atRiskClients = 0,
    noVisit30d = 0,
  } = stats.clientStats ?? {};

  return [
    {
      label: "Total de clientes",
      value: String(totalClients),
      delta: "carteira da empresa",
      status: "atencao",
    },
    {
      label: "Clientes ativos",
      value: String(activeClients),
      delta: `${totalClients ? Math.round((activeClients / totalClients) * 100) : 0}% da carteira`,
      positive: true,
      status: "ok",
    },
    {
      label: "Em risco de churn",
      value: String(atRiskClients),
      delta: "score acima de 70",
      negative: atRiskClients > 0,
      status: atRiskClients > 0 ? "urgente" : "ok",
    },
    {
      label: "Sem visita há 30d+",
      value: String(noVisit30d),
      delta: "sem visita recente",
      negative: noVisit30d > 0,
      status: noVisit30d > 0 ? "neutral" : "ok",
      valueClassName: noVisit30d > 0 ? "text-(--blue)!" : undefined,
    },
  ];
};

/**
 * Colunas por onde a carteira pode ser ordenada.
 *
 * As três últimas não são colunas de `clients`: cada uma é uma subconsulta no
 * repositório (`_COMPUTED_ORDER_COLUMNS`) que espelha regra por regra o valor
 * mostrado na célula — mesma empresa, mesmo recorte por vendedor, cancelado
 * fora na compra, e no score o mais recente de cada vínculo antes do maior
 * entre eles.
 *
 * Esta lista é METADE de um contrato: o outro lado é o mapa do repositório, e
 * um nome que exista só aqui cai no `getattr` e faz a lista se ordenar por
 * `created_at` em silêncio. O backend tem um teste que trava o conjunto.
 *
 * Vendedor fica de fora por natureza: um cliente pode ter vários, e não existe
 * "o vendedor" da linha para comparar.
 */
export const CLIENT_SORTABLE_FIELDS = [
  "razao_social",
  "address_city",
  "last_order_date",
  "last_visit_date",
  "visit_score_total",
];
