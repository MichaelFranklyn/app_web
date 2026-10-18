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
import { PlanSteps } from "./_components/PlanSteps";
import { PriorityToolbar } from "./_components/PriorityToolbar";
import { RegionGroupCard } from "./_components/RegionGroupCard";
import { UnavailableClients } from "./_components/UnavailableClients";
import { WeekSetupModal } from "./_components/WeekSetupModal";
import { usePlanWeek } from "./usePlanWeek";
import { selectionCounts, selectionPhrase } from "./utils";

export default function PlanWeekContent() {
  const page = usePlanWeek();
  const [setupOpen, setSetupOpen] = useState(false);
  const { redirect, isRedirecting } = useRedirectTransition();
  const { total } = selectionCounts(page.selection);
  // Escolha sem gravar se perde ao sair: pergunta antes.
  const leave = useLeaveGuard(total > 0 && !isRedirecting);

  // Volta para a agenda NA semana que acabou de ser organizada.
  const goToWeek = (weekStart: string) => {
    const params = new URLSearchParams({
      ...(page.sellerId ? { sellerId: page.sellerId } : {}),
      week: weekStart,
    });
    page.clearSelection();
    redirect(`/routines?${params.toString()}`);
  };

  const result = page.result;

  return (
    <PageContent>
      <PlanWeekHeader sellerId={page.sellerId} />

      {result && (
        <PlanSteps
          chosen={total}
          chosenPhrase={selectionPhrase(page.selection)}
          onOrganize={() => setSetupOpen(true)}
          onLetSystemChoose={() => setSetupOpen(true)}
        />
      )}

      <PriorityToolbar
        scope={page.scope}
        onScopeChange={page.setScope}
        search={page.search}
        onSearchChange={page.setSearch}
        sellers={page.canSelectSeller ? page.sellers : undefined}
        sellerId={page.sellerId}
        onSelectSeller={(id) => leave.guard(() => page.setSellerId(id))}
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
              : "Não há clientes disponíveis agora. Veja em Toda a carteira ou na lista de quem está fora."}
          </EmptyState.Description>
        </EmptyState.Root>
      ) : (
        <div className="flex flex-col gap-12">
          {page.groups.map((group, index) => (
            <RegionGroupCard
              key={group.key}
              group={group}
              selection={page.selection}
              defaultOpen={index < 3 || group.topCount > 0}
              onToggle={page.toggle}
              onToggleMany={page.toggleMany}
              onContactTypeChange={page.setContactType}
              onWeekdayChange={page.setWeekday}
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
          onClick={() => setSetupOpen(true)}
        >
          <Button.Icon icon={CalendarCheck} />
          <Button.Title>Organizar a semana</Button.Title>
        </Button.Root>
      </SelectionBar>

      {result && (
        <WeekSetupModal
          open={setupOpen}
          onOpenChange={setSetupOpen}
          sellerId={page.sellerId}
          initialWeekStart={page.weekStart}
          selection={page.selection}
          clients={result.clients}
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
