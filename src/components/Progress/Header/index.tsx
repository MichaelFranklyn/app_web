import React from "react";
import { cn } from "@/lib/utils";

export const Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between", className)}
    {...props}
  />
));

export const Label = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-[12px] text-(--muted)", className)}
    {...props}
  />
));

Header.displayName = "Progress.Header";
Label.displayName = "Progress.Label";
