"use client";

import { useEffect, useRef, useState } from "react";

import { useModalPortal } from "@/components/Modal";

/**
 * Núcleo comum dos inputs com painel flutuante em portal (InputSelect,
 * InputDate). Reúne o que é idêntico nos dois:
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
 */
export function useAnchoredDropdown() {
  const containerRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const anchor = useModalPortal();

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (containerRef.current?.contains(target)) return;
      if (floatingRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return {
    containerRef,
    floatingRef,
    open,
    setOpen,
    anchor,
    position: (anchor ? "absolute" : "fixed") as "absolute" | "fixed",
  };
}
