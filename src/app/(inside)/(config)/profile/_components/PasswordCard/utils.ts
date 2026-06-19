import { FormStepSchema } from "@/components/FormBuilder";

export const PASSWORD_FORM_STEPS: FormStepSchema[] = [
  {
    id: "password",
    sections: [
      {
        id: "fields",
        fields: [
          {
            name: "currentPassword",
            type: "password",
            label: "Senha atual",
            placeholder: "Sua senha atual",
            required: true,
          },
          {
            name: "newPassword",
            type: "password",
            label: "Nova senha",
            placeholder: "Mínimo 8 caracteres",
            required: true,
            hint: "Mínimo 8 caracteres",
          },
          {
            name: "confirmPassword",
            type: "password",
            label: "Confirmar nova senha",
            placeholder: "Repita a nova senha",
            required: true,
          },
        ],
      },
    ],
  },
];
