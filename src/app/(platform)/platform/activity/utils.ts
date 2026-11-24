import { FieldConfig } from "@/hooks/useTableFilters";
import { QueryFilter } from "@/hooks/useTableData";
import { ActivitySummary } from "../interface";

export const ITEMS_PER_PAGE = 25;

/** Nome do parâmetro de URL que recorta a tela para uma empresa só. */
export const COMPANY_PARAM = "company";

/**
 * Recorte por empresa, na forma de filtro fixo do `useTableData`.
 *
 * Vive aqui, e não solto no `content`, porque o `page.tsx` precisa montar a
 * MESMA lista de filtros para o fetch do SSR: se as variables divergirem num
 * byte, o cache semeado não é encontrado e a tela busca tudo de novo.
 */
export const companyBaseFilters = (
  companyId: string | null
): QueryFilter[] | undefined =>
  companyId ? [{ field: "company_id", value: companyId }] : undefined;

/** Variables do SSR da lista. Espelham as do estado default do `useTableData`. */
export const activityListVariables = (companyId: string | null) => ({
  input: {
    first: ITEMS_PER_PAGE,
    after: null,
    ...(companyId && {
      filters: [{ field: "company_id", operator: "eq", value: companyId }],
    }),
  },
});

/** Variables do resumo. Sempre com a chave presente — `undefined` no servidor e
 * `null` no cliente seriam duas entradas diferentes no cache. */
export const summaryVariables = (companyId: string | null) => ({
  companyId: companyId ?? null,
});

export const TABLE_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "operation" },
  status: { type: "select", queryField: "status" },
};

export const STATUS_OPTIONS = [
  { value: "success", label: "Concluídas" },
  { value: "error", label: "Com erro" },
];

/** Fatia das ações que terminou em erro. */
export const errorRate = (summary: ActivitySummary): number => {
  if (summary.totalActions === 0) return 0;
  return Math.round((summary.totalErrors / summary.totalActions) * 100);
};

/** Acima disto a operação é lenta o bastante para o usuário perceber. */
const SLOW_MS = 1000;

export const isSlow = (ms: number | null): boolean =>
  ms !== null && ms >= SLOW_MS;
