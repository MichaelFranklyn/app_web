"use client";

import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";

import { PlanSummary } from "../_components/PlanSummary";
import { usePlanCatalog } from "../usePlanCatalog";
import { FeatureGlossary } from "./_components/FeatureGlossary";

/**
 * O catálogo de planos para quem atende: o que cada um entrega, lado a lado.
 *
 * É a tela que o suporte abre com o cliente no telefone — daí a comparação
 * mostrar também o que NÃO está incluído em cada plano, que é justamente a
 * pergunta que gera a ligação.
 */
export default function PlansContent() {
  const { plans, loading, error, refetch } = usePlanCatalog();

  if (loading && plans.length === 0) {
    return (
      <PageContent>
        <Loading.Skeleton className="h-[420px]" />
      </PageContent>
    );
  }

  if (error || plans.length === 0) {
    return (
      <PageContent>
        <QueryError onRetry={refetch} />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Planos</PanelHeader.Title>
            <PanelHeader.Description>
              O que cada plano entrega. É a mesma matriz que o sistema aplica —
              o que estiver fora daqui, a API recusa. Para trocar o plano de uma
              empresa, abra a ficha dela em Empresas.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 4 }} gap={12}>
        {plans.map((plan) => (
          <Grid.Item key={plan.code}>
            <Card.Root className="h-full">
              <Card.Header>
                <Card.Header.Title size="sm" weight="semibold">
                  {plan.label}
                </Card.Header.Title>
                <Card.Header.Description>
                  <Title variant="micro" color="muted">
                    código: {plan.code}
                  </Title>
                </Card.Header.Description>
              </Card.Header>
              <Card.Body>
                <PlanSummary plan={plan} showMissing />
              </Card.Body>
            </Card.Root>
          </Grid.Item>
        ))}
      </Grid.Root>

      <FeatureGlossary />
    </PageContent>
  );
}
