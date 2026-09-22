import { DocumentNode } from "graphql";
import { tokenFetch } from "./tokenFetch";

/**
 * Header do link de resposta da rota do dia. Próprio, e não o do portal: quem
 * responde a folha ESCREVE na rotina, e quem abre o portal só lê. Ver
 * `tokenFetch` e o `_extract_visit_token` do backend.
 */
export const VISIT_TOKEN_HEADER = "X-Visit-Token";

/** Busca do formulário de resposta da rota (`/r/[token]`). */
export async function visitResponseFetch<
  TData = unknown,
  TVariables = Record<string, unknown>,
>(
  query: DocumentNode | string,
  visitToken: string,
  variables?: TVariables
): Promise<TData | null> {
  return tokenFetch<TData, TVariables>(
    query,
    { header: VISIT_TOKEN_HEADER, token: visitToken },
    variables
  );
}
