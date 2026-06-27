import { FormStepSchema } from "@/components/FormBuilder";
import { createCepAutofill } from "@/utils/cep";
import { onlyDigits } from "@/utils/format/masks";
import { UpdateSellerInput } from "./interface";

export const normalizeInput = (
  data: Record<string, unknown>
): UpdateSellerInput => ({
  ...(data.name ? { name: String(data.name) } : {}),
  ...(data.phone ? { phone: onlyDigits(String(data.phone)) } : {}),
  ...(data.region ? { region: String(data.region) } : {}),
  ...(data.homeCep ? { homeCep: onlyDigits(String(data.homeCep)) } : {}),
  ...(data.homeStreet ? { homeStreet: String(data.homeStreet) } : {}),
  ...(data.homeNumber ? { homeNumber: String(data.homeNumber) } : {}),
  ...(data.homeComplement
    ? { homeComplement: String(data.homeComplement) }
    : {}),
  ...(data.homeNeighborhood
    ? { homeNeighborhood: String(data.homeNeighborhood) }
    : {}),
  ...(data.homeCity ? { homeCity: String(data.homeCity) } : {}),
  ...(data.homeState ? { homeState: String(data.homeState) } : {}),
});

const fetchAddressByCep = createCepAutofill({
  street: "homeStreet",
  neighborhood: "homeNeighborhood",
  city: "homeCity",
  state: "homeState",
});

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
            name: "phone",
            type: "phone",
            label: "Telefone",
            placeholder: "(00) 00000-0000",
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
