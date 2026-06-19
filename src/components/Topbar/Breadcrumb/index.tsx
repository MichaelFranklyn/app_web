import { cn } from "@/lib/utils";
import React from "react";
import { TopbarBreadcrumbProps } from "./interface";
import { topbarBreadcrumbStyles } from "./style";

export const TopbarBreadcrumb = React.forwardRef<
  HTMLDivElement,
  TopbarBreadcrumbProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(topbarBreadcrumbStyles.root, className)}
    {...props}
  />
));

TopbarBreadcrumb.displayName = "Topbar.Breadcrumb";
