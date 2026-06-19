import { cn } from "@/lib/utils";
import React from "react";
import { itemVariants } from "../Item/style";

export const First = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    aria-label="Primeira página"
    className={cn(itemVariants({}), "text-[13px]", className)}
    {...props}
  >
    {children || "‹‹"}
  </button>
));

export const Prev = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    aria-label="Página anterior"
    className={cn(itemVariants({}), "text-[15px]", className)}
    {...props}
  >
    {children || "‹"}
  </button>
));

export const Next = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    aria-label="Próxima página"
    className={cn(itemVariants({}), "text-[15px]", className)}
    {...props}
  >
    {children || "›"}
  </button>
));

export const Last = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    aria-label="Última página"
    className={cn(itemVariants({}), "text-[13px]", className)}
    {...props}
  >
    {children || "››"}
  </button>
));

First.displayName = "Pagination.First";
Prev.displayName = "Pagination.Prev";
Next.displayName = "Pagination.Next";
Last.displayName = "Pagination.Last";
