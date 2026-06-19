"use client";

import { EmptyState } from "@/components/EmptyState";
import { useQuery } from "@apollo/client/react";
import { ListX } from "lucide-react";
import { useFactoryDetail } from "../../context";
import { ItemsTable } from "./_components/ItemsTable";
import { PriceListDetailHeader } from "./_components/PriceListDetailHeader";
import { PriceListDetailSkeleton } from "./_components/PriceListDetailSkeleton";
import { PRICE_LIST_DETAIL_QUERY } from "./gql";
import { PriceListDetailResponse } from "./interface";

interface Props {
  priceListId: string;
}

export default function PriceListDetailContent({ priceListId }: Props) {
  const { companyFactory } = useFactoryDetail();

  const { data, loading, refetch } = useQuery<PriceListDetailResponse>(
    PRICE_LIST_DETAIL_QUERY,
    { variables: { id: priceListId } }
  );

  const priceList = data?.price_list_detail?.data;

  if (loading && !priceList) {
    return <PriceListDetailSkeleton />;
  }

  if (!loading && !priceList) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <EmptyState.Root className="max-w-105">
          <EmptyState.Icon>
            <ListX size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Tabela não encontrada</EmptyState.Title>
          <EmptyState.Description>
            A tabela de preços que você procura não existe ou foi removida.
          </EmptyState.Description>
        </EmptyState.Root>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-20">
      <PriceListDetailHeader
        priceList={priceList}
        loading={loading}
        companyFactory={companyFactory}
        onRefetch={refetch}
      />

      <ItemsTable
        priceListId={priceListId}
        companyFactoryId={companyFactory.id}
        priceListActive={priceList?.isActive ?? false}
      />
    </div>
  );
}
