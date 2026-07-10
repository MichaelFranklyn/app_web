"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { useQuery } from "@apollo/client/react";
import { Receipt } from "lucide-react";
import { useState } from "react";
import { useClientRoute } from "../context";
import { CLIENT_FACTORY_ORDERS_QUERY } from "../gql";
import {
  ClientFactoryOrdersQueryResponse,
  FactoryOrderSummary,
} from "../interface";
import { AddOrderModal } from "./_components/AddOrderModal";
import { FactoryOrderCard } from "./_components/FactoryOrderCard";
import { FactoryOrderModal } from "./_components/FactoryOrderModal";

export default function OrdersContent() {
  const { clientId, companyClientId } = useClientRoute();
  const [selected, setSelected] = useState<FactoryOrderSummary | null>(null);

  // O pedido é POR FÁBRICA: cada uma tem o seu catálogo e o seu ritmo de compra.
  // O backend ordena da compra mais recente à mais antiga e inclui as fábricas em
  // que o cliente nunca comprou — ausência de pedido também é informação de venda.
  const { data, loading, refetch } = useQuery<ClientFactoryOrdersQueryResponse>(
    CLIENT_FACTORY_ORDERS_QUERY,
    { variables: { id: companyClientId }, skip: !companyClientId }
  );

  const summaries = data?.companyClient.data?.factoryOrderSummaries ?? [];

  if (loading && summaries.length === 0) {
    return <Loading.Skeleton className="h-[240px] w-full" />;
  }

  return (
    <div className="flex flex-col gap-16" data-tour="client-orders-table">
      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Title variant="heading-md">Pedidos por fábrica</Title>
          <HelpTooltip
            label="Por que os pedidos são separados por fábrica?"
            content={
              <Title variant="body-sm">
                Cada fábrica vende os seus próprios produtos, e o cliente compra
                de cada uma num ritmo diferente. Toque num card para ver os
                pedidos daquela fábrica.
              </Title>
            }
          />
        </div>
        <div data-tour="client-orders-actions">
          <AddOrderModal clientId={clientId} onCreated={() => refetch()} />
        </div>
      </div>

      {summaries.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Icon>
            <Receipt size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhuma fábrica vinculada</EmptyState.Title>
          <EmptyState.Description>
            Vincule uma fábrica a este cliente para começar a registrar pedidos.
          </EmptyState.Description>
        </EmptyState.Root>
      ) : (
        <div className="desktop:grid-cols-3 tablet:grid-cols-2 grid grid-cols-1 gap-12">
          {summaries.map((summary) => (
            <FactoryOrderCard
              key={summary.sellerClientFactoryId}
              summary={summary}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      <FactoryOrderModal
        summary={selected}
        clientId={clientId}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
