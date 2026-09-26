import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export interface TooltipProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Root
> {
  content: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  /** Conteúdo em `TooltipPanel`: sem respiro nem largura máxima na caixa. */
  panel?: boolean;
}
