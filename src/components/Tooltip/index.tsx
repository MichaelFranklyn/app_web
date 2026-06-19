"use client";

import { cn } from "@/lib/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { TooltipProps } from "./Content/interface";
import { tooltipContentStyles } from "./Content/style";

export const TooltipProvider = TooltipPrimitive.Provider;

export const Tooltip = ({
  content,
  children,
  delay = 200,
  position = "top",
  className,
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
            className={cn(tooltipContentStyles.content, className)}
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
