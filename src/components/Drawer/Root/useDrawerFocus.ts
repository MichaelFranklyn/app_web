"use client";

import React from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Teclado do painel lateral: o que um diálogo modal precisa e o painel, feito à
 * mão, não tinha.
 *
 * - Ao abrir, o foco entra no painel; ao fechar, volta para quem o abriu.
 * - O Tab circula dentro do painel aberto, sem escapar para a tela por baixo.
 * - Esc fecha.
 *
 * O Tab e o Esc só valem quando a tecla nasce DENTRO do painel no DOM: um modal
 * aberto a partir dele ("Editar visita") vai para um portal fora do `aside`,
 * mas o evento sintético do React ainda sobe pela árvore até aqui. Sem a
 * checagem, o Esc do modal fecharia o painel junto.
 */
export function useDrawerFocus(open: boolean, onClose: () => void) {
  const panelRef = React.useRef<HTMLElement>(null);
  const returnTo = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    panel.focus({ preventScroll: true });
    return () => {
      const target = returnTo.current;
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, [open]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const panel = panelRef.current;
    if (!panel || event.defaultPrevented) return;
    if (!panel.contains(event.target as Node)) return;

    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (element) => !element.closest("[inert], [hidden], [aria-hidden='true']")
    );
    if (items.length === 0) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return { panelRef, onKeyDown };
}
