import { FormStepSchema } from "@/components/FormBuilder";
import { ProvisionCompanyInput } from "./interface";

/**
 * Monta o input da mutation. A senha é opcional: em branco, o backend gera um
 * link de primeiro acesso em vez de definir uma senha. Enviamos `ownerPassword`
 * apenas quando preenchida (senão fica nulo, sinalizando "gerar link").
 */
export const normalizeInput = (
  data: Record<string, unknown>
): ProvisionCompanyInput => {
  const password = String(data.ownerPassword ?? "").trim();

  return {
    cnpj: String(data.cnpj ?? ""),
    segment: String(data.segment ?? "").trim(),
    ownerName: String(data.ownerName ?? "").trim(),
    ownerEmail: String(data.ownerEmail ?? "").trim(),
    ownerPassword: password.length > 0 ? password : null,
  };
};

export const FORM_STEPS: FormStepSchema[] = [
  {
    id: "provision",
    sections: [
      {
        id: "company",
        title: "Empresa",
        description:
          "Informe o CNPJ — a razão social e o endereço são preenchidos automaticamente pela Receita.",
        fields: [
          {
            name: "cnpj",
            type: "cnpj",
            label: "CNPJ",
            placeholder: "00.000.000/0000-00",
            required: true,
          },
          {
            name: "segment",
            type: "text",
            label: "Segmento",
            placeholder: "Ex.: Representação Comercial",
            hint: "Ramo de atuação da empresa.",
            required: true,
          },
        ],
      },
      {
        id: "owner",
        title: "Responsável (primeiro acesso)",
        description:
          "Esta pessoa será o proprietário da conta e poderá cadastrar os demais usuários.",
        fields: [
          {
            name: "ownerName",
            type: "text",
            label: "Nome do responsável",
            placeholder: "Nome completo",
            required: true,
          },
          {
            name: "ownerEmail",
            type: "email",
            label: "E-mail do responsável",
            placeholder: "email@empresa.com",
            hint: "Será o login de acesso à conta.",
            required: true,
          },
          {
            name: "ownerPassword",
            type: "password",
            label: "Senha inicial (opcional)",
            placeholder: "Deixe em branco para gerar um link",
            hint: "Se ficar em branco, geramos um link de primeiro acesso para o responsável criar a própria senha.",
          },
        ],
      },
    ],
  },
];
