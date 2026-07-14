"use client";

import { Alert } from "@/components/Alert";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { useQuery } from "@apollo/client/react";
import { Info, PackageSearch } from "lucide-react";
import { useState } from "react";
import { useClientRoute } from "../context";
import { CLIENT_FACTORY_STOCK_QUERY } from "../gql";
import {
  ClientFactoryStockQueryResponse,
  FactoryStockSummary,
} from "../interface";
import { FactoryStockCard } from "./_components/FactoryStockCard";
import { FactoryStockModal } from "./_components/FactoryStockModal";
import { StockSkeleton } from "./_components/StockSkeleton";

export default function StockContent() {
  const { companyClientId } = useClientRoute();
  const [selected, setSelected] = useState<FactoryStockSummary | null>(null);

  // O estoque é POR FÁBRICA: cada uma vende os seus produtos e tem histórico de
  // compra próprio. O backend ordena das que mais pedem reposição às tranquilas.
  const { data, loading, error, refetch } =
    useQuery<ClientFactoryStockQueryResponse>(CLIENT_FACTORY_STOCK_QUERY, {
      variables: { id: companyClientId },
      skip: !companyClientId,
    });

  const summaries = data?.companyClient.data?.factoryStockSummaries ?? [];

  if (loading && summaries.length === 0) return <StockSkeleton />;
  if (error && summaries.length === 0)
    return <QueryError onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-16">
      <Alert.Root variant="info">
        <Info size={14} className="mt-[1px] shrink-0" />
        <Alert.Content>
          <Alert.Description>
            Estimativas baseadas nas médias informadas pelo vendedor em campo.
            Corrija observando o estoque durante as visitas.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <div className="flex items-center gap-6">
        <Title variant="heading-md">Estoque por fábrica</Title>
        <HelpTooltip
          label="Por que o estoque é separado por fábrica?"
          content={
            <Title variant="body-sm">
              Cada fábrica vende os seus próprios produtos, e o cliente compra
              de cada uma num ritmo diferente. Toque num card para ver os
              produtos daquela fábrica e quando devem acabar.
            </Title>
          }
        />
      </div>

      {summaries.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Icon>
            <PackageSearch size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhum dado de estoque disponível</EmptyState.Title>
          <EmptyState.Description>
            As estimativas de estoque aparecem aqui conforme os pedidos e
            visitas são registrados para este cliente.
          </EmptyState.Description>
        </EmptyState.Root>
      ) : (
        <div className="desktop:grid-cols-3 tablet:grid-cols-2 grid grid-cols-1 gap-12">
          {summaries.map((summary) => (
            <FactoryStockCard
              key={summary.sellerClientFactoryId}
              summary={summary}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      <FactoryStockModal summary={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
