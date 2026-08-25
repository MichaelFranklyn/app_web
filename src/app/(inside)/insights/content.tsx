"use client";

import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useQuery } from "@apollo/client/react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { InsightSection } from "./_components/InsightSection";
import { InsightsSkeleton } from "./_components/InsightsSkeleton";
import { InsightsSummary } from "./_components/InsightsSummary";
import { INSIGHTS_SELLERS_QUERY, MY_INSIGHTS_QUERY } from "./gql";
import {
  InsightsContentProps,
  InsightsSellersResponse,
  MyInsightsResponse,
} from "./interface";
import { insightsByTone, TONE_ORDER } from "./utils";

const EMPTY_INPUT = {};
const getSellers = (d: InsightsSellersResponse) => d.insights_sellers;

/**
 * O que fazer agora para vender mais — e por quê.
 *
 * Não é o histórico do que o sistema avisou (isso é o sino): é a leitura de
 * HOJE, calculada na hora, do que está pendente na carteira, nos pedidos, no
 * dinheiro e nas metas. Cada cartão traz o número, a explicação de por que
 * aquilo custa venda e o caminho para resolver.
 */
export default function InsightsContent({
  canSelectSeller,
  seed,
}: InsightsContentProps) {
  useSeedQuery([
    { query: MY_INSIGHTS_QUERY, variables: { sellerId: null }, data: seed },
  ]);

  const [sellerId, setSellerId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<MyInsightsResponse>(
    MY_INSIGHTS_QUERY,
    {
      variables: { sellerId },
      // A leitura é do momento: quem resolveu uma pendência e voltou tem de ver
      // a lista menor, não a foto de quando abriu a tela.
      fetchPolicy: "cache-and-network",
    }
  );

  const sellersQuery = useCompleteList<InsightsSellersResponse>(
    INSIGHTS_SELLERS_QUERY,
    EMPTY_INPUT,
    getSellers,
    { skip: !canSelectSeller }
  );

  const sellerOptions: SelectOption[] = useMemo(
    () =>
      (sellersQuery.data?.insights_sellers.edges ?? [])
        .filter(({ node }) => node.isActive)
        .map(({ node }) => ({ value: node.id, label: node.name })),
    [sellersQuery.data]
  );

  const insights = useMemo(
    () => data?.myInsights?.data?.insights ?? [],
    [data]
  );
  const showSkeleton = loading && !data;

  // A hora da leitura, e não a data: a tela é do dia, e o que a pessoa quer
  // saber é se o número já considera o pedido que ela acabou de fechar.
  const readAt = data?.myInsights?.data?.generatedAt
    ? new Date(data.myInsights.data.generatedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Insights</PanelHeader.Title>
            <PanelHeader.Description>
              O que está pendente agora e por que cada coisa custa venda. A
              leitura é feita na hora, com os dados de hoje — resolveu, sai da
              lista.
            </PanelHeader.Description>
            {canSelectSeller && (
              <PanelHeader.Actions className="mt-6">
                <div className="desktop:w-[220px] w-full">
                  <Input.Select
                    size="sm"
                    options={sellerOptions}
                    value={
                      sellerOptions.find((o) => o.value === sellerId) ?? null
                    }
                    variant="single"
                    placeholder="Toda a empresa"
                    onChange={(val: SelectOption | SelectOption[] | null) => {
                      const opt = Array.isArray(val) ? val[0] : val;
                      setSellerId(opt?.value ?? null);
                    }}
                  />
                </div>
              </PanelHeader.Actions>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {error && !data ? (
        <QueryError onRetry={() => refetch()} />
      ) : showSkeleton ? (
        <InsightsSkeleton />
      ) : insights.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Icon>
            <CheckCircle2 size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Nada pendente</EmptyState.Title>
          <EmptyState.Description>
            Nenhum cliente atrasado, nenhum pedido parado e nenhum boleto
            vencido no recorte desta tela. Quando algo aparecer, é aqui que vai
            estar — com o motivo ao lado.
          </EmptyState.Description>
        </EmptyState.Root>
      ) : (
        <>
          <InsightsSummary insights={insights} />

          <div className="flex flex-col gap-24">
            {TONE_ORDER.map((tone) => (
              <InsightSection
                key={tone}
                tone={tone}
                insights={insightsByTone(insights, tone)}
                sellerId={sellerId}
              />
            ))}
          </div>

          {readAt && (
            <div className="flex flex-wrap items-center justify-center gap-8">
              <Title variant="micro" color="muted">
                Leitura das {readAt}
              </Title>
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="xs"
                noUppercase
                loading={loading}
                onClick={() => refetch()}
              >
                <Button.Icon icon={RefreshCw} />
                <Button.Title>Atualizar</Button.Title>
              </Button.Root>
            </div>
          )}
        </>
      )}
    </PageContent>
  );
}
