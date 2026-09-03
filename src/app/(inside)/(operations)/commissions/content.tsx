"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { Grid } from "@/components/Grid";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Input, SelectOption } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { getTodayIso } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useScopedSelection } from "@/hooks/useScopedSelection";
import { useQuery } from "@apollo/client/react";
import { CalendarDays, ChevronLeft, ChevronRight, Coins } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BulkActionsBar } from "./_components/BulkActionsBar";
import { CommissionsPdfButton } from "./_components/CommissionsPdfButton";
import { CommissionTabsBar } from "./_components/CommissionTabsBar";
import { FactoryCommissionGroup } from "./_components/FactoryCommissionGroup";
import { ListScopeLine } from "./_components/ListScopeLine";
import { OfficeSplitPanel } from "./_components/OfficeSplitPanel";
import { SellerChargebackPanel } from "./_components/SellerChargebackPanel";
import { SettlePeriodModal } from "./_components/SettlePeriodModal";
import { COMMISSIONS_QUERY, COMMISSIONS_SELLERS_QUERY } from "./gql";
import {
  FILTERS_HELP,
  ignoresMonth,
  KPI_PENDING_HELP,
  KPI_RECEIVABLE_HELP,
  KPI_RECEIVED_HELP,
  MONTH_HELP,
  PDF_HELP,
  SELLER_SELECT_HELP,
} from "./help";
import { CommissionsResponse, CommissionsSellersResponse } from "./interface";
import { useCommissionsTable } from "./useCommissionsTable";
import {
  addMonths,
  CommissionTab,
  monthEndIso,
  monthStartIso,
  filterByMonth,
  filterByTab,
  groupByFactory,
  monthLabel,
  summarizeMonth,
  yearMonthFromIso,
} from "./utils";

interface Props {
  /** Gestor (owner/admin/su): pode escolher de qual vendedor ver as comissões. */
  canSelectSeller: boolean;
  /** Perfil de vendedor do próprio gestor, quando ele também vende. */
  ownSellerId: string | null;
}

// Catálogo pequeno carregado por inteiro: `useCompleteList` rebusca pelo
// total se um dia passar da primeira página, em vez de truncar calado.
const EMPTY_INPUT = {};
const getSellers = (d: CommissionsSellersResponse) => d.commissions_sellers;

