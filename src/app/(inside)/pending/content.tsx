"use client";

import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";

import { PendingCounts } from "./_components/PendingCounts";
import { PendingHeader } from "./_components/PendingHeader";
import { PendingSections } from "./_components/PendingSections";
import { PendingTable } from "./_components/PendingTable";
import { PendingContentProps } from "./interface";
import { PendingSkeleton } from "./skeleton";
import { usePendingItems } from "./usePendingItems";
import { scopeNote } from "./utils";

/**
 * A central de pendências: o que fazer agora, e em que ordem.
 *
 * É a irmã de /opportunities, e a diferença aparece no formato: lá são cartões
 * de análise comercial ("onde vale agir para vender mais"); aqui é a lista de
 * trabalho — uma linha por compromisso, com prioridade, prazo, motivo e o
 * caminho até onde se resolve. Cada assunto operacional mora só aqui.
 */
export default function PendingContent(props: PendingContentProps) {
  const pending = usePendingItems(props);

  // A hora da leitura, e não a data: a tela é do dia, e o que a pessoa quer
  // saber é se a lista já considera o pedido que ela acabou de faturar.
  const readAt = pending.page?.generatedAt
    ? new Date(pending.page.generatedAt).toLocaleTimeString("pt-BR", {
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
          <PendingSections
            section={pending.section}
            totals={pending.sectionTotals}
            onChange={pending.changeSection}
          />
          <PendingCounts
            counts={pending.whenCounts}
            active={pending.activeWhen}
            onToggle={pending.toggleWhen}
          />
          <Title variant="body-sm" color="muted" data-tour="pending-scope">
            {scopeNote(pending.filterValues)}
          </Title>
          <PendingTable
            items={pending.items}
            loading={pending.loading}
            showSeller={props.canSelectSeller}
            section={pending.section}
            filterFields={pending.filterFields}
            filterValues={pending.filterValues}
            setFilters={pending.setFilters}
            onRefresh={() => pending.refetch()}
            readAt={readAt}
            currentPage={pending.currentPage}
            totalPages={pending.totalPages}
            totalItems={pending.totalItems}
            setCurrentPage={pending.setCurrentPage}
          />
        </>
      )}
    </PageContent>
  );
}
