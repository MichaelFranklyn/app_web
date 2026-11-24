import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Os degraus de TAMANHO do @theme (globals.css: `text-body-sm`, `text-body`…).
 * Sem avisar o tailwind-merge, ele os lê como COR de texto e descarta um deles
 * quando a mesma lista traz `text-(--color-text-muted)` — o texto voltaria ao
 * tamanho herdado. Degrau novo no @theme entra aqui também.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "micro",
        "body-sm",
        "body",
        "body-md",
        "body-lg",
        "lead",
        "heading-sm",
        "heading-md",
        "heading-lg",
        "kpi",
        "heading-xl",
        "display",
        "hero-sm",
        "hero-md",
        "hero",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
