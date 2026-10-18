"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PageContent } from "@/components/PageContent";
import { SelectionBar } from "@/components/SelectionBar";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";
import { useRedirectTransition } from "@/hooks/useRedirectTransition";
import { cn } from "@/lib/utils";
import { CalendarCheck } from "lucide-react";
import { useState } from "react";

import { CityFilter } from "./_components/CityFilter";
import { PlanViewTabs, PlanView } from "./_components/PlanViewTabs";
import { PlanWeekHeader } from "./_components/PlanWeekHeader";
import { PriorityList } from "./_components/PriorityList";
import { PriorityToolbar } from "./_components/PriorityToolbar";
import { UnavailableClients } from "./_components/UnavailableClients";
import { WeekPanel } from "./_components/WeekPanel";
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
  const [view, setView] = useState<PlanView>("clients");
  // Fora do desktop, só a metade da aba escolhida aparece.
  const onlyOn = (side: PlanView) => view !== side && "hidden desktop:flex";

  return (
    <PageContent>
      <PlanWeekHeader sellerId={page.sellerId} />

      <PlanViewTabs view={view} onViewChange={setView} chosen={total} />

      <div className="desktop:grid-cols-[minmax(0,1fr)_380px] grid grid-cols-1 items-start gap-16">
        <div className={cn("flex min-w-0 flex-col gap-12", onlyOn("clients"))}>
          <PriorityToolbar
            scope={page.scope}
            onScopeChange={page.setScope}
            search={page.search}
            onSearchChange={page.setSearch}
            sellers={page.canSelectSeller ? page.sellers : undefined}
            sellerId={page.sellerId}
            onSelectSeller={(id) => leave.guard(() => page.setSellerId(id))}
          />
          <CityFilter
            groups={page.groups}
            city={page.city}
            onCityChange={page.setCity}
          />
          <PriorityList
            loading={page.loading}
            hasError={Boolean(page.error)}
            onRetry={() => void page.refetch()}
            groups={result ? page.shownGroups : []}
            search={page.search}
            selection={page.selection}
            onToggle={page.toggle}
            onToggleMany={page.toggleMany}
            onContactTypeChange={page.setContactType}
            onWeekdayChange={page.setWeekday}
          />
          {result && <UnavailableClients clients={result.unavailable} />}
        </div>

        <div
          className={cn(
            "desktop:sticky desktop:top-16 flex flex-col",
            onlyOn("week")
          )}
        >
          <WeekPanel
            selection={page.selection}
            clients={result?.clients ?? []}
            onRemove={page.toggle}
            onOrganize={() => setSetupOpen(true)}
            sellerId={page.sellerId}
            scheduleSellerId={page.effectiveSellerId}
            onScheduled={() => void page.refetch()}
          />
        </div>
      </div>

      {/* Respiro para a barra fixa não cobrir o último cliente. */}
      <div className="desktop:hidden h-[72px]" aria-hidden />

      <SelectionBar
        count={total}
        noun={{ singular: "cliente escolhido", plural: "clientes escolhidos" }}
        scopeLabel={selectionPhrase(page.selection)}
        onClear={page.clearSelection}
        // No desktop (e na aba Sua semana) o painel já tem estas ações.
        className={cn("desktop:hidden", view === "week" && "hidden")}
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
