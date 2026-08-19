"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { Progress } from "@/components/Progress";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { useCompleteList } from "@/hooks/useCompleteList";
import { factoryName } from "@/utils/company";
import { getTodayIso } from "@/utils/format/date";
import {
  addMonths,
  monthLabel,
  monthStartIso,
  yearMonthFromIso,
} from "@/utils/format/month";
import { useMutation, useQuery } from "@apollo/client/react";
import { CalendarDays, ChevronLeft, ChevronRight, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CopyGoalsModal } from "../_components/CopyGoalsModal";
import { SetGoalModal } from "../_components/SetGoalModal";
import { DeleteGoalResponse } from "../_components/SetGoalModal/interface";
import {
  DELETE_SELLER_GOAL_MUTATION,
  GOALS_FACTORIES_QUERY,
  GOALS_SELLERS_QUERY,
  SELLER_GOALS_QUERY,
} from "../gql";
import {
  GoalRow,
  GoalsFactoriesResponse,
  GoalsSellersResponse,
  SellerGoalsResponse,
} from "../interface";
import { overallPercent, percentTone, sumRows } from "../utils";
import { FactoryGoalCard } from "./_components/FactoryGoalCard";

interface Props {
  sellerId: string;
  /** Mês herdado da lista (ISO do 1º dia); nulo abre no mês corrente. */
  monthParam: string | null;
  canManage: boolean;
}

// Catálogos pequenos carregados por inteiro: `useCompleteList` rebusca pelo
// total se um dia passarem da primeira página, em vez de truncar calado.
const EMPTY_INPUT = {};
const getGoalsSellers = (d: GoalsSellersResponse) => d.goals_sellers;
const getGoalsFactories = (d: GoalsFactoriesResponse) => d.goals_factories;

/**
 * As metas de UM vendedor no mês, um cartão por fábrica.
 *
 * Página própria, e não um painel dentro da lista: a fábrica é onde a cota é
 * negociada, e mexer nela abre um modal — que não pode nascer de dentro de
 * outro modal. Aqui o cartão fica na página, o modal de meta é o único, e o
 * endereço leva a pessoa e o mês, então o link pode ser mandado para alguém.
 */
