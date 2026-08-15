import { DocumentNode, OperationDefinitionNode, print } from "graphql";

const GQL_URI = process.env.NEXT_PUBLIC_GRAPHQL_API_HOST || "";

/**
 * Busca do portal do cliente. Separada de `gqlFetch` de propósito.
 *
 * `gqlFetch` lê o cookie de sessão e o manda no `Authorization`. Quem abre o
 * portal não tem sessão — tem um token opaco que veio no endereço —, e as duas
 * credenciais não podem compartilhar a mesma função: bastaria um esquecimento
 * para uma requisição do portal sair carregando o cookie de quem estivesse
 * logado no mesmo navegador, e passar a responder com os dados DELE.
 *
 * Roda só no servidor (Server Components). O token nunca vai para o bundle do
 * cliente, então nem um script de terceiro na página consegue lê-lo — a única
 * cópia que sobra é a do endereço, na mão de quem recebeu o link.
 */
export async function portalFetch<
  TData = unknown,
  TVariables = Record<string, unknown>,
>(
  query: DocumentNode | string,
  portalToken: string,
  variables?: TVariables
): Promise<TData | null> {
  const queryString = typeof query === "string" ? query : print(query);
  const operationName =
    typeof query === "string"
      ? query.match(/(?:query|mutation)\s+(\w+)/)?.[1]
      : (
          query.definitions.find((d) => d.kind === "OperationDefinition") as
            | OperationDefinitionNode
            | undefined
        )?.name?.value;

  const uri = operationName ? `${GQL_URI}?op=${operationName}` : GQL_URI;

  const response = await fetch(uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Portal-Token": portalToken,
    },
    body: JSON.stringify({ query: queryString, variables, operationName }),
    cache: "no-store",
  });

  if (!response.ok) return null;

  const json = (await response.json()) as {
    data?: TData;
    errors?: Array<{ message: string }>;
  };

  // Link vencido, revogado ou inventado chega aqui como erro de GraphQL, e a
  // resposta é sempre a mesma tela ("este link não vale mais"). Por isso o
  // `null` no lugar de um throw: não há erro a diferenciar nem stack a mostrar
  // para quem está do outro lado — só um recado.
  if (json.errors?.length) return null;

  return json.data ?? null;
}
