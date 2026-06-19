import { FormStepSchema } from "@/components/FormBuilder";
import { onlyDigits } from "@/utils/format/masks";

export interface CreateSellerInput {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  region?: string;
  homeCep?: string;
  homeStreet?: string;
  homeNumber?: string;
  homeComplement?: string;
  homeNeighborhood?: string;
  homeCity?: string;
  homeState?: string;
}

export const normalizeInput = (data: Record<string, unknown>): CreateSellerInput => ({
  name: String(data.name ?? ""),
  email: String(data.email ?? ""),
  ...(data.phone ? { phone: onlyDigits(String(data.phone)) } : {}),
  ...(data.cpf ? { cpf: String(data.cpf) } : {}),
  ...(data.region ? { region: String(data.region) } : {}),
  ...(data.homeCep ? { homeCep: onlyDigits(String(data.homeCep)) } : {}),
  ...(data.homeStreet ? { homeStreet: String(data.homeStreet) } : {}),
  ...(data.homeNumber ? { homeNumber: String(data.homeNumber) } : {}),
  ...(data.homeComplement ? { homeComplement: String(data.homeComplement) } : {}),
  ...(data.homeNeighborhood ? { homeNeighborhood: String(data.homeNeighborhood) } : {}),
  ...(data.homeCity ? { homeCity: String(data.homeCity) } : {}),
  ...(data.homeState ? { homeState: String(data.homeState) } : {}),
});

async function fetchAddressByCep(
  value: unknown,
  setValue: (name: string, value: unknown) => void
) {
  const digits = onlyDigits(String(value ?? ""));
  if (digits.length !== 8) return;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = await res.json();
    if (data.erro) return;
    setValue("homeStreet", data.logradouro ?? "");
    setValue("homeNeighborhood", data.bairro ?? "");
    setValue("homeCity", data.localidade ?? "");
    setValue("homeState", data.uf ?? "");
  } catch {
    // user fills manually
  }
}

export const FORM_STEPS: FormStepSchema[] = [
  {
    id: "seller",
    sections: [
      {
        id: "identification",
        title: "Dados do vendedor",
        fields: [
          {
            name: "name",
            type: "text",
            label: "Nome",
            placeholder: "Nome completo",
            required: true,
          },
          {
            name: "email",
            type: "email",
            label: "E-mail",
            placeholder: "email@exemplo.com",
            required: true,
          },
          {
            name: "phone",
            type: "phone",
            label: "Telefone",
            placeholder: "(00) 00000-0000",
          },
          {
            name: "cpf",
            type: "cpf",
            label: "CPF",
            placeholder: "000.000.000-00",
          },
          {
            name: "region",
            type: "text",
            label: "Região(ões)",
            placeholder: "Ex: Sul, Nordeste, Centro-Oeste",
          },
        ],
      },
      {
        id: "address",
        title: "Endereço residencial",
        fields: [
          {
            name: "homeCep",
            type: "cep",
            label: "CEP",
            placeholder: "00000-000",
            required: true,
            grid: { mobile: 7 },
            onChange: fetchAddressByCep,
          },
          {
            name: "homeState",
            type: "text",
            label: "UF",
            placeholder: "SP",
            required: true,
            grid: { mobile: 5 },
          },
          {
            name: "homeCity",
            type: "text",
            label: "Cidade",
            placeholder: "Cidade",
            required: true,
            grid: { mobile: 6 },
          },
          {
            name: "homeNeighborhood",
            type: "text",
            label: "Bairro",
            placeholder: "Bairro",
            required: true,
            grid: { mobile: 6 },
          },
          {
            name: "homeStreet",
            type: "text",
            label: "Logradouro",
            placeholder: "Rua, Avenida...",
            required: true,
            grid: { mobile: 12 },
          },
          {
            name: "homeNumber",
            type: "text",
            label: "Número",
            placeholder: "123",
            required: true,
            grid: { mobile: 3 },
          },
          {
            name: "homeComplement",
            type: "text",
            label: "Complemento",
            placeholder: "Apto, Bloco...",
            grid: { mobile: 9 },
          },
        ],
      },
    ],
  },
];