export default function SellerGoalsContent({
  sellerId,
  monthParam,
  canManage,
}: Props) {
  const router = useRouter();
  const [month, setMonth] = useState(() =>
    yearMonthFromIso(monthParam ?? getTodayIso())
  );
  const periodMonthIso = monthStartIso(month);

  // O mês viaja na URL: quem volta para a lista volta para o mesmo mês, e o
  // link compartilhado abre o que a pessoa estava vendo.
  const goToMonth = (next: typeof month) => {
    setMonth(next);
    router.replace(`/goals/${sellerId}?month=${monthStartIso(next)}`, {
      scroll: false,
    });
  };

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
      variables: { periodMonth: periodMonthIso, sellerId },
      fetchPolicy: "cache-and-network",
    }
  );

  const [deleteGoal] = useMutation<DeleteGoalResponse>(
    DELETE_SELLER_GOAL_MUTATION
  );

  const rows = useMemo(() => data?.sellerGoals?.rows ?? [], [data]);
  const totals = useMemo(() => sumRows(rows), [rows]);
  const overall = useMemo(() => overallPercent(totals), [totals]);
  // O nome vem das próprias linhas: o vendedor não tem acesso à lista de
  // vendedores (ela é admin-only), e ele também abre esta página.
  const sellerName = rows[0]?.seller?.name ?? "Vendedor";

  const sellerOptions = useMemo(
    () =>
      (sellersQuery.data?.goals_sellers.edges ?? [])
        .filter(({ node }) => node.isActive)
        .map(({ node }) => ({ value: node.id, label: node.name })),
    [sellersQuery.data]
  );

  const factoryOptions = useMemo(
    () =>
      (factoriesQuery.data?.goals_factories.edges ?? []).map(({ node }) => ({
        value: node.factoryId,
        label: node.nickname ?? factoryName(node.factory),
      })),
    [factoriesQuery.data]
  );

  const removeGoal = async (row: GoalRow) => {
    const res = await deleteGoal({ variables: { id: row.goalId } });
    if (!res.data?.deleteSellerGoal?.status) {
      throw new Error(
        res.data?.deleteSellerGoal?.message ?? "Erro ao remover a meta"
      );
    }
    refetch();
  };

  const isCurrentMonth = useMemo(() => {
    const now = yearMonthFromIso(getTodayIso());
    return now.year === month.year && now.month === month.month;
  }, [month]);

  return (
    <PageContent>
      {/* Breadcrumb e cabeçalho andam juntos, com o espaçamento curto do
          detalhe do pedido: soltos no PageContent eles herdavam o gap de 20px,
          que é o vão entre BLOCOS da página — não entre o caminho e o título a
          que ele se refere. */}
      <div className="flex flex-col gap-8">
        <Breadcrumb.Root>
          <Breadcrumb.Item href={`/goals?month=${periodMonthIso}`}>
            Metas
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>{sellerName}</Breadcrumb.Item>
        </Breadcrumb.Root>

        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Title>{sellerName}</PanelHeader.Title>
              <PanelHeader.Description>
                Metas de {monthLabel(month)}, fábrica por fábrica. A cota é
                combinada em cada fábrica — é nela que se ajusta.
              </PanelHeader.Description>
              {!loading && rows.length > 0 && (
                <PanelHeader.Actions className="mt-6">
                  <div className="flex w-full max-w-[320px] flex-col gap-4">
                    {overall === null ? (
                      <Badge.Root appearance="tinted" color="neutral" size="xs">
                        <Badge.Text>Sem meta neste mês</Badge.Text>
                      </Badge.Root>
                    ) : (
                      <>
                        <Title
                          variant="body-sm"
                          weight="semibold"
                          color={percentTone(overall)}
                        >
                          {overall.toFixed(0)}% da meta do mês
                        </Title>
                        <Progress.Bar
                          value={Math.min(overall, 100)}
                          color={percentTone(overall)}
                        />
                      </>
                    )}
                  </div>
                </PanelHeader.Actions>
              )}
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      {error && !data ? (
        <QueryError onRetry={() => refetch()} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-16">
            <Title variant="heading-sm">
              {rows.length} {rows.length === 1 ? "fábrica" : "fábricas"} em{" "}
              {monthLabel(month)}
            </Title>
            <div className="flex flex-wrap items-center gap-8">
              {canManage && (
                <>
                  {/* Virou o mês: a grade nasce vazia e ninguém redigita cinco
                      fábricas todo dia 1º. Repetir o mês anterior não
                      sobrescreve o que já foi ajustado aqui. */}
                  <CopyGoalsModal
                    month={month}
                    sellerId={sellerId}
                    onCopied={() => refetch()}
                  />
                  <SetGoalModal
                    periodMonthIso={periodMonthIso}
                    fixedSellerId={sellerId}
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
                  onClick={() => goToMonth(addMonths(month, -1))}
                >
                  <Button.Icon icon={ChevronLeft} />
                </Button.Root>
                <Button.Root
                  appearance={isCurrentMonth ? "tinted" : "ghost"}
                  color={isCurrentMonth ? "amber" : "neutral"}
                  size="sm"
                  noUppercase
                  onClick={() => goToMonth(yearMonthFromIso(getTodayIso()))}
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
                  onClick={() => goToMonth(addMonths(month, 1))}
                >
                  <Button.Icon icon={ChevronRight} />
                </Button.Root>
              </div>
            </div>
          </div>

          {loading && rows.length === 0 ? (
            <Grid.Root cols={{ base: 1, tablet: 2, desktop: 3 }} gap={20}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Grid.Item key={i}>
                  <Loading.Skeleton className="h-[220px] w-full" />
                </Grid.Item>
              ))}
            </Grid.Root>
          ) : rows.length === 0 ? (
            <EmptyState.Root>
              <EmptyState.Icon>
                <Target size={32} />
              </EmptyState.Icon>
              <EmptyState.Title>
                Nada em {monthLabel(month)} para {sellerName}
              </EmptyState.Title>
              <EmptyState.Description>
                {canManage
                  ? `Nenhuma meta definida e nenhuma venda registrada neste mês. Repita as metas de ${monthLabel(addMonths(month, -1))} ou defina a de uma fábrica.`
                  : "Você ainda não tem metas neste mês."}
              </EmptyState.Description>
              {/* O atalho ao lado da explicação: é aqui que o gestor cai no dia
                  1º, e mandá-lo procurar o botão lá em cima é o que faz a grade
                  do mês novo nunca ser preenchida. */}
              {canManage && (
                <div className="mt-16">
                  <CopyGoalsModal
                    month={month}
                    sellerId={sellerId}
                    onCopied={() => refetch()}
                  />
                </div>
              )}
            </EmptyState.Root>
          ) : (
            <Grid.Root cols={{ base: 1, tablet: 2, desktop: 3 }} gap={20}>
              {rows.map((row) => (
                <Grid.Item key={`${row.sellerId}-${row.factoryId}`}>
                  <FactoryGoalCard
                    row={row}
                    periodMonthIso={periodMonthIso}
                    canManage={canManage}
                    sellerOptions={sellerOptions}
                    factoryOptions={factoryOptions}
                    onRemove={removeGoal}
                    onChanged={() => refetch()}
                  />
                </Grid.Item>
              ))}
            </Grid.Root>
          )}
        </>
      )}
    </PageContent>
  );
}
