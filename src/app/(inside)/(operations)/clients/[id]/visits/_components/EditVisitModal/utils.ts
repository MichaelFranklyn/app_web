import { FormStepSchema } from "@/components/FormBuilder";
import { extractSelectValue } from "@/utils/form";
import {
  VISIT_OUTCOME_OPTIONS,
  VISIT_STATUS_OPTIONS,
  isVisitStatusLocked,
  lockedVisitStatusHint,
  visitStatusOptionsFor,
} from "@/utils/visit";

import { UpdateVisitInput, VisitEditable } from "./interface";

export { VISIT_OUTCOME_OPTIONS, VISIT_STATUS_OPTIONS };

/**
 * Passos do formulário para UMA visita: remarcada, cancelada ou adiada pelo
 * cliente mostra o status só para leitura (o back recusa trocá-lo).
 */
export const editVisitFormSteps = (status: string): FormStepSchema[] => [
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
            disabled: isVisitStatusLocked(status),
            hint: lockedVisitStatusHint(status),
            options: visitStatusOptionsFor(status),
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
