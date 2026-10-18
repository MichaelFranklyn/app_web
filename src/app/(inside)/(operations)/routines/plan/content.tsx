"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { SelectionBar } from "@/components/SelectionBar";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";
import { useRedirectTransition } from "@/hooks/useRedirectTransition";
import { CalendarCheck, Users } from "lucide-react";
import { useState } from "react";

import { PlanWeekHeader } from "./_components/PlanWeekHeader";
import { PlanWeekPreviewModal } from "./_components/PlanWeekPreviewModal";
import { PriorityToolbar } from "./_components/PriorityToolbar";
import { RegionGroupCard } from "./_components/RegionGroupCard";
import { UnavailableClients } from "./_components/UnavailableClients";
import { usePlanWeek } from "./usePlanWeek";
import { selectionCounts, selectionPhrase } from "./utils";

export default function PlanWeekContent() {
  const page = usePlanWeek();
  const [previewOpen, setPreviewOpen] = useState(false);
  const { redirect, isRedirecting } = useRedirectTransition();
  const { total } = selectionCounts(page.selection);
  // Escolha sem gravar se perde ao sair: pergunta antes.
  const leave = useLeaveGuard(total > 0 && !isRedirecting);

  const goToWeek = () => {
    const params = new URLSearchParams({
      ...(page.sellerId ? { sellerId: page.sellerId } : {}),
      week: page.weekStart,
    });
    page.clearSelection();
    redirect(`/routines?${params.toString()}`);
  };

  const result = page.result;

  return (
    <PageContent>
      <PlanWeekHeader
        weekStart={page.weekStart}
        sellers={page.canSelectSeller ? page.sellers : undefined}
        sellerId={page.sellerId}
        onSelectSeller={(id) => leave.guard(() => page.setSellerId(id))}
        onSelectWeek={(iso) => leave.guard(() => page.setWeekStart(iso))}
      />

      <PriorityToolbar
        scope={page.scope}
        onScopeChange={page.setScope}
        search={page.search}
        onSearchChange={page.setSearch}
      />

      {page.loading ? (
        <div className="flex flex-col gap-12" aria-busy="true">
          {[0, 1, 2].map((index) => (
            <Loading.Skeleton key={index} className="h-[96px] w-full" />
          ))}
        </div>
      ) : page.error ? (
        <QueryError onRetry={() => page.refetch()} />
      ) : !result || page.groups.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Icon>
            <Users />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhum cliente para mostrar</EmptyState.Title>
          <EmptyState.Description>
            {page.search
              ? "Nenhum cliente com esse nome, bairro ou cidade."
              : "Não há clientes disponíveis nesta semana. Veja em Toda a carteira ou na lista de quem está fora."}
          </EmptyState.Description>
        </EmptyState.Root>
      ) : (
        <div className="flex flex-col gap-12">
          {page.groups.map((group, index) => (
            <RegionGroupCard
              key={`${page.weekStart}-${group.key}`}
              group={group}
              selection={page.selection}
              openDates={result.openDates}
              defaultOpen={index < 3 || group.topCount > 0}
              onToggle={page.toggle}
              onToggleMany={page.toggleMany}
              onContactTypeChange={page.setContactType}
              onDateChange={page.setDate}
            />
          ))}
        </div>
      )}

      {result && <UnavailableClients clients={result.unavailable} />}

      {/* Respiro para a barra fixa não cobrir o último cliente. */}
      <div className="h-[72px]" aria-hidden />

      <SelectionBar
        count={total}
        noun={{ singular: "cliente escolhido", plural: "clientes escolhidos" }}
        scopeLabel={selectionPhrase(page.selection)}
        onClear={page.clearSelection}
      >
        <Button.Root
          appearance="solid"
          color="amber"
          size="sm"
          noUppercase
          onClick={() => setPreviewOpen(true)}
        >
          <Button.Icon icon={CalendarCheck} />
          <Button.Title>Ver como fica a semana</Button.Title>
        </Button.Root>
      </SelectionBar>

      {result && (
        <PlanWeekPreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          sellerId={page.sellerId}
          weekStart={page.weekStart}
          selection={page.selection}
          clients={result.clients}
          openDates={result.openDates}
          workDates={result.workDates}
          onPlanned={goToWeek}
          isRedirecting={isRedirecting}
        />
      )}

      <ConfirmModal
        open={leave.isAsking}
        onOpenChange={(open) => !open && leave.stay()}
        title="Sair sem montar a semana?"
        description={`Você escolheu ${selectionPhrase(page.selection)} e ainda não confirmou. Se sair, a escolha se perde.`}
        confirmLabel="Sair mesmo assim"
        cancelLabel="Continuar escolhendo"
        confirmColor="red"
        onConfirm={async () => leave.confirmLeave()}
      />
    </PageContent>
  );
}
