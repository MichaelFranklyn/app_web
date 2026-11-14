"use client";

import { cn } from "@/lib/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { TooltipProps } from "./Content/interface";
import { tooltipContentStyles } from "./Content/style";

/**
 * QUANDO USAR: rótulo CURTO de algo que já se vê (ícone sem texto, valor
 * truncado, sigla). Abre no hover/foco — no toque NÃO abre, então nada
 * essencial pode morar só aqui. Explicação de regra/campo → `HelpTooltip`.
 * Conteúdo em seções (detalhe de um número) → `panel` + `TooltipPanel`.
 * Regras: PATTERNS/ds-usage-rules.md.
 */
export const Tooltip = ({
  content,
  children,
  delay = 200,
  position = "top",
  className,
  panel = false,
  ...props
}: TooltipProps) => {
  return (
    <TooltipPrimitive.Provider delayDuration={delay}>
      <TooltipPrimitive.Root {...props}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={position}
            sideOffset={6}
            collisionPadding={10}
            className={cn(
              tooltipContentStyles.content,
              panel && "p-0 whitespace-normal",
              className
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className={tooltipContentStyles.arrow} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export * from "./Content/interface";
