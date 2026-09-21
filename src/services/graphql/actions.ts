"use server";

import { updateTag } from "next/cache";

/**
 * ⚠️ SEM EFEITO HOJE — e de propósito.
 *
 * Estas ações invalidam TAGS do Data Cache do Next. Só que `gqlFetch` manda
 * `cache: "no-store"` e nunca repassa `next: { tags }`, então nenhuma resposta
 * do backend entra no Data Cache e não há tag a invalidar. O `cache: { tags }`
 * que as páginas passam ao `executeServerQueries` também é ignorado por isso.
 *
 * Isso NÃO é um defeito a corrigir ligando o cache: a resposta do backend é de
 * UM usuário e de UM tenant, e o Data Cache é por deploy, não por sessão —
 * guardá-la ali serviria a carteira de um vendedor para o próximo. O SSR
 * sempre fresco é a decisão.
 *
 * Ficam aqui porque a alternativa (apagar) reabriria a discussão a cada leitura
 * do `gqlFetch`. Quem precisa reconciliar o cache do CLIENTE usa
 * `useInvalidateQueries` com as listas de `@/utils/cacheFields`.
 */
export async function invalidateCache(tag: string) {
  updateTag(tag);
}

export async function invalidateCacheMany(tags: string[]) {
  for (const tag of tags) {
    updateTag(tag);
  }
}
