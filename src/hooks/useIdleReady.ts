"use client";

import { useEffect, useState } from "react";

/**
 * Fica `true` quando o navegador termina o trabalho da carga inicial.
 *
 * Serve para segurar buscas ACESSÓRIAS — as que preenchem um seletor que o
 * usuário talvez nem abra — até que a tela já esteja desenhada. Disparadas no
 * mount, elas competem por conexão e pela thread principal exatamente na janela
 * que o LCP mede, atrasando o conteúdo que a pessoa veio ver para adiantar algo
 * que ela pode nunca usar.
 *
 * Use com `skip`, nunca para dados primários da página:
 *
 *     const ready = useIdleReady();
 *     useQuery(SELLERS_QUERY, { skip: !ready });
 *
 * `requestIdleCallback` não existe no Safari antigo nem no jsdom — daí o
 * `setTimeout` de reserva, que cobre o mesmo objetivo (sair do caminho crítico)
 * sem depender da API.
 */
export function useIdleReady(timeout = 1500): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const idle = window.requestIdleCallback;
    if (typeof idle === "function") {
      const handle = idle(() => setReady(true), { timeout });
      return () => window.cancelIdleCallback?.(handle);
    }

    const timer = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(timer);
  }, [timeout]);

  return ready;
}
