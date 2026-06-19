import { cn } from "@/lib/utils";
import * as React from "react";
import { HTMLAttributes, ReactNode } from "react";

interface BadgeIconProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export const BadgeIcon = React.forwardRef<HTMLSpanElement, BadgeIconProps>(
  ({ children, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("inline-flex shrink-0 [&>svg]:h-3 [&>svg]:w-3", className)}
      aria-hidden="true"
      {...props}
    >
      {children}
    </span>
  )
);
BadgeIcon.displayName = "Badge.Icon";
