import { cn } from "@/lib/utils";
import * as React from "react";
import { HTMLAttributes, ReactNode } from "react";

interface BadgeTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export const BadgeText = React.forwardRef<HTMLSpanElement, BadgeTextProps>(
  ({ children, className, ...props }, ref) => (
    <span ref={ref} className={cn("truncate", className)} {...props}>
      {children}
    </span>
  )
);
BadgeText.displayName = "Badge.Text";
