import { cn } from "@/lib/utils";
import React from "react";

type SidebarSectionProps = React.HTMLAttributes<HTMLDivElement>;

export const Section = React.forwardRef<HTMLDivElement, SidebarSectionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-[20px] pt-[16px] pb-[6px] text-[10px] tracking-[0.12em] text-(--muted2) uppercase",
        className
      )}
      {...props}
    />
  )
);

Section.displayName = "Sidebar.Section";
