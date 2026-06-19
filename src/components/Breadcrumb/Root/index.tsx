import { cn } from "@/lib/utils";
import React from "react";

type BreadcrumbRootProps = React.HTMLAttributes<HTMLDivElement>;

export const BreadcrumbRoot = React.forwardRef<
  HTMLDivElement,
  BreadcrumbRootProps
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="breadcrumb"
    className={cn(
      "flex items-center gap-[6px] text-[12px] text-(--muted)",
      className
    )}
    {...props}
  />
));

BreadcrumbRoot.displayName = "Breadcrumb.Root";
