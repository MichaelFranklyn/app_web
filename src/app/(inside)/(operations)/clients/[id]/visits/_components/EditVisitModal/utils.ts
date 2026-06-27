import { FormStepSchema } from "@/components/FormBuilder";
import { extractSelectValue } from "@/utils/form";
import {
  STOCK_OBSERVATION_OPTIONS as STOCK_OBS_OPTIONS,
  VISIT_OUTCOME_OPTIONS,
  VISIT_STATUS_OPTIONS,
} from "@/utils/visit";

import { UpdateVisitInput, VisitEditable } from "./interface";

export { STOCK_OBS_OPTIONS, VISIT_OUTCOME_OPTIONS, VISIT_STATUS_OPTIONS };

export const EDIT_VISIT_FORM_STEPS: FormStepSchema[] = [
  {
    id: "visit",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "status",
            type: "select-single",
            label: "Status",
            placeholder: "Selecione o status",
            options: VISIT_STATUS_OPTIONS,
          },
          {
            name: "outcome",
            type: "select-single",
            label: "Resultado",
            placeholder: "Sem resultado",
            options: VISIT_OUTCOME_OPTIONS,
          },
          {
            name: "outcomeReason",
            type: "text",
            label: "Motivo",
            placeholder: "Motivo do resultado",
          },
          {
            name: "stockObservation",
            type: "select-single",
            label: "Observação de estoque",
            placeholder: "Sem observação",
            options: STOCK_OBS_OPTIONS,
          },
          {
            name: "notes",
            type: "textarea",
            label: "Observações",
            placeholder: "Observações adicionais...",
            rows: 3,
          },
        ],
      },
    ],
  },
];

const textOrNull = (val: unknown): string | null => {
  const s = val != null ? String(val).trim() : "";
  return s === "" ? null : s;
};

/** Retorna apenas os campos alterados (para o input do update). */
export const normalizeVisitInput = (
  data: Record<string, unknown>,
  initial: VisitEditable
): UpdateVisitInput => {
  const out: UpdateVisitInput = {};

  const status = extractSelectValue(data.status);
  if (status && status !== initial.status) out.status = status;

  const outcome = extractSelectValue(data.outcome) || null;
  if (outcome !== (initial.outcome ?? null)) out.outcome = outcome;

  const stockObs = extractSelectValue(data.stockObservation) || null;
  if (stockObs !== (initial.stockObservation ?? null))
    out.stockObservation = stockObs;

  const reason = textOrNull(data.outcomeReason);
  if (reason !== (initial.outcomeReason ?? null)) out.outcomeReason = reason;

  const notes = textOrNull(data.notes);
  if (notes !== (initial.notes ?? null)) out.notes = notes;

  return out;
};
