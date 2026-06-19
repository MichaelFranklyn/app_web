"use client";

import { SellersTab } from "../_components/SellersTab";
import { useFactoryDetail } from "../context";

export default function FactorySellersPage() {
  const { companyFactory } = useFactoryDetail();
  return <SellersTab factoryId={companyFactory.factory.id} />;
}
