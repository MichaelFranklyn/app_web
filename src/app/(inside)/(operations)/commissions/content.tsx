"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { Input, SelectOption } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { getTodayIso } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { CalendarDays, ChevronLeft, ChevronRight, Coins } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CommissionsPdfButton } from "./_components/CommissionsPdfButton";
import { FactoryCommissionGroup } from "./_components/FactoryCommissionGroup";
import { COMMISSIONS_QUERY, COMMISSIONS_SELLERS_QUERY } from "./gql";
import { CommissionsResponse, CommissionsSellersResponse } from "./interface";
import {
  addMonths,
  COMMISSION_TABS,
  CommissionTab,
  groupByFactory,
  isInMonth,
  latestMonthWithData,
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

export default function CommissionsContent({
  canSelectSeller,
  ownSellerId,
}: Props) {
  // Vendedor só VISUALIZA quanto vai ganhar; conferir contra a planilha e marcar
  // repasse ("bater valores") é tarefa de gestão (gestor = quem pode escolher vendedor).
  const canManage = canSelectSeller;

  // ── Seletor de vendedor (só gestor) ────────────────────────────────────────
  const sellersQuery = useQuery<CommissionsSellersResponse>(
    COMMISSIONS_SELLERS_QUERY,
    { variables: { input: { first: 200 } }, skip: !canSelectSeller }
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

  const { data, loading, error, refetch } = useQuery<CommissionsResponse>(
    COMMISSIONS_QUERY,
    {
      variables: { sellerId: selectedSellerId },
      fetchPolicy: "cache-and-network",
      skip: dataSkip,
    }
  );

  const [tab, setTab] = useState<CommissionTab>("receivable");

  const rows = useMemo(() => data?.commissions?.rows ?? [], [data]);
  const summary = data?.commissions;

  // ── Navegador de mês global (pela data em que a comissão cai) ───────────────
  // Inicializa no mês da comissão mais recente e depois respeita a navegação —
  // ao trocar de vendedor, mantém o mês para comparar "agosto de um" vs "de outro".
  const [month, setMonth] = useState(() => yearMonthFromIso(getTodayIso()));
  const [monthPinned, setMonthPinned] = useState(false);
  useEffect(() => {
    if (!monthPinned && rows.length > 0) {
      setMonth(latestMonthWithData(rows) ?? yearMonthFromIso(getTodayIso()));
      setMonthPinned(true);
    }
  }, [monthPinned, rows]);

  const monthTotals = useMemo(() => summarizeMonth(rows, month), [rows, month]);
  const isCurrentMonth = useMemo(() => {
    const now = yearMonthFromIso(getTodayIso());
    return now.year === month.year && now.month === month.month;
  }, [month]);

  // Os dois filtros da tela — mês e situação — valem para TUDO o que vem
  // abaixo, inclusive os cartões das fábricas. Antes cada fábrica tinha o seu
  // próprio seletor de mês e o de cima só mexia nos totais: dois lugares para
  // escolher a mesma coisa, mostrando meses diferentes na mesma tela.
  const filteredRows = useMemo(() => {
    const inMonth = rows.filter((row) => isInMonth(row.receiveDate, month));
    if (tab === "all") return inMonth;
    return inMonth.filter((row) => row.status === tab);
  }, [rows, tab, month]);

  // Agrupado por fábrica trabalhada — é assim que a fábrica manda a planilha.
  const groups = useMemo(() => groupByFactory(filteredRows), [filteredRows]);

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
            <Title variant="heading-sm">Resumo de {monthLabel(month)}</Title>
            <div className="flex flex-wrap items-center gap-8">
              <CommissionsPdfButton
                rows={rows}
                month={month}
                sellerName={sellerName}
                disabled={showSkeleton}
              />
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
                    <Card.Kpi.Label>
                      A receber em {monthLabel(month)}
                    </Card.Kpi.Label>
                    <Card.Kpi.Value status="atencao">
                      {formatMoney(monthTotals.receivable)}
                    </Card.Kpi.Value>
                    <Card.Kpi.Delta>
                      {monthTotals.countReceivable} parcela(s) a receber
                    </Card.Kpi.Delta>
                  </Card.Kpi>
                </Grid.Item>
                <Grid.Item>
                  <Card.Kpi>
                    <Card.Kpi.Label>
                      Previsto em {monthLabel(month)}
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
                    <Card.Kpi.Label>
                      Recebido em {monthLabel(month)}
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

          {/* Filtro por situação. Abaixo, um cartão por fábrica com o seu mês. */}
          <div className="flex flex-wrap items-center gap-4">
            {COMMISSION_TABS.map((item) => (
              <Button.Root
                key={item.id}
                appearance={tab === item.id ? "solid" : "ghost"}
                color={tab === item.id ? "amber" : "neutral"}
                size="sm"
                noUppercase
                onClick={() => setTab(item.id)}
              >
                <Button.Title>{item.label}</Button.Title>
              </Button.Root>
            ))}
          </div>

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
                  <EmptyState.Title>
                    Nenhuma comissão em {monthLabel(month)}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {rows.length > 0
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
                  onChanged={handleChanged}
                />
              ))}
            </div>
          )}
        </>
      )}
    </PageContent>
  );
}
