"use client";

import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { Tabs } from "@/components/Tabs";
import { useQuery } from "@apollo/client/react";
import { UserX } from "lucide-react";
import { ClientsTab } from "./_components/ClientsTab";
import { FactoriesTab } from "./_components/FactoriesTab";
import { OverviewTab } from "./_components/OverviewTab";
import { SellerDetailActions } from "./_components/SellerDetailActions";
import { SellerDetailSkeleton } from "./_components/SellerDetailSkeleton";
import { SellerPageHeader } from "./_components/SellerPageHeader";
import { SELLER_DETAIL_QUERY } from "./gql";
import { SellerDetailQueryResponse } from "./interface";

interface Props {
  sellerId: string;
}

export default function SellerDetailContent({ sellerId }: Props) {
  const { data, loading, refetch } = useQuery<SellerDetailQueryResponse>(
    SELLER_DETAIL_QUERY,
    {
      variables: { id: sellerId },
    }
  );

  const seller = data?.seller_detail?.data;

  if (loading && !seller) {
    return <SellerDetailSkeleton />;
  }

  if (!seller) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-32 py-[28px]">
        <EmptyState.Root className="max-w-[420px]">
          <EmptyState.Icon>
            <UserX size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Vendedor não encontrado</EmptyState.Title>
          <EmptyState.Description>
            O vendedor que você procura não existe ou foi removido.
          </EmptyState.Description>
        </EmptyState.Root>
      </div>
    );
  }

  return (
    <PageContent>
      <SellerPageHeader
        seller={seller}
        actions={<SellerDetailActions seller={seller} onRefetch={refetch} />}
      />

      <Tabs.Root defaultValue="visao-geral">
        <Tabs.List data-tour="seller-detail-tabs">
          <Tabs.Item value="visao-geral">Visão Geral</Tabs.Item>
          <Tabs.Item value="fabricas">Fábricas</Tabs.Item>
          <Tabs.Item value="clientes">Clientes</Tabs.Item>
        </Tabs.List>

        <OverviewTab seller={seller} />
        <FactoriesTab sellerId={sellerId} />
        <ClientsTab sellerId={sellerId} />
      </Tabs.Root>
    </PageContent>
  );
}
