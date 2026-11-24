"use client";

import React, { useCallback } from "react";

/**
 * Marca na faixa que rola de lado se há conteúdo escondido à esquerda
 * (`data-fade-start`) e à direita (`data-fade-end`). A utility `edge-fade`
 * (globals.css) lê esses atributos e esmaece a borda: sem isso, onze abas em
 * 360px eram uma régua cortada no meio de uma palavra ("Execuç"), sem pista de
 * que rolava (crítica dos Relatórios, 20/11/2026).
 *
 * `pick` escolhe, a partir do elemento do ref, quem de fato rola — na tabela
 * em modo cartão é a `<tr>` do `<thead>` (faixa "Ordenar por:"), não o
 * próprio `<thead>`.
 *
 * Escreve direto no DOM, sem estado: rolar a faixa não re-renderiza nada.
 */
export function useScrollEdges<T extends HTMLElement>(
  forwardedRef: React.ForwardedRef<T>,
  pick?: (el: T) => HTMLElement | null
) {
  return useCallback(
    (el: T | null) => {
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
      if (!el) return;

      const target = pick ? pick(el) : el;
      if (!target) return;

      const update = () => {
        const max = target.scrollWidth - target.clientWidth;
        target.toggleAttribute("data-fade-start", target.scrollLeft > 1);
        target.toggleAttribute("data-fade-end", max - target.scrollLeft > 1);
      };

      update();

      target.addEventListener("scroll", update, { passive: true });
      const observer = new ResizeObserver(update);
      observer.observe(target);
      return () => {
        target.removeEventListener("scroll", update);
        observer.disconnect();
        if (typeof forwardedRef === "function") forwardedRef(null);
        else if (forwardedRef) forwardedRef.current = null;
      };
    },
    // `pick` é função estável do módulo de quem chama.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [forwardedRef]
  );
}
