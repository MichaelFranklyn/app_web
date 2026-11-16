"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NAVIGATION_START_EVENT } from "./navigationSignal";

/**
 * Teto de espera: se a rota nunca trocar (servidor caiu, navegação cancelada
 * pela guarda de saída), a barra desiste sozinha em vez de rodar para sempre.
 */
const GIVE_UP_AFTER_MS = 45_000;

/** Destino interno e diferente da página atual; senão, null (não há o que esperar). */
const pendingTarget = (href: string): string | null => {
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  )
    return null;
  return `${url.pathname}${url.search}`;
};

/** Clique comum num link interno da mesma aba. Ctrl/meio/nova aba/download não contam. */
const internalTarget = (event: MouseEvent): string | null => {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return null;

  const anchor = (event.target as Element | null)?.closest?.(
    "a[href]"
  ) as HTMLAnchorElement | null;
  if (
    !anchor ||
    (anchor.target && anchor.target !== "_self") ||
    anchor.hasAttribute("download")
  )
    return null;

  return pendingTarget(anchor.href);
};

/**
 * True entre o pedido de navegação (clique num link interno ou
 * `announceNavigation`) e a troca efetiva da rota (pathname ou query).
 * Adaptado do drivops-next (AppShell/useNavigationPending).
 */
export function useNavigationPending(): boolean {
  const location = `${usePathname()}?${useSearchParams()}`;
  const [target, setTarget] = useState<string | null>(null);

  // A rota trocou: o carregamento acabou. Ajuste no render (sem efeito) para
  // a barra sumir no mesmo quadro em que a tela nova aparece.
  const [previousLocation, setPreviousLocation] = useState(location);
  if (previousLocation !== location) {
    setPreviousLocation(location);
    setTarget(null);
  }

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const next = internalTarget(event);
      if (next) setTarget(next);
    };
    const onAnnounce = (event: Event) => {
      const next = pendingTarget((event as CustomEvent<string>).detail);
      if (next) setTarget(next);
    };

    // Captura: o Link do Next chama preventDefault na fase de bolha.
    document.addEventListener("click", onClick, true);
    window.addEventListener(NAVIGATION_START_EVENT, onAnnounce);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(NAVIGATION_START_EVENT, onAnnounce);
    };
  }, []);

  useEffect(() => {
    if (!target) return;
    const giveUp = setTimeout(() => setTarget(null), GIVE_UP_AFTER_MS);
    return () => clearTimeout(giveUp);
  }, [target]);

  return target !== null;
}
