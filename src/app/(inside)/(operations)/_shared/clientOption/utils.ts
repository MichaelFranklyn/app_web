import { maskCNPJ, onlyDigits } from "@/utils/format/masks";

export interface ClientOptionSource {
  razaoSocial: string;
  nomeFantasia?: string | null;
  cnpj?: string | null;
}

/**
 * Rótulo do cliente nos selects de pedido: nome seguido do CNPJ.
 *
 * O CNPJ vai junto porque é assim que a fábrica identifica o cliente na nota, e
 * porque nomes se repetem (mesma rede, filiais diferentes) — só o nome não
 * distingue qual das lojas está comprando.
 */
export const clientOptionLabel = (client: ClientOptionSource): string => {
  const name = client.nomeFantasia ?? client.razaoSocial;
  return client.cnpj ? `${name} · ${maskCNPJ(client.cnpj)}` : name;
};

/**
 * Texto extra do filtro (`SelectOption.searchText`): permite achar o cliente
 * pela razão social mesmo quando o rótulo mostra o nome fantasia. O CNPJ sem
 * pontuação já é coberto pelo filtro do InputSelect, que compara dígitos.
 */
export const clientOptionSearchText = (client: ClientOptionSource): string =>
  [
    client.razaoSocial,
    client.nomeFantasia,
    client.cnpj && onlyDigits(client.cnpj),
  ]
    .filter(Boolean)
    .join(" ");
