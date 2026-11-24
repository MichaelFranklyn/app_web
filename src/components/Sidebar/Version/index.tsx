import { cn } from "@/lib/utils";
import React from "react";

type SidebarVersionProps = React.HTMLAttributes<HTMLDivElement>;

export const Version = React.forwardRef<HTMLDivElement, SidebarVersionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "text-body-sm mx-20 border-b border-(--border) py-8 text-(--color-text-muted)",
        className
      )}
      {...props}
    />
  )
);

Version.displayName = "Sidebar.Version";
