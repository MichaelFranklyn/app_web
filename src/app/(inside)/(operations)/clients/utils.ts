import { KpiItem } from "@/components/Card/Kpi/Root/interface";
import { FieldConfig } from "@/hooks/useTableState";
import { SortLabel } from "@/utils/pdf/context";
import { CLIENT_KPI_HELP } from "./help";
import { ClientsStats } from "./interface";

// A lista de UFs mora em `_shared`: o relatório de clientes filtra pela mesma
// coluna (ver `dashboard/reports/clients`). Reexportada para quem já a lia daqui.
export { STATE_OPTIONS } from "@/app/(inside)/_shared/brazilStates";

export const formatCity = (
  city: string | null,
  state: string | null
): string => {
  return [city, state].filter(Boolean).join(" / ") || "—";
};

// Itens por página da lista. Compartilhado entre o fetch SSR (page.tsx) e o
// useTableData (content.tsx) para as variáveis da query não divergirem.
//
// Dez, e não cinco: a carteira era a lista que menos mostrava do sistema
// inteiro (pedidos traz 15, fábricas 12, redes 10) e a que mais se percorre —
// procurar um cliente custava virar página a cada cinco nomes, e cada virada é
// uma consulta ao banco. Dez é o padrão do `useTableData` e enche a tela sem
// exigir rolagem longa, porque a linha do cliente é alta (nome + fantasia + CNPJ).
export const ITEMS_PER_PAGE = 10;

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
      help: CLIENT_KPI_HELP["Total de clientes"],
    },
    {
      label: "Clientes ativos",
      value: String(activeClients),
      delta: `${totalClients ? Math.round((activeClients / totalClients) * 100) : 0}% da carteira`,
      positive: true,
      status: "ok",
      help: CLIENT_KPI_HELP["Clientes ativos"],
    },
    {
      // O rótulo era "Em risco de churn" e o texto de apoio dizia "score acima
      // de 70" — nenhum dos dois descrevia o número. O backend conta quem
      // passou do PRÓPRIO intervalo médio de compra (ver `_at_risk_count_query`);
      // o score de visita não entra nessa conta em lugar nenhum. Quem lesse o
      // cartão procuraria os clientes na aba Score e não os acharia lá.
      label: "Atrasados para comprar",
      value: String(atRiskClients),
      delta: "passaram do próprio ritmo",
      negative: atRiskClients > 0,
      status: atRiskClients > 0 ? "urgente" : "ok",
      help: CLIENT_KPI_HELP["Atrasados para comprar"],
    },
    {
      label: "Sem visita há 30d+",
      value: String(noVisit30d),
      delta: "sem visita recente",
      negative: noVisit30d > 0,
      status: noVisit30d > 0 ? "neutral" : "ok",
      valueClassName: noVisit30d > 0 ? "text-(--blue)!" : undefined,
      help: CLIENT_KPI_HELP["Sem visita há 30d+"],
    },
  ];
};

/**
 * Os filtros ativos que NÃO governam os quatro cartões do topo.
 *
 * Os KPIs vêm de `clientStats`, uma consulta à parte que só aceita o recorte por
 * vendedor: filtrar a lista por rede deixa o topo contando a carteira inteira.
 * Quem confere carteira e vê o total maior que a lista conclui que a conta
 * furou — então a tela precisa dizer, com o nome do filtro que a pessoa acabou
 * de usar, o que ele mexe e o que não mexe.
 *
 * Lê os MESMOS `filterFields` que desenham o painel: um filtro novo entra no
 * aviso sozinho, e um que deixe de existir sai junto. A única exceção é
 * `sellerId`, que o backend de fato aplica nos dois lados.
 */
export const KPI_IGNORED_FILTERS = (
  fields: { key: string; label?: string }[],
  values: Record<string, string>
): string[] =>
  fields
    .filter(({ key }) => key !== "sellerId" && Boolean(values[key]))
    .map(({ key, label }) => label ?? key);

/** Nomes de filtro numa frase: "Rede", "Rede e Estado", "Rede, Estado e Busca". */
export const listFilters = (labels: string[]): string => {
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
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

/**
 * Como cada coluna ordenável se chama no papel, e em que sentido ela é lida.
 *
 * Serve ao cabeçalho do PDF, que registra a ordenação junto com os filtros: uma
 * carteira ordenada por score impressa sem essa linha passa por "a carteira em
 * ordem alfabética", e quem conferir vai procurar um nome onde está uma
 * urgência. Os rótulos repetem os do `Table.Head` de propósito — é o mesmo
 * vocabulário da tela.
 */
export const CLIENT_SORT_LABELS: Record<string, SortLabel> = {
  razao_social: { label: "Cliente", kind: "text" },
  address_city: { label: "Cidade", kind: "text" },
  last_order_date: { label: "Última compra", kind: "date" },
  last_visit_date: { label: "Última visita", kind: "date" },
  visit_score_total: { label: "Score", kind: "number" },
};
