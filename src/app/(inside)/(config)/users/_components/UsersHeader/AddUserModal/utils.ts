import { FormStepSchema } from "@/components/FormBuilder";
import { CreateUserInput } from "./interface";

export const normalizeInput = (
  data: Record<string, unknown>
): CreateUserInput => {
  return {
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    role: String((data.role as { value: string })?.value ?? data.role ?? ""),
  };
};

export const FORM_STEPS: FormStepSchema[] = [
  {
    id: "user",
    sections: [
      {
        id: "identification",
        title: "Identificação",
        fields: [
          {
            name: "name",
            type: "text",
            label: "Nome",
            placeholder: "Nome do usuário",
            required: true,
          },
          {
            name: "email",
            type: "email",
            label: "E-mail",
            placeholder: "Digite o e-mail",
            required: true,
          },
          {
            name: "role",
            type: "radio",
            label: "Perfil",
            placeholder: "Perfil do usuário",
            options: [
              { value: "ADMIN", label: "Administrador" },
              { value: "SELLER", label: "Vendedor" },
            ],
            required: true,
          },
        ],
      },
    ],
  },
];
