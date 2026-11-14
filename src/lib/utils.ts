import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `text-body-sm` é um degrau de TAMANHO definido no @theme (globals.css). Sem
 * avisar o tailwind-merge, ele o lê como COR de texto e o descarta quando a
 * mesma lista traz `text-(--color-text-muted)` — o texto voltaria ao tamanho herdado.
 */
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ["body-sm"] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
