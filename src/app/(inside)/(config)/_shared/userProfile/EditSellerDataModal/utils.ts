import { FormStepSchema } from "@/components/FormBuilder";
import { ProfileSeller } from "../interface";
import { UpdateSellerInput } from "./interface";

/**
 * Só a atuação em campo. Nome, telefone, CPF e endereço são da pessoa e se
 * editam em "Dados pessoais" (`updateMyProfile` / `updateUser`) — a região é o
 * único dado que existe por causa da venda.
 *
 * A região vai mesmo quando vazia: apagar a região é uma edição legítima.
 */
export const normalizeSellerInput = (
  data: Record<string, unknown>
): UpdateSellerInput => ({
  region: String(data.region ?? "").trim(),
});

export const SELLER_FORM_STEPS: FormStepSchema[] = [
  {
    id: "seller",
    sections: [
      {
        id: "field",
        title: "Atuação em campo",
        fields: [
          {
            name: "region",
            type: "text",
            label: "Região(ões)",
            placeholder: "Ex: Sul, Nordeste, Centro-Oeste",
            hint: "Separe por vírgula quando atender mais de uma.",
          },
        ],
      },
    ],
  },
];

export const buildSellerInitialData = (
  seller: ProfileSeller
): Record<string, unknown> => ({
  region: seller.region ?? "",
});
