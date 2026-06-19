"use client";

import { PageContent } from "@/components/PageContent";
import { SellersHeader } from "./_components/SellersHeader";
import SellersTab from "./_components/SellersTab";
import { SellersContentProps } from "./interface";

export default function SellersContent({ stats }: SellersContentProps) {
  return (
    <PageContent>
      <SellersHeader stats={stats} />

      <SellersTab />
    </PageContent>
  );
}
