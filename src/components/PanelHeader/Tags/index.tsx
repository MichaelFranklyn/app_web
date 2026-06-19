import { cn } from "@/lib/utils";
import React from "react";

export const Tags = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-16 flex flex-wrap items-center gap-2 border-t border-(--border) pt-[14px]",
      className
    )}
    {...props}
  />
));

Tags.displayName = "PanelHeader.Tags";
