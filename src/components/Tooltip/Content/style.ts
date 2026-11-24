import { cn } from "@/lib/utils";

export const tooltipContentStyles = {
  content: cn(
    // Acima de qualquer camada que possa abrigar o gatilho: o Drawer e o
    // AppFrame ficam acima do 50 de antes, que deixava o "?" de "O que oferecer"
    // abrir ATRÁS do painel da visita (relato de 20/11/2026). Acima dos popovers, abaixo do
    // tour e do Toast (escala --z-* no globals.css).
    "z-(--z-tooltip) origin-(--radix-tooltip-content-transform-origin) animate-pop-in data-[state=closed]:animate-pop-out",
    "bg-(--bg4) border border-(--border2) rounded-(--r-md) px-10 py-5",
    "text-body-sm text-(--color-text) whitespace-nowrap shadow-(--shadow-sm)",
    // Teto pela TELA: o wrapper do Radix é `min-width: max-content`, então sem
    // isto a caixa crescia até o texto caber e passava da borda no celular
    // (teste em aparelho, 13/11/2026). 20px = collisionPadding (10) dos 2 lados.
    "max-w-[calc(100vw-20px)]"
  ),
  arrow: "fill-(--border2)",
};
