import { FormStepSchema } from "@/components/FormBuilder";
import { onlyDigits } from "@/utils/format/masks";

import { FactoryContact } from "../interface";

/** Mesmos campos no cadastro e na edição — o formulário é um só. */
export const CONTACT_FORM_STEPS: FormStepSchema[] = [
  {
    id: "contact",
    sections: [
      {
        id: "contact",
        fields: [
          {
            name: "name",
            type: "text",
            label: "Nome",
            placeholder: "Nome de quem atende",
            required: true,
          },
          {
            name: "role",
            type: "text",
            label: "Cargo",
            placeholder: "Ex: Representante, Televendas",
          },
          {
            name: "phone",
            type: "phone",
            label: "Telefone",
            placeholder: "(00) 00000-0000",
            hint: "É por este número que o pedido sai no WhatsApp. Com DDD.",
          },
          {
            name: "email",
            type: "email",
            label: "E-mail",
            placeholder: "contato@fabrica.com",
          },
          {
            name: "isPrimary",
            type: "switch",
            label: "Contato principal",
            options: [{ value: "true", label: "Marcar como principal" }],
            hint: "O envio do pedido usa o principal; sem nenhum marcado, pega o primeiro com telefone.",
          },
        ],
      },
    ],
  },
];

export function buildContactInitialData(
  contact: FactoryContact
): Record<string, unknown> {
  return {
    name: contact.name,
    role: contact.role ?? "",
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    isPrimary: contact.isPrimary ? ["true"] : [],
  };
}

/** O switch do FormBuilder devolve array de valores marcados. */
export function readIsPrimary(data: Record<string, unknown>): boolean {
  return Array.isArray(data.isPrimary) && data.isPrimary.includes("true");
}

export function readPhone(data: Record<string, unknown>): string {
  return data.phone ? onlyDigits(String(data.phone)) : "";
}
