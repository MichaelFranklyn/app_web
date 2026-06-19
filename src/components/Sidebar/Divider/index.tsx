import { cn } from "@/lib/utils";
import React from "react";

type SidebarDividerProps = React.HTMLAttributes<HTMLDivElement>;

export const Divider = React.forwardRef<HTMLDivElement, SidebarDividerProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mx-[18px] my-[6px] h-px bg-(--border)", className)}
      {...props}
    />
  )
);

Divider.displayName = "Sidebar.Divider";
