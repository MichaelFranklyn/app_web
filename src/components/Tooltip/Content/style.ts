import { cn } from "@/lib/utils";

export const tooltipContentStyles = {
  content: cn(
    "z-50 origin-(--radix-tooltip-content-transform-origin) animate-pop-in data-[state=closed]:animate-pop-out",
    "bg-(--bg4) border border-(--border2) rounded-(--r-md) px-[10px] py-[5px]",
    "text-body-sm text-(--color-text) whitespace-nowrap shadow-(--shadow-sm)",
    // Teto pela TELA: o wrapper do Radix é `min-width: max-content`, então sem
    // isto a caixa crescia até o texto caber e passava da borda no celular
    // (teste em aparelho, 13/11/2026). 20px = collisionPadding (10) dos 2 lados.
    "max-w-[calc(100vw-20px)]"
  ),
  arrow: "fill-(--border2)",
};
