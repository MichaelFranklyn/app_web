"use client";

import { Tabs } from "@/components/Tabs";

interface PortalNavProps {
  token: string;
}

/**
 * Duas abas, e só. A tentação de crescer aqui é grande — cada dado novo pede
 * uma —, mas quem abre esta página está numa loja, no meio do expediente, e
 * tem duas perguntas: o que eu comprei, e o que está acabando.
 *
 * "Minhas compras" é `exact`: o endereço dela é prefixo do de estoque, e sem
 * isso as duas abas acenderiam juntas na tela de estoque.
 */
export function PortalNav({ token }: PortalNavProps) {
  return (
    <Tabs.NavList>
      <Tabs.NavItem href={`/p/${token}`} exact>
        Minhas compras
      </Tabs.NavItem>
      <Tabs.NavItem href={`/p/${token}/estoque`}>Meu estoque</Tabs.NavItem>
    </Tabs.NavList>
  );
}
