"use client";

import { OrdersTab } from "../_components/OrdersTab";
import { useFactoryDetail } from "../context";

export default function FactoryOrdersPage() {
  const { companyFactory } = useFactoryDetail();
  return <OrdersTab factoryId={companyFactory.factory.id} />;
}
