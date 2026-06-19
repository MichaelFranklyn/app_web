import { FormStepSchema } from "@/components/FormBuilder";
import { User } from "../../../interface";
import { UpdateUserInput } from "./interface";

export const normalizeInput = (
  data: Record<string, unknown>,
  initialData: User
): UpdateUserInput => {
  const normalized = {} as UpdateUserInput;

  if (data.name && String(data.name) !== initialData.name) {
    normalized.name = String(data.name);
  }

  if (data.email && String(data.email) !== initialData.email) {
    normalized.email = String(data.email);
  }

  if (initialData.role !== "OWNER") {
    const roleValue = (data.role as { value: string })?.value ?? data.role;
    if (roleValue && roleValue !== initialData.role) {
      normalized.role = String(roleValue);
    }
  }

  return normalized;
};

export const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrador" },
  { value: "SELLER", label: "Vendedor" },
];

export const ROLE_OPTIONS_WITH_OWNER = [
  { value: "OWNER", label: "Proprietário" },
  ...ROLE_OPTIONS,
];

export const buildFormSteps = (user: User): FormStepSchema[] => {
  const isOwner = user.role === "OWNER";

  return [
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
              options: isOwner ? ROLE_OPTIONS_WITH_OWNER : ROLE_OPTIONS,
              required: true,
              disabled: isOwner,
              hint: isOwner
                ? "O perfil de proprietário não pode ser alterado."
                : undefined,
            },
          ],
        },
      ],
    },
  ];
};
