"use client";

import { Button } from "@/components/Button";
import { ButtonSize } from "@/components/Button";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import { ReactNode } from "react";
import { Tooltip } from "../Tooltip";
import { useTapToggle } from "./useTapToggle";

export interface HelpTooltipProps {
  /** Conteúdo explicativo. Pode ser texto simples ou JSX (parágrafos, listas). */
  content: ReactNode;
  /** Texto do aria-label do gatilho (acessibilidade). */
  label?: string;
  position?: "top" | "bottom" | "left" | "right";
  /** Tamanho do botão/ícone gatilho. */
  size?: ButtonSize;
  /** Classes extras na caixa do tooltip. */
  className?: string;
  /** Classes extras no wrapper de conteúdo (tipografia). */
  contentClassName?: string;
  /** Classes extras no botão/ícone gatilho. */
  iconClassName?: string;
}

/**
 * Ícone de interrogação com tooltip de ajuda.
 *
 * QUANDO USAR: explicar uma REGRA (o que o campo/filtro/KPI considera e o que
 * não considera). Abre no toque, então serve no celular. Rótulo curto de
 * ícone → `Tooltip`. Regras: PATTERNS/ds-usage-rules.md.
 *
 * Padroniza o gatilho (botão acessível com `HelpCircle`) e já corrige a caixa
 * do tooltip para conteúdo multilinha (`whitespace-normal` + `max-w`), que por
 * padrão é `whitespace-nowrap`. Reaproveita o componente `Tooltip`, controlado
 * para abrir também no toque (ver `useTapToggle`).
 *
 * @example
 * <HelpTooltip
 *   label="Como funciona?"
 *   content={<p>Texto explicativo com <b>exemplos</b>.</p>}
 * />
 */
export function HelpTooltip({
  content,
  label = "Mais informações",
  position = "top",
  size = "sm",
  className,
  contentClassName,
  iconClassName,
}: HelpTooltipProps) {
  const { open, onOpenChange, triggerProps } = useTapToggle();
  return (
    <Tooltip
      open={open}
      onOpenChange={onOpenChange}
      position={position}
      className={cn(
        "max-w-[min(400px,calc(100vw-20px))] whitespace-normal",
        className
      )}
      content={
        <div
          className={cn(
            "space-y-2 text-left leading-relaxed normal-case",
            // Teto de ALTURA pelo espaço que sobra na tela (variável do Radix,
            // herdada do wrapper): ajuda longa (/priorities, 767px) passava da
            // borda de baixo. Rola por dentro — o scroll fica neste div e não
            // na caixa, senão o overflow cortaria a seta (14/11/2026).
            // 12px = py da caixa (5+5) + borda.
            "max-h-[calc(var(--radix-tooltip-content-available-height,100vh)-12px)] overflow-y-auto",
            contentClassName
          )}
        >
          {content}
        </div>
      }
    >
      <Button.Root
        type="button"
        appearance="ghost"
        color="neutral"
        size={size}
        isIconOnly
        aria-label={label}
        {...triggerProps}
        // shrink-0: numa linha apertada o flex espremia o "?" para 20px de
        // largura, abaixo do alvo mínimo de 24px (WCAG 2.5.8).
        className={cn(
          "shrink-0 text-(--color-text-muted) hover:text-(--color-text)",
          iconClassName
        )}
      >
        <Button.Icon icon={HelpCircle} />
      </Button.Root>
    </Tooltip>
  );
}

HelpTooltip.displayName = "HelpTooltip";

export { labelWithHelp } from "./LabelWithHelp";
