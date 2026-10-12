"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { CheckCircle2, RefreshCw } from "lucide-react";

import { PendingCases } from "./_components/PendingCases";
import { PendingCounts } from "./_components/PendingCounts";
import { PendingHeader } from "./_components/PendingHeader";
import { PendingToolbar } from "./_components/PendingToolbar";
import { PendingTypeCard } from "./_components/PendingTypeCard";
import { PendingContentProps } from "./interface";
import { PendingSkeleton } from "./skeleton";
import { usePendingSummary } from "./usePendingSummary";
import { hasActiveFilter } from "./utils";

/**
 * A central de pendências: o que espera por você, um cartão por assunto.
 *
 * O mesmo desenho de /opportunities — número em destaque, o porquê, os casos
 * mais urgentes e a lista completa aberta na própria página —, com a pergunta
 * trocada: lá é "onde vale agir para vender mais"; aqui é "o que eu tenho de
 * resolver". Cada assunto operacional mora só aqui, e dentro dele a ordem
 * continua sendo a de trabalho: prioridade, depois o prazo mais antigo.
 */
export default function PendingContent(props: PendingContentProps) {
  const pending = usePendingSummary(props);
  const open = pending.cards.find((row) => row.type === pending.openType);
  const filtered = hasActiveFilter(pending.filterValues);

  // A hora da leitura, e não a data: a tela é do dia, e o que a pessoa quer
  // saber é se os números já consideram o pedido que ela acabou de faturar.
  const readAt = pending.summary?.generatedAt
    ? new Date(pending.summary.generatedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <PageContent>
      <PendingHeader />

      {pending.failed ? (
        <QueryError onRetry={() => pending.refetch()} />
      ) : pending.showSkeleton ? (
        <PendingSkeleton />
      ) : (
        <>
          <PendingCounts
            counts={pending.whenCounts}
            active={pending.activeWhen}
            onToggle={pending.toggleWhen}
          />
          <PendingToolbar
            filterFields={pending.filterFields}
            filterValues={pending.filterValues}
            setFilters={pending.setFilters}
          />

          {pending.cards.length === 0 ? (
            <EmptyState.Root>
              <EmptyState.Icon>
                <CheckCircle2 size={32} />
              </EmptyState.Icon>
              <EmptyState.Title>
                {filtered ? "Nenhuma pendência neste filtro" : "Nada pendente"}
              </EmptyState.Title>
              <EmptyState.Description>
                {filtered
                  ? "Não há pendência com o prazo e o responsável escolhidos. Limpe os filtros para ver tudo o que espera por você."
                  : "Nenhuma visita sem resposta, nenhum retorno vencendo, nenhum pedido parado, nenhum boleto vencido e nenhum cliente esquecido. Quando algo aparecer, é aqui que vai estar."}
              </EmptyState.Description>
            </EmptyState.Root>
          ) : (
            <Grid.Root
              cols={{ base: 1, desktop: 2 }}
              gap={16}
              data-tour="pending-cards"
            >
              {pending.cards.map((row) => (
                <Grid.Item key={row.type}>
                  <PendingTypeCard
                    row={row}
                    open={row.type === pending.openType}
                    onToggle={() => pending.toggleType(row.type)}
                  />
                </Grid.Item>
              ))}
            </Grid.Root>
          )}

          {open && (
            <PendingCases
              // Assunto novo = lista nova: nada do anterior fica na tela.
              key={open.type}
              type={open.type}
              count={open.count}
              filterValues={pending.queryValues}
              canSelectSeller={props.canSelectSeller}
              page={pending.currentPage}
              onPageChange={pending.setCurrentPage}
              onChanged={() => pending.refetch()}
            />
          )}

          {readAt && (
            <div
              className="flex flex-wrap items-center justify-center gap-8"
              data-tour="pending-refresh"
            >
              <Title variant="micro" color="muted">
                Leitura das {readAt}
              </Title>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="xs"
                noUppercase
                loading={pending.loading}
                onClick={() => pending.refetch()}
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
