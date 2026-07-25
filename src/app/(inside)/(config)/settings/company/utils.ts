import { FormStepSchema } from "@/components/FormBuilder";
import { createCepAutofill } from "@/utils/cep";
import { maskCEP } from "@/utils/format/masks";
import { MyCompany, UpdateCompanyInput } from "./interface";

/**
 * Receitas dos blocos da tela: cada um tem os seus campos, o seu diff e os seus
 * valores iniciais. Ficam no pai porque a tela é quem monta os blocos — os cards
 * mostram os dados em leitura e o `EditCompanyModal` recebe a receita do assunto.
 */

const text = (value: unknown): string => String(value ?? "").trim();

// ----------------------------------------------------------- identificação
/** Só o segmento é editável aqui — CNPJ e razão social vêm da Receita. */
export const IDENTITY_FORM_STEPS: FormStepSchema[] = [
  {
    id: "identity",
    sections: [
      {
        id: "profile",
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
    ],
  },
];

export const normalizeIdentity = (
  data: Record<string, unknown>,
  initial: MyCompany
): UpdateCompanyInput => {
  const input: UpdateCompanyInput = {};

  const segment = String(data.segment ?? "").trim();
  if (segment && segment !== initial.segment) input.segment = segment;

  return input;
};

// ---------------------------------------------------------------- contato

export const CONTACT_FORM_STEPS: FormStepSchema[] = [
  {
    id: "contact",
    sections: [
      {
        id: "contact",
        fields: [
          {
            name: "phone",
            label: "Telefone",
            type: "phone",
            placeholder: "(00) 0000-0000",
            grid: { desktop: 12 },
          },
          {
            name: "whatsapp",
            label: "WhatsApp",
            type: "phone",
            placeholder: "(00) 00000-0000",
            grid: { desktop: 12 },
          },
          {
            name: "website",
            label: "Site",
            type: "text",
            placeholder: "https://suaempresa.com.br",
            grid: { desktop: 12 },
          },
        ],
      },
    ],
  },
];

export const normalizeContact = (
  data: Record<string, unknown>,
  initial: MyCompany
): UpdateCompanyInput => {
  const input: UpdateCompanyInput = {};

  const phone = text(data.phone);
  if (phone !== text(initial.phone)) input.phone = phone;

  const whatsapp = text(data.whatsapp);
  if (whatsapp !== text(initial.whatsapp)) input.whatsapp = whatsapp;

  const website = text(data.website);
  if (website !== text(initial.website)) input.website = website;

  return input;
};

export const buildContactInitialData = (
  company: MyCompany
): Record<string, unknown> => ({
  phone: company.phone ?? "",
  whatsapp: company.whatsapp ?? "",
  website: company.website ?? "",
});

// --------------------------------------------------------------- endereço

// Digitar o CEP preenche rua, bairro, cidade e UF (ViaCEP) — o endereço da
// empresa vai no PDF do pedido, e digitá-lo à mão é onde nascem os erros.
const fetchAddressByCep = createCepAutofill({
  street: "addressStreet",
  neighborhood: "addressNeighborhood",
  city: "addressCity",
  state: "addressState",
});

export const ADDRESS_FORM_STEPS: FormStepSchema[] = [
  {
    id: "address",
    sections: [
      {
        id: "address",
        fields: [
          {
            name: "addressZip",
            label: "CEP",
            type: "cep",
            placeholder: "00000-000",
            grid: { desktop: 3 },
            onChange: fetchAddressByCep,
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

export const normalizeAddress = (
  data: Record<string, unknown>,
  initial: MyCompany
): UpdateCompanyInput => {
  const input: UpdateCompanyInput = {};

  const zip = text(data.addressZip);
  if (zip !== text(initial.addressZip)) input.addressZip = zip;

  const street = text(data.addressStreet);
  if (street !== text(initial.addressStreet)) input.addressStreet = street;

  const number = text(data.addressNumber);
  if (number !== text(initial.addressNumber)) input.addressNumber = number;

  const complement = text(data.addressComplement);
  if (complement !== text(initial.addressComplement)) {
    input.addressComplement = complement;
  }

  const neighborhood = text(data.addressNeighborhood);
  if (neighborhood !== text(initial.addressNeighborhood)) {
    input.addressNeighborhood = neighborhood;
  }

  const city = text(data.addressCity);
  if (city !== text(initial.addressCity)) input.addressCity = city;

  const state = text(data.addressState).toUpperCase();
  if (state !== text(initial.addressState).toUpperCase()) {
    input.addressState = state;
  }

  return input;
};

export const buildAddressInitialData = (
  company: MyCompany
): Record<string, unknown> => ({
  addressZip: company.addressZip ?? "",
  addressStreet: company.addressStreet ?? "",
  addressNumber: company.addressNumber ?? "",
  addressComplement: company.addressComplement ?? "",
  addressNeighborhood: company.addressNeighborhood ?? "",
  addressCity: company.addressCity ?? "",
  addressState: company.addressState ?? "",
});

/**
 * Endereço da empresa numa linha, pulando o que estiver vazio — mesma forma do
 * endereço no perfil da pessoa. O CEP sai mascarado.
 */
export const formatCompanyAddress = (company: MyCompany): string => {
  const street = [company.addressStreet, company.addressNumber]
    .filter(Boolean)
    .join(", ");
  const city = [company.addressCity, company.addressState]
    .filter(Boolean)
    .join(" - ");
  const zip = company.addressZip ? maskCEP(company.addressZip) : null;
  return [
    street,
    company.addressComplement,
    company.addressNeighborhood,
    city,
    zip,
  ]
    .filter(Boolean)
    .join(" · ");
};
