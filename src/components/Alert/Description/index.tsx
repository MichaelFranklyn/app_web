import { cn } from "@/lib/utils";
import React from "react";

export const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "max-w-[90%] text-[12px] leading-relaxed opacity-80",
      className
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";
