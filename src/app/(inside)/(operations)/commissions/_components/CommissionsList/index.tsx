"use client";

import { EmptyState } from "@/components/EmptyState";
import { Table, TableSort } from "@/components/Table";
import { Coins } from "lucide-react";

import { ignoresMonth } from "../../help";
import {
  CommissionFactoryRowsData,
  CommissionMonthInput,
} from "../../interface";
import { type CommissionsSelection } from "../../useCommissionsSelection";
import {
  type CommissionLens,
  type CommissionTab,
  type FactoryGroup,
  monthLabel,
  type YearMonth,
} from "../../utils";
import { FactoryCommissionGroup } from "../FactoryCommissionGroup";

interface Props {
  /** Um resumo por fábrica, somado no servidor sobre o recorte completo. */
  groups: FactoryGroup[];
  /** O recorte da tela: cada cartão pede as suas linhas com ele. */
  input: CommissionMonthInput;
  /** A primeira página do primeiro cartão, que já veio junto do resumo. */
  firstCard?: CommissionFactoryRowsData;
  month: YearMonth;
  tab: CommissionTab;
  lens: CommissionLens;
  sort: TableSort;
  canManage: boolean;
  /** A tela soma a empresa inteira: a tabela ganha a coluna "Vendedor". */
  showSeller: boolean;
  selection: CommissionsSelection;
  isLoading: boolean;
  /** O painel de filtros tirou linhas da tela. */
  isFiltered: boolean;
  /** Existe comissão em algum mês (mesmo que não neste). */
  hasAnyCommission: boolean;
  onChanged: () => void;
}

/** Um cartão por fábrica com o seu mês — ou o esqueleto, ou o vazio. */
export function CommissionsList({
  groups,
  input,
  firstCard,
  month,
  tab,
  lens,
  sort,
  canManage,
  showSeller,
  selection,
  isLoading,
  isFiltered,
  hasAnyCommission,
  onChanged,
}: Props) {
  if (isLoading) {
    return (
      <Table.Root>
        <Table.Table>
          <Table.Body>
            <Table.Skeleton columns={8} rows={6} />
          </Table.Body>
        </Table.Table>
      </Table.Root>
    );
  }

  if (groups.length === 0) {
    return (
      <Table.Root>
        <div className="p-24">
          <EmptyState.Root>
            <EmptyState.Icon>
              <Coins size={32} />
            </EmptyState.Icon>
            {/* Na aba que ignora o mês, nomear o mês aqui seria mentir
                sobre o que foi procurado. */}
            <EmptyState.Title>
              {ignoresMonth(tab)
                ? "Nenhum boleto em atraso"
                : `Nenhuma comissão em ${monthLabel(month)}`}
            </EmptyState.Title>
            <EmptyState.Description>
              {isFiltered
                ? "Nenhuma parcela passou pelos filtros. Ajuste-os no botão “Filtros”, ao lado das situações."
                : // "Há comissão em algum mês": a data mais recente diz,
                  // e não as linhas — elas são só as do mês aberto.
                  hasAnyCommission
                  ? "Use as setas ao lado do mês, lá em cima, para conferir outro mês, ou troque a situação nos botões acima."
                  : "As comissões aparecem quando os pedidos são faturados. Fature um pedido para gerar as parcelas e acompanhar o que há a receber."}
            </EmptyState.Description>
          </EmptyState.Root>
        </div>
      </Table.Root>
    );
  }

  return (
    <div className="flex flex-col gap-16">
      {groups.map((group, i) => (
        <FactoryCommissionGroup
          key={group.factoryId}
          group={group}
          input={input}
          firstPage={i === 0 ? firstCard : undefined}
          month={month}
          tab={tab}
          defaultOpen={i === 0}
          canManage={canManage}
          lens={lens}
          showSeller={showSeller}
          sort={sort}
          selectedIds={
            canManage ? selection.selectedIn(group.factoryId) : undefined
          }
          onToggleRow={
            canManage
              ? (id) => selection.toggle(group.factoryId, id)
              : undefined
          }
          onTogglePage={
            canManage
              ? (ids) => selection.togglePage(group.factoryId, ids)
              : undefined
          }
          onRowsLoaded={selection.register}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}
