import { FormStepSchema } from "@/components/FormBuilder";

import { BillingData } from "../../interface";

/**
 * Quem recebe a nota. Três campos e nada mais — o cadastro completo da empresa
 * é feito depois, no `/signup`.
 *
 * A validação é a do próprio FormBuilder (`cnpj` confere os dígitos
 * verificadores, `email` o formato): antes havia um `validateBilling` à mão que
 * só olhava a quantidade de dígitos e deixava passar CNPJ impossível.
 */
export const BILLING_STEPS: FormStepSchema[] = [
  {
    id: "billing",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "companyName",
            type: "text",
            label: "Razão social",
            required: true,
            minLength: 3,
          },
          { name: "document", type: "cnpj", label: "CNPJ", required: true },
          {
            name: "email",
            type: "email",
            label: "E-mail para a nota",
            required: true,
          },
        ],
      },
    ],
  },
];

export const toBillingData = (data: Record<string, unknown>): BillingData => ({
  companyName: String(data.companyName ?? "").trim(),
  document: String(data.document ?? "").trim(),
  email: String(data.email ?? "").trim(),
});
