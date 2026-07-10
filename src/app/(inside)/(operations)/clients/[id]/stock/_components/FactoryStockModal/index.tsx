"use client";

import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { useQuery } from "@apollo/client/react";
import { CLIENT_PRODUCT_INSIGHTS_QUERY } from "../../../gql";
import {
  ClientProductInsightsQueryResponse,
  FactoryStockSummary,
} from "../../../interface";
import { StockProductsList } from "../StockProductsList";

interface Props {
  summary: FactoryStockSummary | null;
  onClose: () => void;
}

/** Produtos e estimativas de esgotamento do cliente NAQUELA fábrica. */
export function FactoryStockModal({ summary, onClose }: Props) {
  const linkId = summary?.sellerClientFactoryId ?? null;

  // Só busca quando o modal abre: um cliente tem dezenas de fábricas e carregar
  // os produtos de todas ao abrir a aba seria desperdício.
  const { data, loading, refetch } =
    useQuery<ClientProductInsightsQueryResponse>(
      CLIENT_PRODUCT_INSIGHTS_QUERY,
      {
        variables: { sellerClientFactoryId: linkId, input: { first: 100 } },
        skip: !linkId,
      }
    );

  if (!summary) return null;

  const insights = data?.clientProductInsights.edges.map((e) => e.node) ?? [];
  const name =
    summary.factory?.nomeFantasia ?? summary.factory?.razaoSocial ?? "—";

  return (
    <Modal.Root open onOpenChange={(open) => !open && onClose()}>
      <Modal.Content size="4xl">
        <Modal.Header
          title={`Estoque estimado — ${name}`}
          description="Estimativas baseadas nas médias informadas pelo vendedor em campo. Corrija observando o estoque durante as visitas."
        />
        <Modal.Body>
          {loading ? (
            <Loading.Skeleton className="h-[240px] w-full" />
          ) : (
            <StockProductsList
              insights={insights}
              sellerClientFactoryId={linkId}
              onSaved={() => refetch()}
            />
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
