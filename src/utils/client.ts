import { maskCNPJ, onlyDigits } from "@/utils/format/masks";
import { matchesSearchText } from "@/utils/search";

interface NamedClient {
  razaoSocial?: string | null;
  nomeFantasia?: string | null;
}

/**
 * Nome de exibição de um cliente. A razão social é o identificador canônico —
 * é ela que a carteira em /clients destaca e a busca prioriza. O nome fantasia
 * só entra quando não há razão social, e nunca como string vazia.
 */
export const clientDisplayName = (
  client: NamedClient | null | undefined,
  fallback = "Cliente —"
): string => {
  if (!client) return fallback;
  return client.razaoSocial?.trim() || client.nomeFantasia?.trim() || fallback;
};

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

/** O que os filtros locais (relatórios) sabem de cada cliente da linha. */
export interface ClientSearchFields {
  /** Nome de exibição (nome fantasia ou razão social). */
  name?: string | null;
  razaoSocial?: string | null;
  cnpj?: string | null;
}

/**
 * Busca de cliente nos filtros que rodam no navegador: nome, razão social e
 * CNPJ (com ou sem máscara). É a mesma regra da busca no servidor, para que o
 * termo que acha o cliente numa tela ache em todas.
 */
export const matchesClientSearch = (
  client: ClientSearchFields,
  term: string
): boolean =>
  matchesSearchText(
    [client.name, client.razaoSocial, client.cnpj].filter(Boolean).join(" "),
    term
  );
