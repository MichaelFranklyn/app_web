import { cn } from "@/lib/utils";
import React from "react";

/**
 * O card inteiro como botão: um resumo que abre o detalhe ao clicar (os
 * pedidos, o estoque ou o score de uma fábrica na ficha do cliente).
 */
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      "flex w-full cursor-pointer flex-col gap-10 rounded-(--r-md) border border-(--border) bg-(--bg2) p-16 text-left transition-colors hover:bg-(--bg3) focus-visible:outline-2 focus-visible:outline-(--amber)",
      className
    )}
    {...props}
  />
));

Button.displayName = "Card.Button";
