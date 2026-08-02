import { FilterField } from "@/components/Filters";
import { formatDate } from "@/utils/format/date";

/** Rótulo legível de um filtro ativo, ou `null` quando o campo está vazio. */
const describeField = (
  field: FilterField,
  values: Record<string, string>
): string | null => {
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

export interface OrdersContextParams {
  /** Os mesmos campos do painel de filtros da tela. */
  fields: FilterField[];
  values: Record<string, string>;
  /** Recorte da aba ("Ainda não faturados"), que não é um filtro do painel. */
  scopeLabel?: string | null;
}

/**
 * Descreve, em uma linha, o recorte que o documento cobre: de qual aba e com
 * quais filtros. A contagem fica de fora — já aparece na faixa do título.
 *
 * Ler os rótulos do próprio painel de filtros (em vez de reescrevê-los aqui)
 * é o que mantém o papel e a tela dizendo a mesma coisa quando um filtro novo
 * aparece na lista.
 */
export const buildOrdersContext = ({
  fields,
  values,
  scopeLabel,
}: OrdersContextParams): string[] => [
  ...(scopeLabel ? [scopeLabel] : []),
  ...fields
    .map((field) => describeField(field, values))
    .filter((part): part is string => Boolean(part)),
];
