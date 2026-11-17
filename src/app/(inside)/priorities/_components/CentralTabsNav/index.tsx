"use client";

import { Tabs } from "@/components/Tabs";
import { useSearchParams } from "next/navigation";

import { SELLER_PARAM } from "../../utils";

/**
 * As duas abas da central, como navegação de rota: cada uma é uma página com
 * a sua leitura, o seu filtro e o seu esqueleto — a central junta o LUGAR, não
 * a estrutura (pedido do usuário, 14/11/2026). Da querystring só viaja o
 * vendedor do cabeçalho, que vale para as duas (17/11/2026); o filtro de uma
 * (prazo, assunto, cartão aberto) não significa nada na outra.
 */
export function CentralTabsNav() {
  const sellerId = useSearchParams().get(SELLER_PARAM);
  const withSeller = (href: string) =>
    sellerId
      ? `${href}?${new URLSearchParams({ [SELLER_PARAM]: sellerId })}`
      : href;

  return (
    <Tabs.NavList data-tour="central-tabs">
      <Tabs.NavItem href={withSeller("/priorities")} exact>
        Pendências
      </Tabs.NavItem>
      <Tabs.NavItem href={withSeller("/priorities/opportunities")}>
        Oportunidades
      </Tabs.NavItem>
    </Tabs.NavList>
  );
}
