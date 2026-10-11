import { ToggleOption } from "@/components/ToggleGroup";
import { FieldConfig } from "@/hooks/useTableState";
import { FOLLOW_UP_SITUATION_LABEL, FollowUpSituation } from "@/utils/followUp";

/** Itens por página. Compartilhado entre a query do servidor e a do cliente. */
export const ITEMS_PER_PAGE = 20;

/**
 * Filtros da lista. `situation` e `search` são TRADUZIDOS no resolver (viram
 * situação + data, e busca no motivo); `responsible_user_id` vai direto — e o
 * backend o ignora quando quem pede é vendedor.
 */
export const FOLLOW_UP_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "search" },
  situation: { type: "select", queryField: "situation" },
  responsible: { type: "select", queryField: "responsible_user_id" },
  // `true` = responsável desativado (o resolver traduz; só vale para gestor).
  orphaned: { type: "select", queryField: "orphaned" },
};

/** "Em aberto" é o padrão (sem filtro): a lista existe para o que falta fazer. */
export type SituationChoice = "OPEN" | FollowUpSituation;

export const SITUATION_CHOICES: SituationChoice[] = [
  "OPEN",
  "OVERDUE",
  "TODAY",
  "UPCOMING",
  "DONE",
  "CANCELLED",
];

/**
 * Os botões de recorte, com a quantidade no próprio rótulo — "Atrasados · 3".
 * Um controle só para ver e escolher: mais simples que cartões de contagem ao
 * lado de um filtro que faz a mesma coisa.
 */
export const situationOptions = (
  counts: Partial<Record<FollowUpSituation, number>>
): ToggleOption<SituationChoice>[] =>
  SITUATION_CHOICES.map((value) => {
    if (value === "OPEN") {
      const open =
        (counts.OVERDUE ?? 0) + (counts.TODAY ?? 0) + (counts.UPCOMING ?? 0);
      return { value, label: `Em aberto · ${open}` };
    }
    return {
      value,
      label: `${FOLLOW_UP_SITUATION_LABEL[value]} · ${counts[value] ?? 0}`,
    };
  });
