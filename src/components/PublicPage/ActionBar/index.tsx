import { cn } from "@/lib/utils";
import React from "react";

/**
 * Faixa presa ao pé da tela com a ação do formulário.
 *
 * Os formulários abertos por link são listas longas (40 produtos, 8 paradas):
 * com o botão só no fim, quem preencheu dois itens teria de rolar tudo para
 * enviar. As margens negativas anulam o respiro do `PublicPage.Main`, para a
 * faixa ir de borda a borda.
 */
export const ActionBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "sticky bottom-0 -mx-[16px] border-t border-(--border) bg-(--bg) px-[16px] py-[12px]",
      className
    )}
    {...props}
  />
));

ActionBar.displayName = "PublicPage.ActionBar";
