"use client";

import { Button } from "@/components/Button";
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
import {
  addMonths,
  monthLabel,
  monthStartIso,
  yearMonthFromIso,
} from "@/utils/format/month";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useQuery } from "@apollo/client/react";
import { CalendarDays, ChevronLeft, ChevronRight, Target } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { CopyGoalsModal } from "./_components/CopyGoalsModal";
import { GoalKpiCard } from "./_components/GoalKpiCard";
import { GoalsTable } from "./_components/GoalsTable";
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
import { GOAL_METRICS, groupBySeller, SellerGroup, sumRows } from "./utils";

interface Props {
  /** Gestor (owner/admin/su): define metas e escolhe de quem ver. */
  canManage: boolean;
}

// Catálogos pequenos carregados por inteiro: `useCompleteList` rebusca pelo
// total se um dia passarem da primeira página, em vez de truncar calado.
const EMPTY_INPUT = {};
const getGoalsSellers = (d: GoalsSellersResponse) => d.goals_sellers;
const getGoalsFactories = (d: GoalsFactoriesResponse) => d.goals_factories;

export default function GoalsContent({ canManage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Começa no mês corrente — a pergunta do dia a dia é "como estamos ESTE mês"
  // —, ou no mês que veio da página de um vendedor: voltar de lá tem de cair no
  // mesmo lugar de onde se saiu.
  const [month, setMonth] = useState(() =>
    yearMonthFromIso(searchParams.get("month") ?? getTodayIso())
  );
  const periodMonthIso = monthStartIso(month);

  // Gestor pode ver a empresa inteira (nulo) ou filtrar um vendedor. O vendedor
  // nem manda o parâmetro: o backend já o prende à própria meta.
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  const sellersQuery = useCompleteList<GoalsSellersResponse>(
    GOALS_SELLERS_QUERY,
    EMPTY_INPUT,
    getGoalsSellers,
    { skip: !canManage }
  );
  const factoriesQuery = useCompleteList<GoalsFactoriesResponse>(
    GOALS_FACTORIES_QUERY,
    EMPTY_INPUT,
    getGoalsFactories,
    { skip: !canManage }
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

  // Detalhe de uma pessoa, NA PÁGINA (nunca sobre a lista: modal dentro de
  // modal é proibido, e definir meta já é um modal). É o mesmo estado do
  // seletor do topo — escolher alguém ali ou clicar na linha leva ao mesmo
  // lugar, e a consulta já volta recortada por ele. O vendedor, que só tem a
  // própria meta, cai direto aqui.
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
                {/* Os quatro cartões somam o recorte da tela (o vendedor
                    escolhido, ou a empresa toda). A explicação de cada um vem
                    de GOAL_METRICS — a mesma das barras, para o indicador não
                    significar duas coisas em dois lugares. */}
                <Grid.Item>
                  <GoalKpiCard
                    label={`Faturado em ${monthLabel(month)}`}
                    status="ok"
                    values={totals.invoiced}
                    help={GOAL_METRICS[0].help}
                    money
                  />
                </Grid.Item>
                <Grid.Item>
                  <GoalKpiCard
                    label="Vendido"
                    status="atencao"
                    values={totals.ordered}
                    help={GOAL_METRICS[1].help}
                    money
                  />
                </Grid.Item>
                <Grid.Item>
                  <GoalKpiCard
                    label="Clientes que compraram"
                    status="neutral"
                    valueClassName="text-(--blue)!"
                    values={totals.positivations}
                    help={GOAL_METRICS[2].help}
                  />
                </Grid.Item>
                <Grid.Item>
                  <GoalKpiCard
                    label="Visitas concluídas"
                    status="ok"
                    values={totals.visits}
                    help={GOAL_METRICS[3].help}
                  />
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
                <GoalsTable
                  groups={groups}
                  // A pessoa tem página própria: é lá que as fábricas dela
                  // viram cartões editáveis, sem modal sobre modal. O mês vai
                  // junto para a navegação não perder o recorte.
                  onOpen={(group: SellerGroup) =>
                    router.push(
                      `/goals/${group.sellerId}?month=${periodMonthIso}`
                    )
                  }
                />
              )}
            </>
          )}
        </>
      )}
    </PageContent>
  );
}
