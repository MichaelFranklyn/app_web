import { DocumentNode } from "graphql";
import { tokenFetch } from "./tokenFetch";

/** Header do portal do cliente. Ver `tokenFetch` para o porquê de ser próprio. */
export const PORTAL_TOKEN_HEADER = "X-Portal-Token";

/**
 * Busca do portal do cliente (`/p/[token]`).
 *
 * Fina de propósito: tudo que importa — a separação do cookie de sessão, o
 * token que não chega ao navegador, o `null` para link inválido — está em
 * `tokenFetch`. O que esta função acrescenta é FIXAR o header, para nenhuma
 * chamada do portal poder escolher outro.
 */
export async function portalFetch<
  TData = unknown,
  TVariables = Record<string, unknown>,
>(
  query: DocumentNode | string,
  portalToken: string,
  variables?: TVariables
): Promise<TData | null> {
  return tokenFetch<TData, TVariables>(
    query,
    { header: PORTAL_TOKEN_HEADER, token: portalToken },
    variables
  );
}
