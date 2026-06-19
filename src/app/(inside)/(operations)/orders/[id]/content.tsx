"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { useQuery } from "@apollo/client/react";
import { PackageX } from "lucide-react";
import { OrderDetailHeader } from "./_components/OrderDetailHeader";
import { OrderDetailSkeleton } from "./_components/OrderDetailSkeleton";
import { OrderItemsTable } from "./_components/OrderItemsTable";
import { OrderSummaryCard } from "./_components/OrderSummaryCard";
import { ORDER_DETAIL_QUERY } from "./gql";
import { OrderDetailResponse } from "./interface";

interface Props {
  id: string;
}

export default function OrderDetailContent({ id }: Props) {
  const { data, loading, refetch } = useQuery<OrderDetailResponse>(
    ORDER_DETAIL_QUERY,
    { variables: { id } }
  );

  const order = data?.order?.data;

  if (loading && !order) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-32 py-[28px]">
        <EmptyState.Root className="max-w-[420px]">
          <EmptyState.Icon>
            <PackageX size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Pedido não encontrado</EmptyState.Title>
          <EmptyState.Description>
            O pedido que você procura não existe ou foi removido.
          </EmptyState.Description>
        </EmptyState.Root>
      </div>
    );
  }

  return (
    <PageContent className="print-area">
      <OrderDetailHeader order={order} onRefetch={refetch} />

      <div className="flex gap-20">
        <div className="flex min-w-0 flex-1 flex-col gap-12">
          <OrderItemsTable
            orderId={order.id}
            factoryId={order.factory?.id ?? null}
            onOrderChanged={() => refetch()}
          />

          {order.notes && (
            <Card.Root>
              <Card.Header>
                <Card.Header.Title size="sm" weight="bold">
                  Observações
                </Card.Header.Title>
              </Card.Header>
              <Card.Body>
                <Title variant="body-sm" color="secondary">
                  {order.notes}
                </Title>
              </Card.Body>
            </Card.Root>
          )}
        </div>

        <div className="flex w-[260px] shrink-0 flex-col gap-12">
          <OrderSummaryCard order={order} />
        </div>
      </div>
    </PageContent>
  );
}
