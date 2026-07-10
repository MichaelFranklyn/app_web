import { FormStepSchema } from "@/components/FormBuilder";
import { extractSelectValue } from "@/utils/form";
import { VISIT_OUTCOME_OPTIONS, VISIT_STATUS_OPTIONS } from "@/utils/visit";

import { UpdateVisitInput, VisitEditable } from "./interface";

export { VISIT_OUTCOME_OPTIONS, VISIT_STATUS_OPTIONS };

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

  const reason = textOrNull(data.outcomeReason);
  if (reason !== (initial.outcomeReason ?? null)) out.outcomeReason = reason;

  const notes = textOrNull(data.notes);
  if (notes !== (initial.notes ?? null)) out.notes = notes;

  return out;
};
