"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { DrawerContext } from "../context";
import { useDrawerFocus } from "./useDrawerFocus";

interface DrawerRootProps {
  open: boolean;
  onClose: () => void;
  /** Nome do painel para leitor de tela (o `aside` é um `dialog`). */
  label: string;
  /**
   * Desmonta fechado. Use quando o conteúdo é caro (uma lista inteira); sem
   * isso o painel fica montado fora da tela, que é o que dá a animação de
   * saída — e o que uma tela com um painel POR ITEM precisa.
   */
  unmountOnClose?: boolean;
  width?: 400 | 420;
  children: React.ReactNode;
}

const WIDTH = { 400: "w-[400px]", 420: "w-[420px]" } as const;

/**
 * Painel lateral sobre a tela, com fundo escurecido que fecha ao clicar.
 *
 * Fica acima do conteúdo e abaixo dos modais (z-50): um modal aberto a partir
 * do painel ("Editar visita") aparece por cima dele.
 *
 * A sombra só existe aberto. Fechado, o painel segue montado fora da tela, e a
 * sombra não é cortada pela borda da janela: vazava para dentro e desenhava
 * uma faixa escura colada na lateral — somada, numa tela com um painel por
 * parada, nove vezes no mesmo lugar.
 */
export function Root({
  open,
  onClose,
  label,
  unmountOnClose = false,
  width = 420,
  children,
}: DrawerRootProps) {
  const { panelRef, onKeyDown } = useDrawerFocus(open, onClose);

  if (unmountOnClose && !open) return null;

  return (
    <DrawerContext.Provider value={{ onClose }}>
      <div
        className={cn(
          "fixed inset-0 z-[55] bg-black/30 transition-opacity duration-200",
          // Montado já aberto não há transição (nada muda de estado): a
          // entrada vem do keyframe. O `animate-in` antigo não gerava CSS.
          unmountOnClose && "animate-fade-in",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        data-drawer-backdrop
        aria-hidden
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal={open || undefined}
        aria-label={label}
        tabIndex={-1}
        // Fechado, o painel segue montado fora da tela (é o que dá a animação de
        // saída): `inert` o tira do Tab e do leitor de tela. Sem isso, nove
        // painéis de parada somavam ~63 paradas de Tab invisíveis na agenda.
        inert={!open}
        onKeyDown={onKeyDown}
        className={cn(
          "fixed top-0 right-0 z-[60] flex h-full max-w-[calc(100vw-32px)] flex-col border-l border-(--border) bg-(--bg)",
          "transition-[translate,box-shadow] duration-260 ease-(--ease-out-soft)",
          WIDTH[width],
          unmountOnClose && "animate-drawer-in",
          open ? "translate-x-0 shadow-(--shadow-lg)" : "translate-x-full"
        )}
      >
        {children}
      </aside>
    </DrawerContext.Provider>
  );
}
