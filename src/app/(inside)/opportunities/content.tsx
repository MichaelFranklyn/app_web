"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { RefreshCw, Sparkles } from "lucide-react";

import { OpportunitiesHeader } from "./_components/OpportunitiesHeader";
import { OpportunitiesSkeleton } from "./_components/OpportunitiesSkeleton";
import { OpportunityCard } from "./_components/OpportunityCard";
import { OpportunityCases } from "./_components/OpportunityCases";
import { OpportunitiesContentProps } from "./interface";
import { useOpportunities } from "./useOpportunities";

/**
 * Onde vale concentrar as próximas ações comerciais (a antiga /insights).
 *
 * A diferença para Pendências aparece no formato: lá é lista de trabalho, uma
 * linha por compromisso; aqui são cartões de análise, cada um com o motivo e a
 * lista de clientes aberta na própria página. Uma oportunidade vira contato
 * agendado ou visita — e o compromisso aparece em Pendências quando chegar o
 * dia; aqui, o cliente passa a mostrar "ligação marcada para X".
 *
 * Sem "potencial de venda" somado: não há estimativa confiável que some
 * clientes de ritmos diferentes num número só.
 */
export default function OpportunitiesContent({
  canSelectSeller,
  canPlanVisits,
  seed,
}: OpportunitiesContentProps) {
  const view = useOpportunities({ canSelectSeller, seed });
  const open = view.opportunities.find((item) => item.kind === view.openKind);

  return (
    <PageContent>
      <OpportunitiesHeader
        canSelectSeller={canSelectSeller}
        sellerOptions={view.sellerOptions}
        sellerId={view.sellerId}
        onSellerChange={view.setSellerId}
      />

      {view.failed ? (
        <QueryError onRetry={() => view.refetch()} />
      ) : view.showSkeleton ? (
        <OpportunitiesSkeleton />
      ) : view.opportunities.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Icon>
            <Sparkles size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhuma oportunidade agora</EmptyState.Title>
          <EmptyState.Description>
            Nenhum cliente passou do próprio intervalo de compra e nenhum
            prioritário ficou fora da rotina. Os compromissos do dia estão em
            Pendências.
          </EmptyState.Description>
        </EmptyState.Root>
      ) : (
        <>
          <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
            {view.opportunities.map((opportunity) => (
              <Grid.Item key={opportunity.kind}>
                <OpportunityCard
                  opportunity={opportunity}
                  open={opportunity.kind === view.openKind}
                  onToggle={() => view.toggle(opportunity.kind)}
                  canPlanVisits={canPlanVisits}
                />
              </Grid.Item>
            ))}
          </Grid.Root>

          {open && (
            <OpportunityCases
              key={`${open.kind}-${view.sellerId ?? "all"}`}
              opportunity={open}
              sellerId={view.sellerId}
              canPlanVisits={canPlanVisits}
              onChanged={() => view.refetch()}
            />
          )}

          {view.readAt && (
            <div
              className="flex flex-wrap items-center justify-center gap-8"
              data-tour="opportunities-refresh"
            >
              <Title variant="micro" color="muted">
                Leitura das {view.readAt}
              </Title>
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="xs"
                noUppercase
                loading={view.loading}
                onClick={() => view.refetch()}
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
