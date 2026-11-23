"use client";

import React, { useCallback } from "react";

/**
 * Marca na faixa de abas se há conteúdo escondido à esquerda
 * (`data-fade-start`) e à direita (`data-fade-end`). O CSS da lista lê esses
 * atributos e esmaece a borda: sem isso, onze abas em 360px eram uma régua
 * cortada no meio de uma palavra ("Execuç"), sem pista de que rolava
 * (crítica dos Relatórios, 20/11/2026).
 *
 * Escreve direto no DOM, sem estado: rolar a faixa não re-renderiza as abas.
 */
export function useScrollEdges<T extends HTMLElement>(
  forwardedRef: React.ForwardedRef<T>
) {
  return useCallback(
    (el: T | null) => {
      if (typeof forwardedRef === "function") forwardedRef(el);
      else if (forwardedRef) forwardedRef.current = el;
      if (!el) return;

      const update = () => {
        const max = el.scrollWidth - el.clientWidth;
        el.toggleAttribute("data-fade-start", el.scrollLeft > 1);
        el.toggleAttribute("data-fade-end", max - el.scrollLeft > 1);
      };

      update();

      el.addEventListener("scroll", update, { passive: true });
      const observer = new ResizeObserver(update);
      observer.observe(el);
      return () => {
        el.removeEventListener("scroll", update);
        observer.disconnect();
        if (typeof forwardedRef === "function") forwardedRef(null);
        else if (forwardedRef) forwardedRef.current = null;
      };
    },
    [forwardedRef]
  );
}
