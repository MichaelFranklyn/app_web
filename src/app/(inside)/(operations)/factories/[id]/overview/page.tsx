"use client";

import { OverviewTab } from "../_components/OverviewTab";
import { useFactoryDetail } from "../context";

export default function FactoryOverviewPage() {
  const { companyFactory } = useFactoryDetail();
  return <OverviewTab companyFactory={companyFactory} />;
}
