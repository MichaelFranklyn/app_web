"use client";

import { Tabs } from "@/components/Tabs";

interface Props {
  basePath: string;
}

export function FactoryNavList({ basePath }: Props) {
  return (
    <Tabs.NavList>
      <Tabs.NavItem href={`${basePath}/overview`}>Visão Geral</Tabs.NavItem>
      <Tabs.NavItem href={`${basePath}/products`}>Produtos</Tabs.NavItem>
      <Tabs.NavItem href={`${basePath}/price-lists`}>Tabelas</Tabs.NavItem>
      <Tabs.NavItem href={`${basePath}/sellers`}>Vendedores</Tabs.NavItem>
      <Tabs.NavItem href={`${basePath}/clients`}>Clientes</Tabs.NavItem>
      <Tabs.NavItem href={`${basePath}/orders`}>Pedidos</Tabs.NavItem>
      <Tabs.NavItem href={`${basePath}/import-template`}>
        Modelos de importação
      </Tabs.NavItem>
    </Tabs.NavList>
  );
}
