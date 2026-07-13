import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

// As chamadas do cliente vão para o BFF same-origin (/api/graphql), que injeta o
// token httpOnly no servidor. O cliente NÃO lê nem anexa o token (invisível ao
// JS) — sem authLink. `credentials: "same-origin"` garante que o cookie httpOnly
// acompanhe a requisição ao BFF.
const httpLink = new HttpLink({
  uri: "/api/graphql",
  credentials: "same-origin",
});

export function createApolloClient() {
  return new ApolloClient({
    ssrMode: false,
    link: httpLink,
    cache: new InMemoryCache(),
  });
}
