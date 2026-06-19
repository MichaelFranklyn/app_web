import { cn } from "@/lib/utils";
import React from "react";
import { TopbarSeparatorProps } from "./interface";

export const TopbarSeparator = React.forwardRef<
  HTMLDivElement,
  TopbarSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-[20px] w-px shrink-0 bg-(--border)", className)}
    {...props}
  />
));

TopbarSeparator.displayName = "Topbar.Separator";
