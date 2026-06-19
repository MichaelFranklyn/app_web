import { cn } from "@/lib/utils";
import React from "react";

export const Description = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-[2px] w-full text-[13px] leading-relaxed text-(--muted)",
      className
    )}
    {...props}
  />
));

Description.displayName = "PanelHeader.Description";
