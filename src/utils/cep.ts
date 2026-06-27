import { onlyDigits } from "@/utils/format/masks";

export interface CepAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Consulta o ViaCEP. Retorna `null` se o CEP for inválido (≠ 8 dígitos),
 * não encontrado ou se a requisição falhar (o usuário preenche manualmente).
 */
export async function fetchAddressByCep(
  cep: string
): Promise<CepAddress | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return {
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Cria um handler de `onChange` para o FormBuilder que preenche os campos de
 * endereço a partir do CEP digitado. Recebe o mapa nome-do-campo-no-form →
 * parte do endereço, já que cada form usa nomes próprios (ex.: `homeStreet`).
 */
export function createCepAutofill(fields: {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}) {
  return async (
    value: unknown,
    setValue: (name: string, value: unknown) => void
  ) => {
    const address = await fetchAddressByCep(String(value ?? ""));
    if (!address) return;
    setValue(fields.street, address.street);
    setValue(fields.neighborhood, address.neighborhood);
    setValue(fields.city, address.city);
    setValue(fields.state, address.state);
  };
}
