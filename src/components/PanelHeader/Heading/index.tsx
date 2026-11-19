import { IconTile } from "@/components/IconTile";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

import { Title } from "../Title";

interface HeadingProps {
  /** O ícone do item da navegação que leva a esta tela. */
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

/**
 * O título da página com o ícone do módulo à esquerda (14/11/2026).
 *
 * O ícone repete o da navegação, então quem chega na tela reconhece onde
 * clicou; a cor é sempre a da marca (18/11/2026), não a do módulo. É decorativo
 * (`aria-hidden`) — o nome está no `<h1>`.
 */
export function Heading({
  icon: Icon,
  children,
  className,
  titleClassName,
}: HeadingProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-10", className)}>
      <IconTile aria-hidden shape="square" size="sm" color="amber">
        <Icon />
      </IconTile>
      <Title className={cn("min-w-0", titleClassName)}>{children}</Title>
    </div>
  );
}
