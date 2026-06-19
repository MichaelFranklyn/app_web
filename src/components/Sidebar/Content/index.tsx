import { cn } from "@/lib/utils";
import React from "react";

type SidebarContentProps = React.HTMLAttributes<HTMLDivElement>;

export const Content = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "scrollbar-thin scrollbar-thumb-(--border) flex-1 overflow-y-auto",
        className
      )}
      {...props}
    />
  )
);

Content.displayName = "Sidebar.Content";
