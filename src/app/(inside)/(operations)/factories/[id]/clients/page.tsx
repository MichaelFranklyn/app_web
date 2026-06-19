"use client";

import { ClientsTab } from "../_components/ClientsTab";
import { useFactoryDetail } from "../context";

export default function FactoryClientsPage() {
  const { companyFactory } = useFactoryDetail();
  return (
    <ClientsTab
      factoryId={companyFactory.factory.id}
      companyFactoryId={companyFactory.id}
    />
  );
}
