"use client";

import { Tabs } from "@/components/Tabs";
import { FeatureGate } from "@/components/FeatureGate";

interface Props {
  basePath: string;
}

export function FactoryNavList({ basePath }: Props) {
  return (
    <Tabs.NavList data-tour="factory-tabs">
      <Tabs.NavItem href={`${basePath}/overview`}>Visão Geral</Tabs.NavItem>
      <Tabs.NavItem
        href={`${basePath}/products`}
        data-tour="factory-tab-products"
      >
        Produtos
      </Tabs.NavItem>
      <Tabs.NavItem
        href={`${basePath}/price-lists`}
        data-tour="factory-tab-prices"
      >
        Tabelas
      </Tabs.NavItem>
      <Tabs.NavItem href={`${basePath}/payment-terms`}>Prazos</Tabs.NavItem>
      <Tabs.NavItem href={`${basePath}/sellers`}>Vendedores</Tabs.NavItem>
      <Tabs.NavItem href={`${basePath}/clients`}>Clientes</Tabs.NavItem>
      <Tabs.NavItem href={`${basePath}/orders`}>Pedidos</Tabs.NavItem>
      {/* Modelo de importação só serve a quem pode importar. */}
      <FeatureGate feature="BULK_IMPORT">
        <Tabs.NavItem href={`${basePath}/import-template`}>
          Modelos de importação
        </Tabs.NavItem>
      </FeatureGate>
    </Tabs.NavList>
  );
}
