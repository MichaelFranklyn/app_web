import { FormStepSchema } from "@/components/FormBuilder";
import { UpdateNotesInput } from "./interface";

export const buildNotesFormSteps = (): FormStepSchema[] => [
  {
    id: "notes",
    sections: [
      {
        id: "private-notes",
        title: "Notas Privadas",
        fields: [
          {
            name: "notes",
            type: "textarea",
            label: "Observações",
            placeholder: "Adicione anotações sobre este cliente...",
          },
        ],
      },
    ],
  },
];

export const normalizeNotesInput = (
  data: Record<string, unknown>
): UpdateNotesInput => ({
  notes: String(data.notes ?? ""),
});
