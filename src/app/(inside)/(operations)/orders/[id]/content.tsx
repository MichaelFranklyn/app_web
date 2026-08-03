"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useQuery } from "@apollo/client/react";
import { PackageX } from "lucide-react";
import { BackorderBanner } from "./_components/BackorderBanner";
import { InstallmentsCard } from "./_components/InstallmentsCard";
import { OrderDetailHeader } from "./_components/OrderDetailHeader";
import { OrderDetailSkeleton } from "./_components/OrderDetailSkeleton";
import { OrderItemsTable } from "./_components/OrderItemsTable";
import { OrderSummaryCard } from "./_components/OrderSummaryCard";
import { PaymentMinimumBanner } from "./_components/PaymentMinimumBanner";
import { ORDER_DETAIL_QUERY, ORDER_ITEMS_QUERY } from "./gql";
import { OrderDetailResponse, OrderItemsResponse } from "./interface";

interface Props {
  id: string;
  /** Detalhe já buscado no servidor (page.tsx); null se o SSR falhou. */
  seedDetail?: OrderDetailResponse | null;
  /** Itens já buscados no servidor, semeados junto para a tabela não ir à rede. */
  seedItems?: OrderItemsResponse | null;
}

export default function OrderDetailContent({
  id,
  seedDetail,
  seedItems,
}: Props) {
  // Antes das leituras abaixo: com o cache quente o `cache-first` acerta já no
  // 1º render e a tela pinta sem esperar a rede. Os itens entram aqui — e não na
  // tabela — porque ela só monta depois que o pedido existe; semear no pai
  // desfaz o encadeamento (detalhe → itens) que existia no cliente.
  useSeedQuery(
    [
      { query: ORDER_DETAIL_QUERY, variables: { id }, data: seedDetail },
      { query: ORDER_ITEMS_QUERY, variables: { orderId: id }, data: seedItems },
    ],
    id
  );

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

      <BackorderBanner order={order} />

      <PaymentMinimumBanner order={order} />

      <div className="desktop:flex-row flex flex-col gap-20">
        <Card.Header.Group>
          <div
            className="flex min-w-0 flex-1 flex-col gap-12"
            data-tour="order-items"
          >
            <OrderItemsTable
              orderId={order.id}
              factoryId={order.factory?.id ?? null}
              clientId={order.client?.id ?? null}
              ipiInOrder={order.ipiInOrder}
              onOrderChanged={() => refetch()}
            />

            {order.invoicedAt && order.installments.length > 0 && (
              <InstallmentsCard order={order} onChanged={() => refetch()} />
            )}

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
        </Card.Header.Group>

        {/* self-start: sem isso o flex-row estica a coluna à altura da lista de
            itens e o card (h-full) cresce com espaço em branco embaixo. */}
        <div
          className="desktop:w-[260px] desktop:self-start flex w-full shrink-0 flex-col gap-12"
          data-tour="order-summary"
        >
          <OrderSummaryCard order={order} />
        </div>
      </div>
    </PageContent>
  );
}
