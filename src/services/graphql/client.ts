import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

import { logout } from "@/utils/auth/logout";

let isLoggingOut = false;

/**
 * O BFF devolve 401 quando o backend recusa a sessão (revogada, usuário
 * desativado) e já apaga os cookies. Sem isto a tela ficava de pé, vazia, com
 * cada consulta falhando em silêncio — o painel em branco de 27/11/2026. Uma
 * saída só, mesmo com várias consultas caindo juntas; no `/login` não há o que
 * fazer (recarregar nele seria um laço).
 */
const sessionAwareFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (
    response.status === 401 &&
    !isLoggingOut &&
    window.location.pathname !== "/login"
  ) {
    isLoggingOut = true;
    void logout();
  }
  return response;
};

// As chamadas do cliente vão para o BFF same-origin (/api/graphql), que injeta o
// token httpOnly no servidor. O cliente NÃO lê nem anexa o token (invisível ao
// JS) — sem authLink. `credentials: "same-origin"` garante que o cookie httpOnly
// acompanhe a requisição ao BFF.
const httpLink = new HttpLink({
  uri: "/api/graphql",
  credentials: "same-origin",
  fetch: sessionAwareFetch,
});

export function createApolloClient() {
  return new ApolloClient({
    ssrMode: false,
    link: httpLink,
    cache: new InMemoryCache(),
  });
}
