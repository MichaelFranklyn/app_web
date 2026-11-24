"use client";

import { RefObject, useEffect, useLayoutEffect, useState } from "react";
import { PHONE_QUERY } from "@/hooks/useIsPhone";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Conta o que é botão/link de ação; a busca não conta (ela tem a linha dela).
// O skeleton do `loading.tsx` (ListPageSkeleton) conta também: sem isso a faixa
// de espera ficava numa linha só e, quando os botões reais chegavam empilhados,
// a página inteira descia ~120px no celular (/orders "tremendo", 17/11/2026).
function countActions(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll("button, a[href], :scope > .skeleton-shimmer")
  ).filter((el) => el.closest("[data-input-root]") === null).length;
}

/**
 * No celular, ações de página com 2+ botões seguem UM padrão só: empilhadas,
 * cada uma com ícone e título, na largura toda. Antes cada tela caía num
 * estágio diferente conforme coubesse (texto lado a lado em /factories, só
 * ícone em /clients) e o usuário pediu coerência (14/11/2026). Um botão só
 * já ocupa a linha inteira e não muda.
 */
export function useStackOnPhone(actionsRef: RefObject<HTMLDivElement | null>) {
  const [stack, setStack] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const actions = actionsRef.current;
    if (!actions) return;
    const media = window.matchMedia(PHONE_QUERY);
    const update = () => setStack(media.matches && countActions(actions) > 1);

    update();
    media.addEventListener("change", update);
    // Botão que chega depois (gate de plano, papel) muda a contagem.
    const mutations = new MutationObserver(update);
    mutations.observe(actions, { childList: true, subtree: true });
    return () => {
      media.removeEventListener("change", update);
      mutations.disconnect();
    };
  }, [actionsRef]);

  return stack;
}
