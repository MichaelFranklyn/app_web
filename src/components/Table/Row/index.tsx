"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";
import { tableRowInteractiveStyle, tableRowStyle } from "./style";

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  href?: string;
}

export const Row = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, href, onClick, ...props }, ref) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
      if (href) {
        const target = e.target as HTMLElement;
        const isInteractive = target.closest(
          'button, a, input, select, textarea, [role="menuitem"], [role="button"], [role="checkbox"], [role="radio"]'
        );
        if (!isInteractive) router.push(href);
      }
      onClick?.(e);
    };

    const isInteractive = !!onClick || !!href;

    return (
      <tr
        ref={ref}
        className={cn(
          tableRowStyle,
          isInteractive && tableRowInteractiveStyle,
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

Row.displayName = "Table.Row";
