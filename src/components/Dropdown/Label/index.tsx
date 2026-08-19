"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

/**
 * Título de um bloco de ações dentro do menu.
 *
 * Não é clicável: serve para dizer de que assunto são os itens abaixo — sem
 * ele, ações de coisas diferentes viram uma lista corrida que parece um
 * conjunto de alternativas.
 */
export function Label({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenuPrimitive.Label className="px-[14px] pt-[10px] pb-[4px] text-[11px] font-medium tracking-wider text-(--muted) uppercase">
      {children}
    </DropdownMenuPrimitive.Label>
  );
}
