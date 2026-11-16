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
        "px-[20px] pt-[16px] pb-[6px] text-[12px] font-(--weight-semibold) text-(--color-text-muted)",
        collapsed && "desktop:hidden",
        className
      )}
      {...props}
    />
  )
);

Section.displayName = "Sidebar.Section";
