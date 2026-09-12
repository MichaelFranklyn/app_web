import { REMOVE_PUSH_SUBSCRIPTION_MUTATION } from "./gql";
import { unsubscribe } from "./browser";
import { print } from "graphql";

/**
 * Esquece este aparelho ao sair do sistema.
 *
 * Sem isto, o celular continuaria recebendo os avisos de quem saiu — e o caso
 * não é hipotético: o aparelho do escritório passa de mão em mão, e a inscrição
 * é do NAVEGADOR, não do login. É o mesmo motivo pelo qual o service worker não
 * guarda nada de sessão em cache.
 *
 * Roda ANTES de derrubar a sessão: a mutation precisa do cookie de autenticação
 * que o logout vai apagar em seguida. Vai pelo BFF (`/api/graphql`) no braço, e
 * não pelo Apollo, porque o logout acontece fora da árvore do React.
 *
 * Nunca levanta: sair do sistema não pode depender de rede.
 */
export async function forgetDeviceOnLogout(): Promise<void> {
  try {
    const endpoint = await unsubscribe();
    if (!endpoint) return;

    await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "RemovePushSubscription",
        query: print(REMOVE_PUSH_SUBSCRIPTION_MUTATION),
        variables: { endpoint },
      }),
    });
  } catch {
    // O navegador já descartou a inscrição na maioria dos casos; se o registro
    // sobreviver no banco, o primeiro envio recebe 410 e o desliga sozinho.
  }
}
