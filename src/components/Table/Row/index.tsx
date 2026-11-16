"use client";

import { cn } from "@/lib/utils";
import { announceNavigation } from "@/components/AppFrame/navigationSignal";
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
        // Eventos de portal (modal, menu do "⋯") sobem pela árvore React até
        // aqui sem estarem dentro da <tr>: clique neles não é clique na linha.
        const isOutsideRow = !e.currentTarget.contains(target);
        const isInteractive =
          isOutsideRow ||
          target.closest(
            'button, a, input, select, textarea, [role="menuitem"], [role="button"], [role="checkbox"], [role="radio"]'
          );
        if (!isInteractive) {
          announceNavigation(href);
          router.push(href);
        }
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
