"use client";

import { PageContent } from "@/components/PageContent";
import { SellersHeader } from "./_components/SellersHeader";
import SellersTab from "./_components/SellersTab";
import { SellersContentProps } from "./interface";

export default function SellersContent({
  stats,
  initialData,
}: SellersContentProps) {
  return (
    <PageContent>
      <SellersHeader stats={stats} />

      <SellersTab initialData={initialData} />
    </PageContent>
  );
}
