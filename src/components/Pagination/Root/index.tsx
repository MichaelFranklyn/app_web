import { cn } from "@/lib/utils";
import React from "react";

type PaginationRootProps = React.HTMLAttributes<HTMLDivElement>;

export const Root = React.forwardRef<HTMLDivElement, PaginationRootProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="pagination"
      className={cn("flex items-center gap-[4px]", className)}
      {...props}
    />
  )
);

Root.displayName = "Pagination.Root";
