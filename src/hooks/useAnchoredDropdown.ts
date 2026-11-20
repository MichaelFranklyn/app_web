"use client";

import { useEffect, useRef, useState } from "react";

import { useModalPortal } from "@/components/Modal";

/**
 * Núcleo comum dos controles com painel flutuante em portal (InputSelect,
 * InputDate, Filters). Reúne o que é idêntico em todos:
 *
 * - `containerRef` (o campo âncora) e `floatingRef` (o painel no portal);
 * - `open`/`setOpen` com fechamento por clique-fora (ignora cliques no campo
 *   e no painel);
 * - `anchor`: a âncora do Modal (`useModalPortal`), de onde vêm tanto o alvo
 *   do portal quanto o modo de posição — `absolute` dentro de um Modal (cujo
 *   Dialog.Content tem `transform`, quebrando `fixed`) e `fixed` fora dele.
 *
 * O CÁLCULO das coordenadas NÃO mora aqui: cada componente mantém sua
 * estratégia (InputSelect acompanha scroll/resize e casa a largura; InputDate
 * calcula uma vez, com flip vertical e overflow horizontal).
 *
 * `keepOpenSelectors` existe para painéis que CONTÊM outros controles
 * flutuantes: o dropdown de um select filho é renderizado em outro portal, ou
 * seja, fora do `floatingRef` — sem isso, escolher uma opção conta como clique
 * fora e fecha o painel de baixo junto (foi o que acontecia no painel de
 * filtros ao escolher um vendedor).
 */
export function useAnchoredDropdown(keepOpenSelectors: string[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const anchor = useModalPortal();

  const selectorsKey = keepOpenSelectors.join(",");

  useEffect(() => {
    if (!open) return;
    const selectors = selectorsKey ? selectorsKey.split(",") : [];
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (containerRef.current?.contains(target)) return;
      if (floatingRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        selectors.some((selector) => target.closest(selector))
      ) {
        return;
      }
      setOpen(false);
    };
    // Rolar a tela com o dedo também fecha: o painel fica parado enquanto o
    // campo some de baixo dele (relato de 19/11/2026, /commissions no
    // celular). É o GESTO (touchmove), não o evento de scroll: o teclado
    // virtual e o scroll programático também disparam `scroll`, e fechariam
    // o select no instante em que ele abre. Arrastar dentro do próprio
    // painel (lista longa de opções) não conta.
    const handleTouchMove = (event: TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (floatingRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        selectors.some((selector) => target.closest(selector))
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [open, selectorsKey]);

  return {
    containerRef,
    floatingRef,
    open,
    setOpen,
    anchor,
    position: (anchor ? "absolute" : "fixed") as "absolute" | "fixed",
  };
}
