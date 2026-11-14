"use client";

import { Tabs } from "@/components/Tabs";

/**
 * As duas abas da central, como navegação de rota: cada uma é uma página com
 * a sua leitura, o seu filtro e o seu esqueleto — a central junta o LUGAR, não
 * a estrutura (pedido do usuário, 14/11/2026). Sem querystring viajando: o
 * filtro de uma (prazo, assunto) não significa nada na outra.
 */
export function CentralTabsNav() {
  return (
    <Tabs.NavList data-tour="central-tabs">
      <Tabs.NavItem href="/priorities" exact>
        Pendências
      </Tabs.NavItem>
      <Tabs.NavItem href="/priorities/opportunities">
        Oportunidades
      </Tabs.NavItem>
    </Tabs.NavList>
  );
}
