import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React from "react";
import { itemVariants } from "../Item/style";
import { ICON_SIZE } from "@/components/Icon";

export const First = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    type="button"
    ref={ref}
    aria-label="Primeira página"
    className={cn(itemVariants({}), className)}
    {...props}
  >
    {children || <ChevronsLeft size={ICON_SIZE.md} />}
  </button>
));

export const Prev = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    type="button"
    ref={ref}
    aria-label="Página anterior"
    className={cn(itemVariants({}), className)}
    {...props}
  >
    {children || <ChevronLeft size={ICON_SIZE.md} />}
  </button>
));

export const Next = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    type="button"
    ref={ref}
    aria-label="Próxima página"
    className={cn(itemVariants({}), className)}
    {...props}
  >
    {children || <ChevronRight size={ICON_SIZE.md} />}
  </button>
));

export const Last = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    type="button"
    ref={ref}
    aria-label="Última página"
    className={cn(itemVariants({}), className)}
    {...props}
  >
    {children || <ChevronsRight size={ICON_SIZE.md} />}
  </button>
));

First.displayName = "Pagination.First";
Prev.displayName = "Pagination.Prev";
Next.displayName = "Pagination.Next";
Last.displayName = "Pagination.Last";
