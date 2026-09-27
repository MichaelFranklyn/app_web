"use client";

import { Tabs } from "@/components/Tabs";

interface PortalNavProps {
  token: string;
  /** O plano do escritório inclui o pedido de reposição pelo portal. */
  canRequestReplenishment?: boolean;
}

/**
 * Poucas abas, de propósito. A tentação de crescer aqui é grande — cada dado
 * novo pede uma —, mas quem abre esta página está numa loja, no meio do
 * expediente, e tem poucas perguntas: o que eu comprei, o que está acabando e,
 * quando o plano do escritório permite, "pede para mim".
 *
 * "Minhas compras" é `exact`: o endereço dela é prefixo do de estoque, e sem
 * isso as duas abas acenderiam juntas na tela de estoque.
 */
export function PortalNav({
  token,
  canRequestReplenishment = false,
}: PortalNavProps) {
  return (
    <Tabs.NavList>
      <Tabs.NavItem href={`/p/${token}`} exact>
        Minhas compras
      </Tabs.NavItem>
      <Tabs.NavItem href={`/p/${token}/estoque`}>Meu estoque</Tabs.NavItem>
      {canRequestReplenishment ? (
        <Tabs.NavItem href={`/p/${token}/repor`}>Repor</Tabs.NavItem>
      ) : null}
    </Tabs.NavList>
  );
}
