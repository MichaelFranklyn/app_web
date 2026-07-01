import { cn } from "@/lib/utils";
import React from "react";

type SidebarVersionProps = React.HTMLAttributes<HTMLDivElement>;

export const Version = React.forwardRef<HTMLDivElement, SidebarVersionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-[20px] border-b border-(--border) py-[8px] text-[13px] tracking-[0.06em] text-(--muted)",
        className
      )}
      {...props}
    />
  )
);

Version.displayName = "Sidebar.Version";
