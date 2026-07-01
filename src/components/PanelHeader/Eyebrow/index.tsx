import { cn } from "@/lib/utils";
import React from "react";

export const Eyebrow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mb-[2px] text-[13px] font-medium tracking-[0.12em] text-(--muted) uppercase",
      className
    )}
    {...props}
  />
));

Eyebrow.displayName = "PanelHeader.Eyebrow";
