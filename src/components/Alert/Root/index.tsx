import { cn } from "@/lib/utils";
import React from "react";
import { AlertRootProps } from "./interface";
import { alertRootStyles } from "./style";

export const AlertRoot = React.forwardRef<HTMLDivElement, AlertRootProps>(
  ({ variant = "info", className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        alertRootStyles.root,
        alertRootStyles.variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
AlertRoot.displayName = "AlertRoot";
