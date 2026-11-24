"use client";

import React from "react";
import { useScrollEdges } from "@/hooks/useScrollEdges";

/**
 * No modo cartão (celular/tablet) a `<tr>` do cabeçalho vira a faixa
 * "Ordenar por:", que rola de lado. Marcar as bordas deixa o `edge-fade` do
 * `cards.ts` esmaecer o lado com chip escondido — antes a faixa cortava
 * "Pessoas" seco, sem pista de que havia mais (auditoria do /platform,
 * 24/11/2026). No desktop a tabela não rola por aqui e nada muda.
 */
const pickRow = (thead: HTMLTableSectionElement) =>
  thead.querySelector<HTMLElement>(":scope > tr");

export const Header = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const edgesRef = useScrollEdges(ref, pickRow);
  return <thead ref={edgesRef} className={className} {...props} />;
});

Header.displayName = "Table.Header";
