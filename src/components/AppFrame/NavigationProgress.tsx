"use client";

import { cn } from "@/lib/utils";
import { Suspense, useEffect, useState } from "react";
import { useNavigationPending } from "./useNavigationPending";

/**
 * Linha de carregamento no topo do conteúdo enquanto a próxima tela chega
 * (pedido de 13/11/2026, igual ao drivops). Sem ela, o toque num item do menu
 * não dava sinal nenhum até o servidor responder — e o público idoso toca de
 * novo achando que não pegou.
 *
 * Aparece com 150ms de atraso: navegação rápida não pisca a barra.
 * Movimento reduzido: em vez de deslizar, fica uma faixa parada — um elemento
 * à parte, SEM animação. Desligar a animação do mesmo elemento pedia `!`
 * (a regra global de reduced-motion em globals.css deixa a animação com 1
 * iteração de 0,01ms e a faixa terminaria fora da tela, translateX 300%), e a
 * guarda das peças recusa `!`.
 *
 * Leitor de tela: a barra é só visual, e `aria-hidden` alternando não é
 * anunciado. Uma região `aria-live` (sempre montada — a região que nasce já
 * com texto não é lida) recebe "Carregando…" com o MESMO atraso de 150ms, para
 * a navegação rápida também não falar à toa (auditoria 13/11/2026, P-14.7).
 */
const ANNOUNCE_DELAY_MS = 150;

function useDelayedFlag(active: boolean, delay: number) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!active) {
      setShown(false);
      return;
    }
    const timer = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(timer);
  }, [active, delay]);
  return shown;
}

const Bar = () => {
  const active = useNavigationPending();
  const announce = useDelayedFlag(active, ANNOUNCE_DELAY_MS);
  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {announce ? "Carregando…" : ""}
      </div>
      <div
        role="progressbar"
        aria-label="Carregando a página"
        aria-hidden={!active}
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-(--z-progress) h-[3px] overflow-hidden transition-opacity",
          active ? "opacity-100 delay-150 duration-200" : "opacity-0 duration-0"
        )}
      >
        {active && (
          <>
            <div className="animate-navigation-progress h-full w-1/3 rounded-full bg-(--color-action) motion-reduce:hidden" />
            <div className="hidden h-full w-full bg-(--color-action) opacity-70 motion-reduce:block" />
          </>
        )}
      </div>
    </>
  );
};

// useSearchParams fora de Suspense quebra a renderização estática da casca.
export const NavigationProgress = () => (
  <Suspense fallback={null}>
    <Bar />
  </Suspense>
);
