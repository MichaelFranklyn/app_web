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
}
