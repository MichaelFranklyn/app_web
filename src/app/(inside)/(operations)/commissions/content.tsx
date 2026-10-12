"use client";

import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { BulkActionsBar } from "./_components/BulkActionsBar";
import { CommissionsFilterBar } from "./_components/CommissionsFilterBar";
import { CommissionsHeader } from "./_components/CommissionsHeader";
import { CommissionsList } from "./_components/CommissionsList";
import { ListScopeLine } from "./_components/ListScopeLine";
import { MonthKpis } from "./_components/MonthKpis";
import { MonthToolbar } from "./_components/MonthToolbar";
import { OfficeSplitPanel } from "./_components/OfficeSplitPanel";
import { SellerChargebackPanel } from "./_components/SellerChargebackPanel";
import { useCommissions } from "./useCommissions";

interface Props {
  /** Gestor (owner/admin/su): pode escolher de qual vendedor ver as comissões. */
  canSelectSeller: boolean;
  /** Perfil de vendedor do próprio gestor, quando ele também vende. */
  ownSellerId: string | null;
}

/**
 * A tela de comissões. Aqui só se MONTA a tela: de onde vêm os dados, os
 * filtros, as contas e a seleção está em `useCommissions`, e cada bloco visual
 * é um componente de `_components`.
 */
export default function CommissionsContent(props: Props) {
  const screen = useCommissions(props);
  const { scope, monthNav, tab, query, table, view, selection } = screen;
  const { canManage, lens } = scope;
  const { month } = monthNav;
  const { rows, showSkeleton, handleChanged } = query;

  return (
    <PageContent>
      <CommissionsHeader scope={scope} />

      {query.hasFailed ? (
        <QueryError onRetry={() => query.retry()} />
      ) : (
        <>
          <MonthToolbar
            nav={monthNav}
            tab={tab}
            canManage={canManage}
            sellerId={scope.scopedSellerId}
            sellerName={screen.sellerName}
            isLoading={showSkeleton}
            onChanged={handleChanged}
          />

          <MonthKpis
            totals={view.monthTotals}
            month={month}
            isSellerView={scope.isSellerView}
            isLoading={showSkeleton}
          />

          {/* Detalha os mesmos três cartões acima — é o mês, e não a aba —, e
              por isso fica colado neles, numa linha só. Como três cartões
              empilhados, competia com os KPIs e virava paredão de número. Só
              para gestão: na visão do vendedor a comissão já É a fatia dele. */}
          {/* Fora da ótica do escritório ele sai: a repartição é medida no
              calendário da fábrica (ver `officeSplit`), e ao lado de cartões
              que estão somando o ciclo do vendedor os três números não
              fechariam com nada visível na tela. */}
          {!showSkeleton && canManage && !scope.isSellerView && (
            <OfficeSplitPanel
              rows={screen.visibleRows}
              month={month}
              sellerName={screen.sellerName}
            />
          )}

          {/* Filtro por situação. Abaixo, um cartão por fábrica com o seu mês. */}
          <CommissionsFilterBar
            tab={tab}
            onTabChange={screen.setTab}
            fields={table.filterFields}
            values={table.inputValues}
            onChange={table.setFilters}
            onTextChange={table.setFilter}
          />

          {/* O que a lista abaixo está somando, sempre escrito: são dois
              recortes (mês e situação) que não governam as mesmas coisas, e
              deixar isso implícito era a maior fonte de confusão da tela. */}
          {!showSkeleton && (
            <ListScopeLine
              tab={tab}
              month={month}
              audience={canManage ? lens.audience : undefined}
              scopeLabel={screen.listScopeLabel}
              shown={view.filteredRows.length}
              total={view.scopeTotal}
            />
          )}

          {/* O vendedor vê o mesmo painel sem os botões: a fila não cai em
              fechamento nenhum enquanto não tem mês, e ele precisa saber do
              desconto antes de o dinheiro faltar. */}
          {!showSkeleton && (
            <SellerChargebackPanel
              rows={screen.visibleRows}
              month={month}
              canManage={canManage}
              onChanged={handleChanged}
            />
          )}

          <CommissionsList
            groups={view.groups}
            month={month}
            tab={tab}
            lens={lens}
            sort={table.sort}
            canManage={canManage}
            showSeller={scope.isOfficeScope}
            selection={selection}
            isLoading={showSkeleton}
            isFiltered={screen.isFiltered}
            hasAnyCommission={
              rows.length > 0 || Boolean(query.latestReceiveDate)
            }
            onChanged={handleChanged}
          />

          {/* Uma barra para a tela inteira: a seleção é única (ver
              `useScopedSelection`) e ela aparece fixa na base da janela. */}
          {canManage && (
            <BulkActionsBar
              selectedIds={selection.ids}
              allRows={rows}
              month={month}
              scopeLabel={selection.scopeLabel}
              receivableIds={selection.receivableIds}
              onClear={selection.clear}
              onChanged={handleChanged}
            />
          )}
        </>
      )}
    </PageContent>
  );
}
