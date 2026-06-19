import { cn } from "@/lib/utils";
import React from "react";
import { sidebarRootStyles } from "./style";

type SidebarRootProps = React.HTMLAttributes<HTMLElement>;

export const Root = React.forwardRef<HTMLElement, SidebarRootProps>(
  ({ className, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(sidebarRootStyles.root, className)}
      {...props}
    />
  )
);

Root.displayName = "Sidebar.Root";
