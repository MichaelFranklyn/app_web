import { cn } from "@/lib/utils";
import React from "react";

interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Recolhido: o título de grupo sai do desktop (os divisores separam). */
  collapsed?: boolean;
}

export const Section = React.forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ className, collapsed, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "section-label px-20 pt-16 pb-6",
        collapsed && "desktop:hidden",
        className
      )}
      {...props}
    />
  )
);

Section.displayName = "Sidebar.Section";
