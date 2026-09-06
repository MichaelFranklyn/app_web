"use client";

import { factoryName } from "@/utils/company";
import { ClientsTab } from "../_components/ClientsTab";
import { useFactoryDetail } from "../context";

export default function FactoryClientsPage() {
  const { companyFactory } = useFactoryDetail();
  return (
    <ClientsTab
      factoryId={companyFactory.factory.id}
      companyFactoryId={companyFactory.id}
      // O nome entra nos textos da negativação ("negativado apenas na fábrica
      // X"): sem ele, o modal não diria de qual crédito está falando.
      factoryLabel={factoryName(companyFactory.factory)}
    />
  );
}
