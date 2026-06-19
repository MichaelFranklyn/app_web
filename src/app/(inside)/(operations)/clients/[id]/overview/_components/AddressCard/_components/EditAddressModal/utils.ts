import { FormStepSchema } from "@/components/FormBuilder";
import { ClientData } from "../../../../interface";
import { UpdateAddressInput } from "./interface";

export const buildAddressFormSteps = (): FormStepSchema[] => [
  {
    id: "address",
    sections: [
      {
        id: "location",
        title: "Localização",
        fields: [
          {
            name: "addressStreet",
            type: "text",
            label: "Rua",
            placeholder: "Ex: Avenida Paulista",
            required: true,
          },
          {
            name: "addressNumber",
            type: "text",
            label: "Número",
            placeholder: "Ex: 1000",
            required: true,
          },
          {
            name: "addressComplement",
            type: "text",
            label: "Complemento",
            placeholder: "Ex: Sala 101",
          },
          {
            name: "addressCity",
            type: "text",
            label: "Cidade",
            placeholder: "Ex: São Paulo",
            required: true,
          },
          {
            name: "addressState",
            type: "text",
            label: "Estado",
            placeholder: "Ex: SP",
            required: true,
          },
          {
            name: "addressZip",
            type: "text",
            label: "CEP",
            placeholder: "Ex: 01311-100",
            required: true,
          },
        ],
      },
    ],
  },
];

export const buildAddressInitialData = (
  address?: ClientData | null
): Record<string, unknown> => ({
  addressStreet: address?.addressStreet ?? "",
  addressNumber: address?.addressNumber ?? "",
  addressComplement: address?.addressComplement ?? "",
  addressCity: address?.addressCity ?? "",
  addressState: address?.addressState ?? "",
  addressZip: address?.addressZip ?? "",
});

export const normalizeAddressInput = (
  data: Record<string, unknown>
): UpdateAddressInput => ({
  addressStreet: String(data.addressStreet ?? ""),
  addressNumber: String(data.addressNumber ?? ""),
  addressComplement: data.addressComplement
    ? String(data.addressComplement)
    : undefined,
  addressCity: String(data.addressCity ?? ""),
  addressState: String(data.addressState ?? ""),
  addressZip: String(data.addressZip ?? ""),
});
