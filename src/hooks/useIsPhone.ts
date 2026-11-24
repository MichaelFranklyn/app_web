"use client";

import { useSyncExternalStore } from "react";

/** Abaixo do `tablet` (760px, ver --breakpoint-tablet no globals.css). */
export const PHONE_QUERY = "(max-width: 759.98px)";

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(PHONE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

/**
 * A tela é de celular? No servidor (e até hidratar) responde `false`: quem usa
 * para esconder coisa no celular deve esconder também por CSS
 * (`max-tablet:hidden`), senão o desktop pisca antes da troca.
 */
export function useIsPhone() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false
  );
}
