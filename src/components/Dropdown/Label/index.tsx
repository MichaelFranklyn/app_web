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
    <DropdownMenuPrimitive.Label className="section-label px-[14px] pt-10 pb-4">
      {children}
    </DropdownMenuPrimitive.Label>
  );
}
