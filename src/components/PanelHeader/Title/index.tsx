import { cn } from "@/lib/utils";
import React from "react";

export const Title = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "font-head text-[23px] font-bold tracking-tight text-(--amber)",
      className
    )}
    {...props}
  />
));

Title.displayName = "PanelHeader.Title";
