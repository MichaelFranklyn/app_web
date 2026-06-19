import { cn } from "@/lib/utils";
import React from "react";
import { sidebarBrandStyles } from "./style";

type SidebarBrandProps = React.HTMLAttributes<HTMLDivElement>;

export const Brand = React.forwardRef<HTMLDivElement, SidebarBrandProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(sidebarBrandStyles.brand, className)}
      {...props}
    >
      {children}
    </div>
  )
);

Brand.displayName = "Sidebar.Brand";
