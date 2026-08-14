import { ToastProvider } from "@/components/Toast/Provider";
import { GraphqlProvider } from "@/services/graphql/provider";

/**
 * Contexto de aplicação: Apollo + toasts.
 *
 * Vive aqui, e não no layout raiz, porque a landing pública (`(marketing)`) é
 * estática e não fala com o backend — montar o ApolloProvider nela mandaria o
 * cliente do Apollo para o navegador de quem só veio ler a página inicial, no
 * momento em que a primeira pintura é o que mais importa.
 *
 * Quem precisa do par embrulha a própria subárvore: `(auth)`, `(inside)` e
 * `(platform)`. Não é um componente cliente — é um servidor que compõe dois
 * providers de cliente, então `children` continua renderizando no servidor.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GraphqlProvider>
      <ToastProvider>{children}</ToastProvider>
    </GraphqlProvider>
  );
}
