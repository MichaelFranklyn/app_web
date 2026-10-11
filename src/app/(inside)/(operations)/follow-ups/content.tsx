"use client";

import { PageContent } from "@/components/PageContent";
import { ToggleGroup } from "@/components/ToggleGroup";
import {
  FOLLOW_UP_COUNTS_QUERY,
  FOLLOW_UP_ORPHAN_COUNT_QUERY,
  FOLLOW_UPS_QUERY,
} from "@/graphql/followUps";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useTableData } from "@/hooks/useTableData";
import { FollowUp, FollowUpSituation } from "@/utils/followUp";
import { useQuery } from "@apollo/client/react";

import { FollowUpsHeader } from "./_components/FollowUpsHeader";
import { FollowUpsTable } from "./_components/FollowUpsTable";
import { OrphanFollowUpsAlert } from "./_components/OrphanFollowUpsAlert";
import {
  FollowUpCountsData,
  FollowUpsContentProps,
  FollowUpsData,
} from "./interface";
import {
  FOLLOW_UP_FIELDS,
  ITEMS_PER_PAGE,
  SituationChoice,
  situationOptions,
} from "./utils";
import { useResponsibleFilter } from "./useResponsibleFilter";

export default function FollowUpsContent({
  initialData,
  canAssign,
}: FollowUpsContentProps) {
  const table = useTableData<FollowUpsData, FollowUp>({
    query: FOLLOW_UPS_QUERY,
    fields: FOLLOW_UP_FIELDS,
    getConnection: (data) => data.follow_ups,
    itemsPerPage: ITEMS_PER_PAGE,
    initialData,
  });

  // Os contadores seguem o filtro de responsável (o gestor olhando a Ana quer
  // os números da Ana), mas não o de recorte: eles dizem o que há para escolher.
  const responsibleUserId = table.inputValues.responsible || null;
  const counts = useQuery<FollowUpCountsData>(FOLLOW_UP_COUNTS_QUERY, {
    variables: { clientId: null, responsibleUserId },
  });
  useQueryErrorToast(counts.error, "Não foi possível carregar os contadores.");

  const byStatus: Partial<Record<FollowUpSituation, number>> =
    Object.fromEntries(
      (counts.data?.clientFollowUpCounts ?? []).map((c) => [
        c.situation,
        c.count,
      ])
    );
  // `clientFollowUpOrphanCount` é @is_admin: o vendedor nem pergunta.
  const orphans = useQuery<{ clientFollowUpOrphanCount: number }>(
    FOLLOW_UP_ORPHAN_COUNT_QUERY,
    { skip: !canAssign }
  );
  const filterFields = useResponsibleFilter(canAssign);
  const situation = (table.inputValues.situation || "OPEN") as SituationChoice;

  return (
    <PageContent>
      <FollowUpsHeader
        onSaved={() => {
          void table.refetch();
          void counts.refetch();
          if (canAssign) void orphans.refetch();
        }}
      />
      {canAssign && (
        <OrphanFollowUpsAlert
          count={orphans.data?.clientFollowUpOrphanCount ?? 0}
          active={table.inputValues.orphaned === "true"}
          onShow={() => table.setFilter("orphaned", "true")}
          onClear={() => table.setFilter("orphaned", undefined)}
        />
      )}
      <ToggleGroup
        aria-label="Quais contatos mostrar"
        data-tour="follow-ups-situations"
        options={situationOptions(byStatus)}
        value={situation}
        onChange={(value) =>
          // "Em aberto" é o padrão do backend: sem filtro na URL.
          table.setFilter("situation", value === "OPEN" ? undefined : value)
        }
      />
      <FollowUpsTable
        followUps={table.displayedData}
        loading={table.loading}
        showResponsible={canAssign}
        filterFields={filterFields}
        inputValues={table.inputValues}
        setFilter={table.setFilter}
        setFilters={table.setFilters}
        currentPage={table.currentPage}
        totalPages={table.totalPages}
        totalItems={table.totalItems}
        setCurrentPage={table.setCurrentPage}
      />
    </PageContent>
  );
}
