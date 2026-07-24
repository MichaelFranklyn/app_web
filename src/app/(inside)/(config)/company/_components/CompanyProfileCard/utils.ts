import { FormStepSchema } from "@/components/FormBuilder";
import { MyCompany, UpdateCompanyInput } from "../../interface";

export const FORM_STEPS: FormStepSchema[] = [
  {
    id: "company",
    sections: [
      {
        id: "profile",
        title: "Perfil",
        fields: [
          {
            name: "segment",
            label: "Segmento",
            type: "text",
            required: true,
            placeholder: "Ex: Material de construção",
            grid: { desktop: 12 },
          },
        ],
      },
      {
        id: "contact",
        title: "Contato",
        fields: [
          {
            name: "phone",
            label: "Telefone",
            type: "phone",
            placeholder: "(00) 0000-0000",
            grid: { desktop: 4 },
          },
          {
            name: "whatsapp",
            label: "WhatsApp",
            type: "phone",
            placeholder: "(00) 00000-0000",
            grid: { desktop: 4 },
          },
          {
            name: "website",
            label: "Site",
            type: "text",
            placeholder: "https://suaempresa.com.br",
            grid: { desktop: 4 },
          },
        ],
      },
      {
        id: "address",
        title: "Endereço",
        fields: [
          {
            name: "addressZip",
            label: "CEP",
            type: "cep",
            placeholder: "00000-000",
            grid: { desktop: 3 },
          },
          {
            name: "addressStreet",
            label: "Logradouro",
            type: "text",
            placeholder: "Ex: Av. Sete de Setembro",
            grid: { desktop: 7 },
          },
          {
            name: "addressNumber",
            label: "Número",
            type: "text",
            maxLength: 10,
            placeholder: "Ex: 1234",
            grid: { desktop: 2 },
          },
          {
            name: "addressComplement",
            label: "Complemento",
            type: "text",
            placeholder: "Ex: Sala 302",
            grid: { desktop: 5 },
          },
          {
            name: "addressNeighborhood",
            label: "Bairro",
            type: "text",
            placeholder: "Ex: Comércio",
            grid: { desktop: 7 },
          },
          {
            name: "addressCity",
            label: "Cidade",
            type: "text",
            placeholder: "Ex: Salvador",
            grid: { desktop: 8 },
          },
          {
            name: "addressState",
            label: "UF",
            type: "text",
            maxLength: 2,
            placeholder: "Ex: BA",
            grid: { desktop: 4 },
          },
        ],
      },
    ],
  },
];

const text = (value: unknown): string => String(value ?? "").trim();

/** Só o que mudou vai para a mutation (campo ausente = "não enviado"). */
export const normalizeInput = (
  data: Record<string, unknown>,
  initial: MyCompany
): UpdateCompanyInput => {
  const input: UpdateCompanyInput = {};

  const segment = text(data.segment);
  if (segment && segment !== initial.segment) input.segment = segment;

  const phone = text(data.phone);
  if (phone !== text(initial.phone)) input.phone = phone;

  const whatsapp = text(data.whatsapp);
  if (whatsapp !== text(initial.whatsapp)) input.whatsapp = whatsapp;

  const website = text(data.website);
  if (website !== text(initial.website)) input.website = website;

  const zip = text(data.addressZip);
  if (zip !== text(initial.addressZip)) input.addressZip = zip;

  const street = text(data.addressStreet);
  if (street !== text(initial.addressStreet)) input.addressStreet = street;

  const number = text(data.addressNumber);
  if (number !== text(initial.addressNumber)) input.addressNumber = number;

  const complement = text(data.addressComplement);
  if (complement !== text(initial.addressComplement))
    input.addressComplement = complement;

  const neighborhood = text(data.addressNeighborhood);
  if (neighborhood !== text(initial.addressNeighborhood))
    input.addressNeighborhood = neighborhood;

  const city = text(data.addressCity);
  if (city !== text(initial.addressCity)) input.addressCity = city;

  const state = text(data.addressState).toUpperCase();
  if (state !== text(initial.addressState)) input.addressState = state;

  return input;
};
