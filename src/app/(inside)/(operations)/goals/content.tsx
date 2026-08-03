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
import { Title } from "@/components/Title";
import { factoryName } from "@/utils/company";
import { getTodayIso } from "@/utils/format/date";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import {
  addMonths,
  monthLabel,
  monthStartIso,
  yearMonthFromIso,
} from "@/utils/format/month";
import { useQuery } from "@apollo/client/react";
import { CalendarDays, ChevronLeft, ChevronRight, Target } from "lucide-react";
import { useMemo, useState } from "react";

import { CopyGoalsModal } from "./_components/CopyGoalsModal";
import { SellerGoalsCard } from "./_components/SellerGoalsCard";
import { SetGoalModal } from "./_components/SetGoalModal";
import {
  GOALS_FACTORIES_QUERY,
  GOALS_SELLERS_QUERY,
  SELLER_GOALS_QUERY,
} from "./gql";
import {
  GoalsFactoriesResponse,
  GoalsSellersResponse,
  SellerGoalsResponse,
} from "./interface";
import { groupBySeller, percentOf, percentTone, sumRows } from "./utils";

interface Props {
  /** Gestor (owner/admin/su): define metas e escolhe de quem ver. */
  canManage: boolean;
}

export default function GoalsContent({ canManage }: Props) {
  // Começa no mês corrente: a pergunta do dia a dia é "como estamos ESTE mês".
  const [month, setMonth] = useState(() => yearMonthFromIso(getTodayIso()));
  const periodMonthIso = monthStartIso(month);

  // Gestor pode ver a empresa inteira (nulo) ou filtrar um vendedor. O vendedor
  // nem manda o parâmetro: o backend já o prende à própria meta.
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  const sellersQuery = useQuery<GoalsSellersResponse>(GOALS_SELLERS_QUERY, {
    variables: { input: { first: 200 } },
    skip: !canManage,
  });
  const factoriesQuery = useQuery<GoalsFactoriesResponse>(
    GOALS_FACTORIES_QUERY,
    { variables: { input: { first: 200 } }, skip: !canManage }
  );

  const { data, loading, error, refetch } = useQuery<SellerGoalsResponse>(
    SELLER_GOALS_QUERY,
    {
      variables: { periodMonth: periodMonthIso, sellerId: selectedSellerId },
      fetchPolicy: "cache-and-network",
    }
  );

  const rows = useMemo(() => data?.sellerGoals?.rows ?? [], [data]);
  const groups = useMemo(() => groupBySeller(rows), [rows]);
  const totals = useMemo(() => sumRows(rows), [rows]);

  const sellerOptions: SelectOption[] = useMemo(
    () =>
      (sellersQuery.data?.goals_sellers.edges ?? [])
        .filter(({ node }) => node.isActive)
        .map(({ node }) => ({ value: node.id, label: node.name })),
    [sellersQuery.data]
  );

  const factoryOptions: SelectOption[] = useMemo(
    () =>
      (factoriesQuery.data?.goals_factories.edges ?? []).map(({ node }) => ({
        value: node.factoryId,
        label: node.nickname ?? factoryName(node.factory),
      })),
    [factoriesQuery.data]
  );

  const sellerValue =
    sellerOptions.find((o) => o.value === selectedSellerId) ?? null;
  const isCurrentMonth = useMemo(() => {
    const now = yearMonthFromIso(getTodayIso());
    return now.year === month.year && now.month === month.month;
  }, [month]);

  const showSkeleton = loading && !data;

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Metas</PanelHeader.Title>
            <PanelHeader.Description>
              {canManage
                ? "O combinado do mês e o quanto já foi feito, por vendedor e por fábrica."
                : "Suas metas do mês e o quanto você já fez, fábrica por fábrica."}
            </PanelHeader.Description>
            {canManage && (
              <PanelHeader.Actions className="mt-6">
                <div className="desktop:w-[220px] w-full">
                  <Input.Select
                    size="sm"
                    options={sellerOptions}
                    value={sellerValue}
                    variant="single"
                    placeholder="Todos os vendedores"
                    onChange={(val: SelectOption | SelectOption[] | null) => {
                      const opt = Array.isArray(val) ? val[0] : val;
                      setSelectedSellerId(opt?.value ?? null);
                    }}
                  />
                </div>
              </PanelHeader.Actions>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {error && !data ? (
        <QueryError onRetry={() => refetch()} />
      ) : (
        <>
          {/* Navegador de mês: manda em tudo o que vem abaixo. */}
          <div className="flex flex-wrap items-center justify-between gap-16">
            <Title variant="heading-sm">Metas de {monthLabel(month)}</Title>
            <div className="flex flex-wrap items-center gap-8">
              {canManage && (
                <>
                  <CopyGoalsModal
                    month={month}
                    sellerId={selectedSellerId}
                    onCopied={() => refetch()}
                  />
                  <SetGoalModal
                    periodMonthIso={periodMonthIso}
                    fixedSellerId={selectedSellerId}
                    sellerOptions={sellerOptions}
                    factoryOptions={factoryOptions}
                    onSaved={() => refetch()}
                  />
                </>
              )}
              <div className="flex items-center gap-4">
                <Button.Root
                  appearance="outline"
                  color="neutral"
                  size="sm"
                  isIconOnly
                  label="Mês anterior"
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                >
                  <Button.Icon icon={ChevronLeft} />
                </Button.Root>
                <Button.Root
                  appearance={isCurrentMonth ? "tinted" : "ghost"}
                  color={isCurrentMonth ? "amber" : "neutral"}
                  size="sm"
                  noUppercase
                  onClick={() => setMonth(yearMonthFromIso(getTodayIso()))}
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
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                >
                  <Button.Icon icon={ChevronRight} />
                </Button.Root>
              </div>
            </div>
          </div>

          {showSkeleton ? (
            <div className="flex flex-col gap-20">
              <Loading.Skeleton className="h-[104px] w-full" />
              <Loading.Skeleton className="h-[320px] w-full" />
            </div>
          ) : (
            <>
              <Grid.Root cols={{ base: 1, tablet: 2, desktop: 4 }} gap={20}>
                <Grid.Item>
                  <GoalKpi
                    label={`Faturado em ${monthLabel(month)}`}
                    values={totals.invoiced}
                    money
                  />
                </Grid.Item>
                <Grid.Item>
                  <GoalKpi label="Vendido" values={totals.ordered} money />
                </Grid.Item>
                <Grid.Item>
                  <GoalKpi
                    label="Clientes que compraram"
                    values={totals.positivations}
                  />
                </Grid.Item>
                <Grid.Item>
                  <GoalKpi label="Visitas concluídas" values={totals.visits} />
                </Grid.Item>
              </Grid.Root>

              {groups.length === 0 ? (
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Target size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhuma meta em {monthLabel(month)}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {canManage
                      ? "Defina a meta de cada vendedor por fábrica, ou repita as metas do mês anterior."
                      : "Ainda não há metas definidas para você neste mês."}
                  </EmptyState.Description>
                </EmptyState.Root>
              ) : (
                <div className="flex flex-col gap-20">
                  {groups.map((group) => (
                    <SellerGoalsCard
                      key={group.sellerId}
                      group={group}
                      periodMonthIso={periodMonthIso}
                      canManage={canManage}
                      sellerOptions={sellerOptions}
                      factoryOptions={factoryOptions}
                      onChanged={() => refetch()}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </PageContent>
  );
}

interface GoalKpiProps {
  label: string;
  values: { target: number | null; done: number };
  money?: boolean;
}

/** Um indicador somado do recorte: o realizado grande e a meta embaixo. */
function GoalKpi({ label, values, money }: GoalKpiProps) {
  const percent = percentOf(values);
  const format = (value: number) =>
    money ? formatMoney(value) : formatNumber(value);
  const tone = percentTone(percent);

  return (
    <Card.Kpi>
      <Card.Kpi.Label>{label}</Card.Kpi.Label>
      <Card.Kpi.Value
        status={
          values.target === null
            ? "neutral"
            : tone === "green"
              ? "ok"
              : tone === "red"
                ? "urgente"
                : "atencao"
        }
      >
        {format(values.done)}
      </Card.Kpi.Value>
      <Card.Kpi.Delta>
        {values.target === null
          ? "sem meta definida"
          : `${percent?.toFixed(0)}% da meta de ${format(values.target)}`}
      </Card.Kpi.Delta>
    </Card.Kpi>
  );
}
