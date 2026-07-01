import { cn } from "@/lib/utils";
import React from "react";
import { sidebarBrandStyles } from "./style";

interface SidebarBrandProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Recolhido: encolhe o respiro para caber só o ícone no desktop. */
  collapsed?: boolean;
}

export const Brand = React.forwardRef<HTMLDivElement, SidebarBrandProps>(
  ({ className, collapsed, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        sidebarBrandStyles.brand,
        collapsed && "desktop:px-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

Brand.displayName = "Sidebar.Brand";
