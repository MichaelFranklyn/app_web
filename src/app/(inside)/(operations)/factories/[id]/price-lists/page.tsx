"use client";

import { Grid } from "@/components/Grid";
import { PriceListsTab } from "../_components/PriceListsTab";
import { TiersTab } from "../_components/TiersTab";
import { useFactoryDetail } from "../context";

export default function FactoryPriceListsPage() {
  const { companyFactory } = useFactoryDetail();
  const companyFactoryId = companyFactory.id;
  const factoryId = companyFactory.factory.id;

  return (
    <Grid.Root cols={{ base: 1, desktop: 12 }} gap={16} className="items-start">
      <Grid.Item span={{ base: 1, desktop: 7 }}>
        <PriceListsTab companyFactoryId={companyFactoryId} factoryId={factoryId} />
      </Grid.Item>
      <Grid.Item span={{ base: 1, desktop: 5 }}>
        <TiersTab companyFactoryId={companyFactoryId} />
      </Grid.Item>
    </Grid.Root>
  );
}
