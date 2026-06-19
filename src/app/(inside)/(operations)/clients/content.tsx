"use client";

import { PageContent } from "@/components/PageContent";
import { ClientsHeader } from "./_components/ClientsHeader";
import { ClientsTable } from "./_components/ClientsTable";
import { ClientsContentProps } from "./interface";

export default function ClientesContent({ stats }: ClientsContentProps) {
  return (
    <PageContent>
      <ClientsHeader stats={stats} />

      <ClientsTable />
    </PageContent>
  );
}
