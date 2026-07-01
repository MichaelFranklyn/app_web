"use client";

import { Tabs } from "@/components/Tabs";
import SellerAccessContent from "./SellerAccessContent";
import SellerListContent from "./SellerListContent";

export default function SellersTab() {
  return (
    <Tabs.Root defaultValue="lista">
      <Tabs.List data-tour="sellers-tabs">
        <Tabs.Item value="lista">Lista de Vendedores</Tabs.Item>
        <Tabs.Item value="acessos">Acessos por Fábrica</Tabs.Item>
      </Tabs.List>

      <SellerListContent />
      <SellerAccessContent />
    </Tabs.Root>
  );
}
