"use client";

import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { MY_PLAN_QUERY, MyPlanQueryData } from "@/services/plan";
import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useQuery } from "@apollo/client/react";

import { PlanFeaturesCard } from "./_components/PlanFeaturesCard";
import { PlanHeader } from "./_components/PlanHeader";
import { PlanUsageCard } from "./_components/PlanUsageCard";

/**
 * O contrato da empresa, do lado de quem paga por ele: qual plano, o que ele
 * inclui e quanto de cada teto já foi usado.
 *
 * Existe pelo mesmo motivo que o backend expõe o teto à própria empresa —
 * quando o botão de adicionar vendedor para de funcionar, a resposta tem de
 * estar em algum lugar do sistema, e não só na conversa com o suporte.
 */
interface Props {
  /** Plano já buscado no servidor (page.tsx); null se o SSR falhou. */
  seed: MyPlanQueryData | null;
}

export default function PlanContent({ seed }: Props) {
  // Antes da leitura abaixo: com o cache quente a tela pinta no 1º render, e a
  // revalidação do `cache-and-network` segue acontecendo por cima.
  useSeedQuery([{ query: MY_PLAN_QUERY, data: seed }]);

  const { data, loading, error, refetch } = useQuery<MyPlanQueryData>(
    MY_PLAN_QUERY,
    // Contagem de uso envelhece a cada cadastro feito noutra tela; buscar de
    // novo ao abrir custa quatro `count` e evita mostrar número velho.
    { fetchPolicy: "cache-and-network" }
  );

  const plan = data?.myPlan?.data ?? null;

  if (loading && !plan) {
    return (
      <PageContent>
        <Loading.Skeleton className="h-[420px]" />
      </PageContent>
    );
  }

  if (error || !plan) {
    return (
      <PageContent>
        <QueryError onRetry={refetch} />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PlanHeader plan={plan} />

      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={12}>
        <Grid.Item>
          <PlanUsageCard limits={plan.limits} />
        </Grid.Item>
        <Grid.Item>
          <PlanFeaturesCard features={plan.features} />
        </Grid.Item>
      </Grid.Root>
    </PageContent>
  );
}
