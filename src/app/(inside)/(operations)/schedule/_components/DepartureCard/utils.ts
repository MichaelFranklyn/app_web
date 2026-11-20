import { FormStepSchema } from "@/components/FormBuilder";
import { createCepAutofill } from "@/utils/cep";

// Preenche os campos de endereço a partir do CEP digitado (ViaCEP). Usa nomes
// próprios (dep*) para não colidir com outros forms na mesma árvore.
const fetchAddressByCep = createCepAutofill({
  street: "depStreet",
  neighborhood: "depNeighborhood",
  city: "depCity",
  state: "depState",
});

// Form de endereço personalizado — mesmo desenho do endereço residencial do
// vendedor, para o vendedor reconhecer o preenchimento (CEP → autofill).
export const DEPARTURE_STEPS: FormStepSchema[] = [
  {
    id: "departure",
    sections: [
      {
        id: "address",
        fields: [
          {
            name: "depCep",
            type: "cep",
            label: "CEP",
            placeholder: "00000-000",
            grid: { mobile: 7 },
            onChange: fetchAddressByCep,
          },
          {
            name: "depState",
            type: "text",
            label: "UF",
            placeholder: "SP",
            required: true,
            grid: { mobile: 5 },
          },
          {
            name: "depCity",
            type: "text",
            label: "Cidade",
            placeholder: "Cidade",
            required: true,
            grid: { mobile: 6 },
          },
          {
            name: "depNeighborhood",
            type: "text",
            label: "Bairro",
            placeholder: "Bairro",
            grid: { mobile: 6 },
          },
          {
            name: "depStreet",
            type: "text",
            label: "Logradouro",
            placeholder: "Rua, Avenida...",
            required: true,
            grid: { mobile: 12 },
          },
          {
            name: "depNumber",
            type: "text",
            label: "Número",
            placeholder: "123",
            grid: { mobile: 12 },
          },
        ],
      },
    ],
  },
];

/**
 * Monta o endereço textual de partida no mesmo formato que o backend usa para a
 * casa do vendedor ("rua, número, bairro, cidade - UF"). A Google Routes API
 * geocodifica esse texto — não é preciso lat/lng. Retorna `null` se faltar o
 * mínimo (rua e cidade) para uma origem confiável.
 */
export function buildDepartureAddress(
  data: Record<string, unknown>
): string | null {
  const get = (k: string) => String(data[k] ?? "").trim();
  const street = get("depStreet");
  const city = get("depCity");
  if (!street || !city) return null;

  const number = get("depNumber");
  const neighborhood = get("depNeighborhood");
  const state = get("depState");

  const streetPart = number ? `${street}, ${number}` : street;
  const cityPart = state ? `${city} - ${state}` : city;
  return [streetPart, neighborhood, cityPart].filter(Boolean).join(", ");
}
