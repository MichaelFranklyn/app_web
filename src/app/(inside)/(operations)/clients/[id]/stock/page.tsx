"use client";

import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { useQuery } from "@apollo/client/react";
import { Info, PackageSearch } from "lucide-react";
import { useParams } from "next/navigation";
import { CLIENT_PRODUCT_INSIGHTS_QUERY, SELLER_CLIENT_FACTORIES_QUERY } from "../gql";
import {
  ClientProductInsightsQueryResponse,
  SellerClientFactoriesQueryResponse,
} from "../interface";
import { formatDate, stockSituation } from "../utils";
import { StockSkeleton } from "./_components/StockSkeleton";

export default function StockPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: vinculosData, loading: vinculosLoading } =
    useQuery<SellerClientFactoriesQueryResponse>(SELLER_CLIENT_FACTORIES_QUERY, {
      variables: {
        input: {
          filters: [{ field: "client_id", operator: "eq", value: id }],
          first: 1,
        },
      },
      skip: !id,
    });

  const sellerClientFactoryId =
    vinculosData?.sellerClientFactoryList.edges[0]?.node.id ?? null;

  const { data: insightsData, loading: insightsLoading } =
    useQuery<ClientProductInsightsQueryResponse>(CLIENT_PRODUCT_INSIGHTS_QUERY, {
      variables: {
        sellerClientFactoryId,
        input: { first: 100 },
      },
      skip: !sellerClientFactoryId,
    });

  const insights =
    insightsData?.clientProductInsights.edges.map((e) => e.node) ?? [];

  const isLoading = vinculosLoading || insightsLoading;

  if (isLoading && insights.length === 0) {
    return <StockSkeleton />;
  }

  return (
    <>
      <Alert.Root variant="info" className="mb-16">
        <Info size={14} className="mt-[1px] shrink-0" />
        <Alert.Content>
          <Alert.Description>
            Estimativas baseadas nas médias informadas pelo vendedor em campo.
            Corrija observando o estoque durante as visitas.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Table.Root>
        <Table.Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Produto</Table.Head>
              <Table.Head>Última compra</Table.Head>
              <Table.Head>Qtd. comprada</Table.Head>
              <Table.Head>
                <span className="inline-flex items-center gap-4">
                  Avg. duração
                  <HelpTooltip
                    label="O que é a duração média?"
                    content={
                      <p>
                        Tempo médio, em dias, que a quantidade comprada costuma
                        durar no cliente — calculado a partir do histórico de
                        pedidos e das médias informadas pelo vendedor.
                      </p>
                    }
                  />
                </span>
              </Table.Head>
              <Table.Head>
                <span className="inline-flex items-center gap-4">
                  Esgotamento est.
                  <HelpTooltip
                    label="Como é estimado o esgotamento?"
                    content={
                      <p>
                        Data estimada em que o estoque do cliente deve zerar,
                        projetada a partir da última compra somada à duração
                        média do produto.
                      </p>
                    }
                  />
                </span>
              </Table.Head>
              <Table.Head>
                <span className="inline-flex items-center gap-4">
                  Dias até esgotar
                  <HelpTooltip
                    label="O que significam os dias até esgotar?"
                    content={
                      <p>
                        Dias restantes até a data estimada de esgotamento.
                        Valores negativos indicam que o estoque provavelmente já
                        zerou há alguns dias.
                      </p>
                    }
                  />
                </span>
              </Table.Head>
              <Table.Head>
                <span className="inline-flex items-center gap-4">
                  Situação
                  <HelpTooltip
                    label="Como a situação é definida?"
                    content={
                      <p>
                        Classificação derivada dos dias até esgotar e do risco de
                        churn do produto, indicando a urgência de reposição.
                      </p>
                    }
                  />
                </span>
              </Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {insights.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={7}>
                  <EmptyState.Root>
                    <EmptyState.Icon>
                      <PackageSearch size={32} />
                    </EmptyState.Icon>
                    <EmptyState.Title>
                      Nenhum dado de estoque disponível
                    </EmptyState.Title>
                    <EmptyState.Description>
                      As estimativas de estoque aparecem aqui conforme os pedidos
                      e visitas são registrados para este cliente.
                    </EmptyState.Description>
                  </EmptyState.Root>
                </Table.Cell>
              </Table.Row>
            ) : (
              insights.map((e) => {
                const sit = stockSituation(e.daysSinceStockout, e.churnRisk);
                const diasValue = -e.daysSinceStockout;
                const diasLabel = `${diasValue > 0 ? "+" : ""}${diasValue} dias`;
                const qty = e.product
                  ? `${parseFloat(e.lastQuantity).toFixed(0)} ${e.product.unit}`
                  : parseFloat(e.lastQuantity).toFixed(0);
                return (
                  <Table.Row key={e.id} className="group">
                    <Table.Cell>
                      <Table.CellText variant="strong">
                        {e.product?.name ?? "—"}
                      </Table.CellText>
                    </Table.Cell>
                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {formatDate(e.lastPurchaseDate)}
                      </Table.CellText>
                    </Table.Cell>
                    <Table.Cell>
                      <Table.CellText variant="dim">{qty}</Table.CellText>
                    </Table.Cell>
                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {e.avgShelfDays != null ? `${e.avgShelfDays} dias` : "—"}
                      </Table.CellText>
                    </Table.Cell>
                    <Table.Cell>
                      <Table.CellText variant="dim">
                        {formatDate(e.estimatedStockoutDate)}
                      </Table.CellText>
                    </Table.Cell>
                    <Table.ScoreCell
                      score={diasValue}
                      color={sit.color}
                      noBar
                      label={diasLabel}
                    />
                    <Table.Cell>
                      <Badge.Root color={sit.color} appearance="tinted">
                        <Badge.Text>{sit.label}</Badge.Text>
                      </Badge.Root>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Table>
      </Table.Root>
    </>
  );
}
