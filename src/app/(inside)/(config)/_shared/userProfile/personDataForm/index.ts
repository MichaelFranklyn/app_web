import { FormStepSchema } from "@/components/FormBuilder";
import { createCepAutofill } from "@/utils/cep";
import { toIsoDate } from "@/utils/format/date";
import { onlyDigits } from "@/utils/format/masks";
import { UserDetail } from "../interface";
import { PersonDataInput } from "./types";

export type { PersonDataInput } from "./types";

// O CEP preenche logradouro/bairro/cidade/UF — o endereço da pessoa é também o
// ponto de partida da rota do dia, então vale poupar digitação e erro de grafia.
const fetchAddressByCep = createCepAutofill({
  street: "addressStreet",
  neighborhood: "addressNeighborhood",
  city: "addressCity",
  state: "addressState",
});

/**
 * DOIS passos, um assunto cada: identificação e endereço. São 12 campos — em
 * bloco único a pessoa rola sem saber quanto falta.
 *
 * Os mesmos campos nas duas mãos — o que muda é para quem a frase fala: a pessoa
 * editando o seu cadastro lê "Quem você é"; o gestor completando o cadastro de
 * alguém lê "Quem é esta pessoa".
 */
export const buildPersonFormSteps = (isSelf: boolean): FormStepSchema[] => [
  {
    id: "identity",
    title: isSelf ? "Quem você é" : "Quem é esta pessoa",
    sections: [
      {
        id: "identity",
        title: isSelf ? "Quem você é" : "Quem é esta pessoa",
        fields: [
          {
            name: "name",
            type: "text",
            label: "Nome",
            placeholder: isSelf ? "Seu nome completo" : "Nome completo",
            required: true,
            grid: { desktop: 6 },
          },
          {
            name: "email",
            type: "email",
            label: "E-mail de acesso",
            placeholder: isSelf ? "seu@email.com" : "email@empresa.com.br",
            required: true,
            grid: { desktop: 6 },
          },
          // Um embaixo do outro, em largura cheia: em três colunas o seletor de
          // data fica estreito demais e o rótulo trunca.
          {
            name: "cpf",
            type: "cpf",
            label: "CPF",
            placeholder: "000.000.000-00",
            grid: { desktop: 12 },
          },
          {
            name: "phone",
            type: "phone",
            label: "Telefone",
            placeholder: "(00) 00000-0000",
            grid: { desktop: 12 },
          },
          {
            name: "birthDate",
            type: "date",
            label: "Data de nascimento",
            grid: { desktop: 12 },
          },
        ],
      },
    ],
  },
  {
    id: "address",
    title: isSelf ? "Onde você mora" : "Onde esta pessoa mora",
    sections: [
      {
        id: "address",
        fields: [
          {
            name: "addressZip",
            type: "cep",
            label: "CEP",
            placeholder: "00000-000",
            grid: { desktop: 3 },
            onChange: fetchAddressByCep,
          },
          {
            name: "addressStreet",
            type: "text",
            label: "Logradouro",
            placeholder: "Ex: Rua das Acácias",
            grid: { desktop: 7 },
          },
          {
            name: "addressNumber",
            type: "text",
            label: "Número",
            maxLength: 10,
            placeholder: "Ex: 120",
            grid: { desktop: 2 },
          },
          {
            name: "addressComplement",
            type: "text",
            label: "Complemento",
            placeholder: "Ex: Apto 302",
            grid: { desktop: 5 },
          },
          {
            name: "addressNeighborhood",
            type: "text",
            label: "Bairro",
            placeholder: "Ex: Pituba",
            grid: { desktop: 7 },
          },
          {
            name: "addressCity",
            type: "text",
            label: "Cidade",
            placeholder: "Ex: Salvador",
            grid: { desktop: 8 },
          },
          {
            name: "addressState",
            type: "text",
            label: "UF",
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

// Campos de texto simples: mesmo nome no form, no input e no perfil.
const TEXT_FIELDS = [
  "addressStreet",
  "addressNumber",
  "addressComplement",
  "addressNeighborhood",
  "addressCity",
] as const;

/**
 * Campos que o usuário digita com máscara e que o banco guarda cru. Comparar
 * pelos dígitos evita um update falso só porque a máscara mudou — e mantém um
 * formato só na coluna, que era o problema de ter telefone em duas tabelas.
 */
const DIGIT_FIELDS = ["cpf", "phone", "addressZip"] as const;

/** Só o que mudou vai para a mutation (campo ausente = "não enviado"). */
export const normalizePersonData = (
  data: Record<string, unknown>,
  initial: UserDetail
): PersonDataInput => {
  const out: PersonDataInput = {};

  const name = text(data.name);
  if (name && name !== initial.name) out.name = name;

  const email = text(data.email).toLowerCase();
  if (email && email !== initial.email.toLowerCase()) out.email = email;

  for (const field of TEXT_FIELDS) {
    const value = text(data[field]);
    if (value !== text(initial[field])) out[field] = value;
  }

  const state = text(data.addressState).toUpperCase();
  if (state !== text(initial.addressState).toUpperCase()) {
    out.addressState = state;
  }

  for (const field of DIGIT_FIELDS) {
    const value = onlyDigits(text(data[field]));
    if (value !== onlyDigits(text(initial[field]))) out[field] = value;
  }

  // O campo `date` do FormBuilder não devolve ISO puro — normalizar aqui evita
  // mandar "31/05/2026" para um scalar Date.
  const birthDate = toIsoDate(data.birthDate);
  if (birthDate !== toIsoDate(initial.birthDate)) out.birthDate = birthDate;

  return out;
};

/** Valores iniciais do form a partir do cadastro carregado. */
export const buildPersonInitialData = (
  profile: UserDetail
): Record<string, unknown> => ({
  name: profile.name,
  email: profile.email,
  cpf: profile.cpf ?? "",
  phone: profile.phone ?? "",
  birthDate: toIsoDate(profile.birthDate),
  addressZip: profile.addressZip ?? "",
  addressStreet: profile.addressStreet ?? "",
  addressNumber: profile.addressNumber ?? "",
  addressComplement: profile.addressComplement ?? "",
  addressNeighborhood: profile.addressNeighborhood ?? "",
  addressCity: profile.addressCity ?? "",
  addressState: profile.addressState ?? "",
});
