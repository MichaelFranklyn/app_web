"use client";

import { Button } from "@/components/Button";
import { ButtonSize } from "@/components/Button/Root/interface";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import { ReactNode } from "react";
import { Tooltip } from "../Tooltip";

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
 * Padroniza o gatilho (botão acessível com `HelpCircle`) e já corrige a caixa
 * do tooltip para conteúdo multilinha (`whitespace-normal` + `max-w`), que por
 * padrão é `whitespace-nowrap`. Reaproveita o componente `Tooltip`.
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
  return (
    <Tooltip
      position={position}
      className={cn("max-w-100 whitespace-normal", className)}
      content={
        <div
          className={cn(
            "space-y-2 text-left leading-relaxed normal-case",
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
        noUppercase
        aria-label={label}
        className={cn("text-(--muted) hover:text-(--text)", iconClassName)}
      >
        <Button.Icon icon={HelpCircle} />
      </Button.Root>
    </Tooltip>
  );
}

HelpTooltip.displayName = "HelpTooltip";

export { labelWithHelp } from "./LabelWithHelp";
