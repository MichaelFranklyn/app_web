import { FormStepSchema } from "@/components/FormBuilder";
import { RegisterCompanyInput, SignUpFormData } from "./interface";

export const MIN_PASSWORD_LENGTH = 8;

/**
 * Valida o formulário antes de chamar a mutation. Retorna a mensagem de erro
 * (para o toast) ou null quando está tudo certo. A confirmação de senha é
 * checada aqui porque o FormBuilder não faz validação entre campos.
 */
export const validateSignUp = (data: SignUpFormData): string | null => {
  if (data.ownerPassword.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (data.ownerPassword !== data.confirmPassword) {
    return "As senhas não conferem.";
  }
  return null;
};

export const normalizeInput = (data: SignUpFormData): RegisterCompanyInput => ({
  cnpj: String(data.cnpj ?? ""),
  segment: String(data.segment ?? "").trim(),
  ownerName: String(data.ownerName ?? "").trim(),
  ownerEmail: String(data.ownerEmail ?? "").trim(),
  ownerPassword: String(data.ownerPassword ?? ""),
});

export const FORM_STEPS: FormStepSchema[] = [
  {
    id: "company",
    title: "Sua empresa",
    description: "Informe o CNPJ — preenchemos os dados da empresa para você.",
    sections: [
      {
        id: "company",
        fields: [
          {
            name: "cnpj",
            type: "cnpj",
            label: "CNPJ",
            placeholder: "00.000.000/0000-00",
            hint: "Usamos o CNPJ para preencher os dados da empresa automaticamente.",
            required: true,
          },
          {
            name: "segment",
            type: "text",
            label: "Segmento",
            placeholder: "Ex.: Representação Comercial",
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "access",
    title: "Seus dados de acesso",
    description: "Com esses dados você entra na plataforma.",
    sections: [
      {
        id: "owner",
        fields: [
          {
            name: "ownerName",
            type: "text",
            label: "Seu nome",
            placeholder: "Nome completo",
            required: true,
          },
          {
            name: "ownerEmail",
            type: "email",
            label: "E-mail",
            placeholder: "voce@empresa.com.br",
            hint: "Será o seu login de acesso.",
            required: true,
          },
          {
            name: "ownerPassword",
            type: "password",
            label: "Senha",
            placeholder: "Mínimo de 8 caracteres",
            minLength: MIN_PASSWORD_LENGTH,
            required: true,
          },
          {
            name: "confirmPassword",
            type: "password",
            label: "Confirmar senha",
            placeholder: "Repita a senha",
            required: true,
          },
        ],
      },
    ],
  },
];
