import { FormStepSchema } from "@/components/FormBuilder";
import { AddClientInput } from "./interface";

export const normalizeInput = (
  data: Record<string, unknown>
): AddClientInput => {
  const cnpj = String(data.cnpj ?? "").replace(/\D/g, "");

  return {
    cnpj,
    notes: data.notes ? String(data.notes) : null,
  };
};

export const FORM_STEPS: FormStepSchema[] = [
  {
    id: "client",
    sections: [
      {
        id: "identification",
        title: "Identificação",
        fields: [
          {
            name: "cnpj",
            type: "text",
            label: "CNPJ",
            placeholder: "00.000.000/0000-00",
            required: true,
          },
        ],
      },
      {
        id: "link",
        title: "Dados internos",
        fields: [
          {
            name: "notes",
            type: "textarea",
            label: "Observações",
            placeholder: "Informações relevantes sobre o cliente...",
          },
        ],
      },
    ],
  },
];
