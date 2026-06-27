import { FormStepSchema } from "@/components/FormBuilder";
import { UpdateOrderInput } from "./interface";

export const EDIT_ORDER_FORM_STEPS: FormStepSchema[] = [
  {
    id: "order",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "notes",
            type: "textarea",
            label: "Observações",
            placeholder: "Observações adicionais...",
            rows: 4,
          },
        ],
      },
    ],
  },
];

/** Retorna apenas os campos alterados (para o input do update). */
export const normalizeUpdateInput = (
  data: Record<string, unknown>,
  initial: { notes: string | null }
): UpdateOrderInput => {
  const out: UpdateOrderInput = {};
  const nextNotes = data.notes != null ? String(data.notes).trim() : "";
  const initialNotes = (initial.notes ?? "").trim();
  if (nextNotes !== initialNotes) {
    out.notes = nextNotes === "" ? null : nextNotes;
  }
  return out;
};
