import { IconTile } from "@/components/IconTile";
import { ThemeColor } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

import { Title } from "../Title";

interface HeadingProps {
  /** O ícone do item da navegação que leva a esta tela. */
  icon: LucideIcon;
  /** A cor do MÓDULO (`MODULE_COLOR`), nunca âmbar — âmbar é do que se clica. */
  color: ThemeColor;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

/**
 * O título da página com o ícone do módulo à esquerda (14/11/2026).
 *
 * Mesmo desenho do header dos catálogos: o ícone repete o da navegação e a cor
 * diz o módulo, então quem chega na tela reconhece onde clicou. É decorativo
 * (`aria-hidden`) — o nome está no `<h1>`.
 */
export function Heading({
  icon: Icon,
  color,
  children,
  className,
  titleClassName,
}: HeadingProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-10", className)}>
      <IconTile aria-hidden shape="square" size="sm" color={color}>
        <Icon />
      </IconTile>
      <Title className={cn("min-w-0", titleClassName)}>{children}</Title>
    </div>
  );
}
