import { FilterField } from "@/components/Filters";
import { formatDate } from "@/utils/format/date";

/**
 * Rótulo legível de um filtro ativo, ou `null` quando o campo está vazio.
 *
 * Campo escondido não é descrito: ele não está à vista na tela e, nos dois casos
 * em que o app o usa, também não vale como recorte — o vendedor não escolhe
 * vendedor (o backend escopa pelo token) e a aba "ainda não faturados" retira a
 * situação dos filtros que lê da URL. Anunciar um "Vendedor: Ana" que ninguém
 * pediu faria o papel afirmar um recorte que não existe.
 */
const describeField = (
  field: FilterField,
  values: Record<string, string>
): string | null => {
  if (field.hidden) return null;

  if (field.type === "date-range") {
    const from = values[field.key];
    const to = values[field.toKey];
    if (!from && !to) return null;
    if (from && to)
      return `${field.label}: ${formatDate(from)} a ${formatDate(to)}`;
    return from
      ? `${field.label}: a partir de ${formatDate(from)}`
      : `${field.label}: até ${formatDate(to)}`;
  }

  const value = values[field.key];
  if (!value) return null;

  if (field.type === "select") {
    // O id sozinho não diz nada no papel: vale o rótulo que estava no seletor.
    const option = field.options.find((item) => item.value === value);
    return `${field.label}: ${option?.label ?? value}`;
  }

  return `${field.label}: "${value}"`;
};

/**
 * O que se lê na coluna, para a direção sair em português no papel: "maior
 * primeiro" faz sentido em dinheiro, "mais recente primeiro" em data e nenhum
 * dos dois em nome de cliente.
 */
export type SortKind = "text" | "date" | "number";

export interface SortLabel {
  /** Nome da coluna como o cabeçalho da tabela a mostra ("Última compra"). */
  label: string;
  kind: SortKind;
}

/** A ordenação como ela viaja na query: `by` é o nome da COLUNA no backend. */
export interface ReportOrder {
  by: string;
  dir: "asc" | "desc";
}

const DIRECTION_WORDS: Record<SortKind, Record<"asc" | "desc", string>> = {
  text: { asc: "A → Z", desc: "Z → A" },
  date: { asc: "mais antigas primeiro", desc: "mais recentes primeiro" },
  number: { asc: "menor primeiro", desc: "maior primeiro" },
};

/**
 * A ordenação escrita por extenso: "Ordenado por: Valor (maior primeiro)".
 *
 * Uma lista impressa fora da ordem em que estava na tela é lida como outra
 * lista — quem ordenou por valor e imprimiu está conferindo os maiores pedidos,
 * e um papel em ordem de data faz a conferência começar errada. Por isso a
 * ordenação é registrada no cabeçalho junto com os filtros: o documento diz
 * exatamente o recorte E a leitura que ele representa.
 *
 * Sem rótulo cadastrado para a coluna devolve `null` em vez do nome cru da
 * coluna do banco (`total_amount`), que não informa quem lê o papel.
 */
export const describeSort = (
  order: ReportOrder | null | undefined,
  labels: Record<string, SortLabel> | undefined
): string | null => {
  if (!order || !labels) return null;
  const column = labels[order.by];
  if (!column) return null;
  return `Ordenado por: ${column.label} (${DIRECTION_WORDS[column.kind][order.dir]})`;
};

export interface ReportContextParams {
  /** Os mesmos campos do painel de filtros da tela. */
  fields: FilterField[];
  values: Record<string, string>;
  /** Recorte que não vem do painel (a aba corrente, "Ainda não faturados"). */
  scopeLabel?: string | null;
  /** Ordenação ativa na tabela, se houver. */
  order?: ReportOrder | null;
  /** Rótulos das colunas ordenáveis daquela lista, por nome de coluna. */
  sortLabels?: Record<string, SortLabel>;
}

/**
 * Descreve, em poucas linhas, o recorte que o documento cobre: de qual aba, com
 * quais filtros e em que ordem. A contagem fica de fora — já aparece na faixa do
 * título.
 *
 * Ler os rótulos do próprio painel de filtros (em vez de reescrevê-los aqui) é o
 * que mantém o papel e a tela dizendo a mesma coisa quando um filtro novo
 * aparece na lista. A carteira de clientes já passou por isso: rede e segmento
 * entraram no painel e o cabeçalho do PDF continuou anunciando só busca e UF.
 */
export const buildReportContext = ({
  fields,
  values,
  scopeLabel,
  order,
  sortLabels,
}: ReportContextParams): string[] => {
  const sort = describeSort(order, sortLabels);
  return [
    ...(scopeLabel ? [scopeLabel] : []),
    ...fields
      .map((field) => describeField(field, values))
      .filter((part): part is string => Boolean(part)),
    ...(sort ? [sort] : []),
  ];
};
