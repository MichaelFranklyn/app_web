import { getCookie } from "@/utils/cookies/clientCookie";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_HOST,
});

// Lê o token dos cookies a cada requisição (não em cache)
const authLink = new ApolloLink((operation, forward) => {
  if (typeof window !== "undefined") {
    let token = getCookie<string>("token");
    const code = getCookie<string>("code");
    if (!token && code) token = code;

    operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }));
  }

  return forward(operation);
});

export function createApolloClient() {
  return new ApolloClient({
    ssrMode: false,
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}
