"use client";

import { Loading } from "@/components/Loading";
import { Modal } from "@/components/Modal";
import { useCompleteList } from "@/hooks/useCompleteList";
import { CLIENT_PRODUCT_INSIGHTS_QUERY } from "../../../gql";
import {
  ClientProductInsightsQueryResponse,
  FactoryStockSummary,
} from "../../../interface";
import { StockProductsList } from "../StockProductsList";
import { factoryName } from "@/utils/company";

interface Props {
  summary: FactoryStockSummary | null;
  onClose: () => void;
}

// Do que zera primeiro (ou já zerou) ao que está tranquilo. Sem `order` o
// listador genérico não ordena nada (`_apply_order` devolve a query intocada) e
// o banco entrega na ordem que quiser — a lista de reposição saía embaralhada,
// e podia até sair diferente a cada abertura. Produto sem estimativa cai no
// fim: no Postgres, `ASC` põe os nulos por último.
const STOCKOUT_FIRST = { order: { by: "estimated_stockout_date", dir: "asc" } };
const getInsights = (d: ClientProductInsightsQueryResponse) =>
  d.clientProductInsights;

/** Produtos e estimativas de esgotamento do cliente NAQUELA fábrica. */
export function FactoryStockModal({ summary, onClose }: Props) {
  const linkId = summary?.sellerClientFactoryId ?? null;

  // Só busca quando o modal abre: um cliente tem dezenas de fábricas e carregar
  // os produtos de todas ao abrir a aba seria desperdício.
  //
  // E sem teto fixo: são os produtos que o cliente compra NAQUELA fábrica, e
  // `first: 100` é o tipo de limite que só aparece no cliente grande — a lista
  // mostraria 100 de 130 e o vendedor concluiria que os outros trinta nunca
  // foram comprados. O hook rebusca pelo total quando ele passa do que veio.
  const { data, loading, refetch } =
    useCompleteList<ClientProductInsightsQueryResponse>(
      CLIENT_PRODUCT_INSIGHTS_QUERY,
      STOCKOUT_FIRST,
      getInsights,
      {
        skip: !linkId,
        extraVariables: { sellerClientFactoryId: linkId },
      }
    );

  if (!summary) return null;

  const insights = data?.clientProductInsights.edges.map((e) => e.node) ?? [];
  const name = factoryName(summary.factory);

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
