"use client";

import { ProductsTab } from "../_components/ProductsTab";
import { useFactoryDetail } from "../context";

export default function FactoryProductsPage() {
  const { companyFactory } = useFactoryDetail();
  return <ProductsTab companyFactoryId={companyFactory.id} />;
}
