import { FormStepSchema } from "@/components/FormBuilder";

// Só a região: nome e e-mail vêm do cadastro, CPF e endereço já são do usuário.
export const REGION_FORM_STEPS: FormStepSchema[] = [
  {
    id: "seller",
    sections: [
      {
        id: "field",
        fields: [
          {
            name: "region",
            type: "text",
            label: "Região(ões) que vai atender",
            placeholder: "Ex: Sul, Nordeste, Centro-Oeste",
            hint: "Pode deixar em branco e preencher depois.",
          },
        ],
      },
    ],
  },
];
