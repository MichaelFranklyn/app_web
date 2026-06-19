"use client";

import { Button } from "@/components/Button";
import { ButtonProps } from "@/components/Button/Root/interface";
import { Tooltip } from "@/components/Tooltip";
import { cn } from "@/lib/utils";
import { ElementType } from "react";
import { headerActionLabelStyle } from "../style";

export interface CardHeaderActionProps extends Omit<ButtonProps, "children"> {
  /** Ícone exibido sempre (lucide-react ou similar). */
  icon: ElementType;
  /** Texto da ação: vira tooltip quando o header está estreito. */
  label: string;
}

/**
 * Botão de ação do cabeçalho de um Card/Table.
 *
 * Quando o header (`Table.CardHead` / `Card.Header`) tem largura suficiente,
 * mostra ícone + texto. Quando fica estreito, colapsa para icon-only e expõe o
 * texto via tooltip — tudo por container query, sem JS de medição.
 *
 * O tooltip fica sempre disponível no hover; quando há espaço, apenas duplica
 * o rótulo já visível (inofensivo) e garante descoberta no estado colapsado.
 */
export function CardHeaderAction({
  icon,
  label,
  className,
  ...props
}: CardHeaderActionProps) {
  return (
    <Tooltip content={label}>
      <Button.Root className={cn("shrink-0", className)} {...props}>
        <Button.Icon icon={icon} />
        <Button.Title className={headerActionLabelStyle}>{label}</Button.Title>
      </Button.Root>
    </Tooltip>
  );
}

CardHeaderAction.displayName = "Card.Header.Action";