export default function CommissionsContent({
  canSelectSeller,
  ownSellerId,
}: Props) {
  // Vendedor só VISUALIZA quanto vai ganhar; conferir contra a planilha e marcar
  // repasse ("bater valores") é tarefa de gestão (gestor = quem pode escolher vendedor).
  const canManage = canSelectSeller;

  // ── Seletor de vendedor (só gestor) ────────────────────────────────────────
  const sellersQuery = useCompleteList<CommissionsSellersResponse>(
    COMMISSIONS_SELLERS_QUERY,
    EMPTY_INPUT,
    getSellers,
    { skip: !canSelectSeller }
  );
  const sellers = useMemo(
    () => sellersQuery.data?.commissions_sellers.edges.map((e) => e.node) ?? [],
    [sellersQuery.data]
  );

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Default: o próprio perfil quando o gestor também vende, senão o primeiro.
  useEffect(() => {
    if (canSelectSeller && !selectedSellerId && sellers.length > 0) {
      const own = ownSellerId && sellers.find((s) => s.id === ownSellerId);
      setSelectedSellerId(own ? own.id : sellers[0].id);
    }
  }, [canSelectSeller, selectedSellerId, sellers, ownSellerId]);

  // Gestor sem vendedor escolhido ainda não busca (evita query sem escopo).
  const dataSkip = canSelectSeller && !selectedSellerId;

  const [tab, setTab] = useState<CommissionTab>("receivable");

  // ── Navegador de mês global (pela data em que a comissão cai) ───────────────
  // Abre no mês corrente e, quando a resposta traz uma data mais recente, salta
  // para lá (é onde está o movimento). Depois disso respeita a navegação — ao
  // trocar de vendedor, mantém o mês para comparar "agosto de um" vs "de outro".
  const [month, setMonth] = useState(() => yearMonthFromIso(getTodayIso()));
  const [monthPinned, setMonthPinned] = useState(false);

  // O período recorta no SERVIDOR: a tela mostra um mês por vez, e baixar a
  // carteira inteira para exibir cinquenta linhas piorava a cada mês de
  // histórico. `includeOverdue` é o pedido da aba que junta todos os
  // vencimentos — só ela precisa das linhas de fora do mês.
  const { data, loading, error, refetch } = useQuery<CommissionsResponse>(
    COMMISSIONS_QUERY,
    {
      variables: {
        sellerId: selectedSellerId,
        from: monthStartIso(month),
        to: monthEndIso(month),
        includeOverdue: ignoresMonth(tab),
      },
      fetchPolicy: "cache-and-network",
      skip: dataSkip,
    }
  );

  const rows = useMemo(() => data?.commissions?.rows ?? [], [data]);
  const summary = data?.commissions;

  // Filtro e ordenação valem para a tela toda: os KPIs, os cartões das fábricas
  // e o painel de estorno leem as MESMAS linhas. Um filtro que valesse só dentro
  // de um cartão faria o total lá em cima contradizer a tabela logo abaixo dele.
  const table = useCommissionsTable(rows, canManage);
  const visibleRows = table.displayedData;
  const isFiltered = table.totalItems < table.totalUnfiltered;

  // O salto inicial para o mês com movimento: a data mais recente vem do
  // servidor (medida antes do recorte), então descobri-la não custa mais baixar
  // o histórico inteiro. Uma vez saltado, quem manda é a navegação.
  const latestReceiveDate = summary?.latestReceiveDate ?? null;
  useEffect(() => {
    if (!monthPinned && latestReceiveDate) {
      setMonth(yearMonthFromIso(latestReceiveDate));
      setMonthPinned(true);
    }
  }, [monthPinned, latestReceiveDate]);

  const monthTotals = useMemo(
    () => summarizeMonth(visibleRows, month),
    [visibleRows, month]
  );
  const isCurrentMonth = useMemo(() => {
    const now = yearMonthFromIso(getTodayIso());
    return now.year === month.year && now.month === month.month;
  }, [month]);

  // Os dois filtros da tela — mês e situação — valem para TUDO o que vem
  // abaixo, inclusive os cartões das fábricas. Antes cada fábrica tinha o seu
  // próprio seletor de mês e o de cima só mexia nos totais: dois lugares para
  // escolher a mesma coisa, mostrando meses diferentes na mesma tela.
  const filteredRows = useMemo(
    () => filterByTab(filterByMonth(visibleRows, month, tab), tab),
    [visibleRows, tab, month]
  );

  // Quantas parcelas o mês e a situação deixam passar ANTES do painel de
  // filtros: é com este número que a frase de escopo compara o que sobrou.
  // `totalUnfiltered` não serve — ele conta a resposta inteira do servidor, que
  // inclui outros meses (estorno do vendedor, boleto travado).
  const scopeTotal = useMemo(
    () => filterByTab(filterByMonth(rows, month, tab), tab).length,
    [rows, tab, month]
  );

  // Agrupado por fábrica trabalhada — é assim que a fábrica manda a planilha.
  const groups = useMemo(() => groupByFactory(filteredRows), [filteredRows]);

  // A seleção mora aqui, e não em cada cartão, para que exista UMA por vez: a
  // barra de atalhos é uma só, e um lote que misturasse fábricas seria marcado
  // com a data de repasse errada.
  const selection = useScopedSelection();
  const { clear: clearSelection } = selection;

  // Trocar de mês, de situação ou de vendedor troca as linhas debaixo do lote —
  // manter a seleção marcaria parcelas que saíram da tela.
  useEffect(() => {
    clearSelection();
  }, [month, tab, selectedSellerId, clearSelection]);

  const selectedRows = useMemo(() => {
    if (selection.count === 0) return [];
    const ids = new Set(selection.ids);
    return rows.filter((row) => ids.has(row.installmentId));
  }, [rows, selection.ids, selection.count]);

  const selectionScopeLabel = useMemo(() => {
    const group = groups.find((g) => g.factoryId === selection.scopeId);
    return group ? `${group.name} · ${monthLabel(month)}` : monthLabel(month);
  }, [groups, selection.scopeId, month]);

  const handleChanged = () => refetch();

  const sellerOptions: SelectOption[] = sellers.map((s) => ({
    value: s.id,
    label: s.name,
  }));
  const sellerValue =
    sellerOptions.find((o) => o.value === selectedSellerId) ?? null;

  // Nome que assina o PDF: o do seletor (gestor) ou o das próprias linhas
  // (vendedor, que não escolhe ninguém).
  const sellerName = sellerValue?.label ?? rows[0]?.seller?.name ?? null;

  const showSkeleton = loading && !summary;

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Comissões</PanelHeader.Title>
            <PanelHeader.Description>
              {canManage
                ? "O que cada vendedor tem para receber das fábricas. Escolha o vendedor e o mês para ver quanto ele vai ganhar."
                : "Quanto você tem para ganhar de comissão, por fábrica e por mês."}
            </PanelHeader.Description>
            {canSelectSeller && (
              <PanelHeader.Actions className="mt-6">
                <div className="flex items-center gap-4">
                  <div className="desktop:w-[220px] w-full">
                    <Input.Select
                      size="sm"
                      options={sellerOptions}
                      value={sellerValue}
                      variant="single"
                      disabledClear
                      placeholder="Selecionar vendedor"
                      onChange={(val: SelectOption | SelectOption[] | null) => {
                        const opt = Array.isArray(val) ? val[0] : val;
                        if (opt) setSelectedSellerId(opt.value);
                      }}
                    />
                  </div>
                  <HelpTooltip
                    label="Sobre o seletor de vendedor"
                    content={SELLER_SELECT_HELP}
                  />
                </div>
              </PanelHeader.Actions>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {error && !summary ? (
        <QueryError onRetry={() => refetch()} />
      ) : (
        <>
          {/* Navegador de mês: controla os totais logo abaixo e o PDF do mês. */}
          <div className="flex flex-wrap items-center justify-between gap-16">
            <div className="flex items-center gap-4">
              <Title variant="heading-sm">
                {tab === "overdue"
                  ? "Boletos travados, de todos os vencimentos"
                  : `Resumo de ${monthLabel(month)}`}
              </Title>
              <HelpTooltip
                label="Como o mês funciona nesta tela"
                position="right"
                content={MONTH_HELP}
              />
            </div>
            <div className="flex flex-wrap items-center gap-8">
              {canManage && (
                <SettlePeriodModal
                  sellerId={selectedSellerId}
                  sellerName={sellerName}
                  onSettled={handleChanged}
                />
              )}
              <div className="flex items-center gap-2">
                <CommissionsPdfButton
                  sellerId={selectedSellerId}
                  month={month}
                  sellerName={sellerName}
                  disabled={showSkeleton}
                />
                <HelpTooltip label="O que sai no PDF" content={PDF_HELP} />
              </div>
              <div className="flex items-center gap-4">
                <Button.Root
                  appearance="outline"
                  color="neutral"
                  size="sm"
                  isIconOnly
                  label="Mês anterior"
                  onClick={() => {
                    setMonthPinned(true);
                    setMonth((m) => addMonths(m, -1));
                  }}
                >
                  <Button.Icon icon={ChevronLeft} />
                </Button.Root>
                <Button.Root
                  appearance={isCurrentMonth ? "tinted" : "ghost"}
                  color={isCurrentMonth ? "amber" : "neutral"}
                  size="sm"
                  noUppercase
                  onClick={() => {
                    setMonthPinned(true);
                    setMonth(yearMonthFromIso(getTodayIso()));
                  }}
                >
                  <Button.Icon icon={CalendarDays} />
                  <Button.Title>{monthLabel(month)}</Button.Title>
                </Button.Root>
                <Button.Root
                  appearance="outline"
                  color="neutral"
                  size="sm"
                  isIconOnly
                  label="Próximo mês"
                  onClick={() => {
                    setMonthPinned(true);
                    setMonth((m) => addMonths(m, 1));
                  }}
                >
                  <Button.Icon icon={ChevronRight} />
                </Button.Root>
              </div>
            </div>
          </div>

          <Grid.Root cols={{ base: 1, tablet: 3 }} gap={20}>
            {!showSkeleton ? (
              <>
                <Grid.Item>
                  <Card.Kpi>
                    <Card.Kpi.Label className="inline-flex items-center gap-2">
                      A receber em {monthLabel(month)}
                      <HelpTooltip
                        label="Sobre o valor a receber no mês"
                        content={KPI_RECEIVABLE_HELP}
                      />
                    </Card.Kpi.Label>
                    <Card.Kpi.Value status="atencao">
                      {formatMoney(monthTotals.receivable)}
                    </Card.Kpi.Value>
                    <Card.Kpi.Delta>
                      {monthTotals.chargeback < 0
                        ? `${monthTotals.countReceivable} parcela(s) · já descontado ${formatMoney(Math.abs(monthTotals.chargeback))} de estorno`
                        : `${monthTotals.countReceivable} parcela(s) a receber`}
                    </Card.Kpi.Delta>
                  </Card.Kpi>
                </Grid.Item>
                <Grid.Item>
                  <Card.Kpi>
                    <Card.Kpi.Label className="inline-flex items-center gap-2">
                      Previsto em {monthLabel(month)}
                      <HelpTooltip
                        label="Sobre o valor previsto no mês"
                        content={KPI_PENDING_HELP}
                      />
                    </Card.Kpi.Label>
                    <Card.Kpi.Value>
                      {formatMoney(monthTotals.pending)}
                    </Card.Kpi.Value>
                    <Card.Kpi.Delta>
                      Depende de faturamento/pagamento
                    </Card.Kpi.Delta>
                  </Card.Kpi>
                </Grid.Item>
                <Grid.Item>
                  <Card.Kpi>
                    <Card.Kpi.Label className="inline-flex items-center gap-2">
                      Recebido em {monthLabel(month)}
                      <HelpTooltip
                        label="Sobre o valor recebido no mês"
                        content={KPI_RECEIVED_HELP}
                      />
                    </Card.Kpi.Label>
                    <Card.Kpi.Value status="ok">
                      {formatMoney(monthTotals.received)}
                    </Card.Kpi.Value>
                    <Card.Kpi.Delta>Já repassado pelas fábricas</Card.Kpi.Delta>
                  </Card.Kpi>
                </Grid.Item>
              </>
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <Grid.Item key={i}>
                  <Card.Kpi>
                    <Loading.Skeleton className="h-[12px] w-24" />
                    <Loading.Skeleton className="mt-8 h-[28px] w-32" />
                    <Loading.Skeleton className="mt-8 h-[10px] w-28" />
                  </Card.Kpi>
                </Grid.Item>
              ))
            )}
          </Grid.Root>

          {/* Detalha os mesmos três cartões acima — é o mês, e não a aba —, e
              por isso fica colado neles, numa linha só. Como três cartões
              empilhados, competia com os KPIs e virava paredão de número. Só
              para gestão: na visão do vendedor a comissão já É a fatia dele. */}
          {!showSkeleton && canManage && (
            <OfficeSplitPanel
              rows={visibleRows}
              month={month}
              sellerName={sellerName}
            />
          )}

          {/* Filtro por situação. Abaixo, um cartão por fábrica com o seu mês. */}
          <div className="flex flex-wrap items-center justify-between gap-8">
            <CommissionTabsBar tab={tab} onChange={setTab} />
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2">
                <Filters
                  fields={table.filterFields}
                  values={table.inputValues}
                  onChange={table.setFilters}
                  onTextChange={table.setFilter}
                />
                <HelpTooltip
                  label="Até onde vão os filtros"
                  content={FILTERS_HELP}
                />
              </div>
            </div>
          </div>

          {/* O que a lista abaixo está somando, sempre escrito: são dois
              recortes (mês e situação) que não governam as mesmas coisas, e
              deixar isso implícito era a maior fonte de confusão da tela. */}
          {!showSkeleton && (
            <ListScopeLine
              tab={tab}
              month={month}
              shown={filteredRows.length}
              total={scopeTotal}
            />
          )}

          {/* O vendedor vê o mesmo painel sem os botões: a fila não cai em
              fechamento nenhum enquanto não tem mês, e ele precisa saber do
              desconto antes de o dinheiro faltar. */}
          {!showSkeleton && (
            <SellerChargebackPanel
              rows={visibleRows}
              month={month}
              canManage={canManage}
              onChanged={handleChanged}
            />
          )}

          {showSkeleton ? (
            <Table.Root>
              <Table.Table>
                <Table.Body>
                  <Table.Skeleton columns={8} rows={6} />
                </Table.Body>
              </Table.Table>
            </Table.Root>
          ) : groups.length === 0 ? (
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
                      : rows.length > 0
                        ? "Use as setas ao lado do mês, lá em cima, para conferir outro mês, ou troque a situação nos botões acima."
                        : "As comissões aparecem quando os pedidos são faturados. Fature um pedido para gerar as parcelas e acompanhar o que há a receber."}
                  </EmptyState.Description>
                </EmptyState.Root>
              </div>
            </Table.Root>
          ) : (
            <div className="flex flex-col gap-16">
              {groups.map((group, i) => (
                <FactoryCommissionGroup
                  key={group.factoryId}
                  group={group}
                  month={month}
                  tab={tab}
                  defaultOpen={i === 0}
                  canManage={canManage}
                  sort={table.sort}
                  selectedIds={
                    canManage
                      ? selection.selectedIn(group.factoryId)
                      : undefined
                  }
                  onToggleRow={
                    canManage
                      ? (id) => selection.toggle(group.factoryId, id)
                      : undefined
                  }
                  onToggleAll={
                    canManage
                      ? (ids) => selection.toggleAll(group.factoryId, ids)
                      : undefined
                  }
                  onChanged={handleChanged}
                />
              ))}
            </div>
          )}

          {/* Uma barra para a tela inteira: a seleção é única (ver
              `useScopedSelection`) e ela aparece fixa na base da janela. */}
          {canManage && (
            <BulkActionsBar
              selectedIds={selection.ids}
              allRows={rows}
              month={month}
              scopeLabel={selectionScopeLabel}
              receivableIds={selectedRows
                .filter((row) => row.isReceivable)
                .map((row) => row.installmentId)}
              onClear={clearSelection}
              onChanged={handleChanged}
            />
          )}
        </>
      )}
    </PageContent>
  );
}
