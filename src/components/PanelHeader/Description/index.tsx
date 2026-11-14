import { cn } from "@/lib/utils";
import React from "react";

export const Description = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-body-sm mt-[2px] w-full leading-relaxed text-(--color-text-muted)",
      className
    )}
    {...props}
  />
));

Description.displayName = "PanelHeader.Description";
