import { cn } from "@/lib/utils";
import React from "react";
import { PaginationItemProps } from "./interface";
import { itemVariants } from "./style";

export const Item = React.forwardRef<HTMLButtonElement, PaginationItemProps>(
  ({ className, active, ...props }, ref) => (
    <button
      ref={ref}
      aria-current={active ? "page" : undefined}
      className={cn(itemVariants({ active }), className)}
      {...props}
    />
  )
);

Item.displayName = "Pagination.Item";
