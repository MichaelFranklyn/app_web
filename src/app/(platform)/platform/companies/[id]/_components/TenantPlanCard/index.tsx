"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";

import { PlanSummary } from "../../../../_components/PlanSummary";
import { usePlanCatalog } from "../../../../usePlanCatalog";
import { TenantDetail } from "../../interface";

/**
 * O que o plano DESTA empresa entrega, na ficha dela.
 *
 * O rótulo no cabeçalho ("Pro") responde qual plano é; esta carta responde o que
 * isso significa — que é a pergunta de quem atende um chamado do tipo "sumiu a
 * tela de relatórios". Sem ela, a resposta exigiria abrir o código.
 */
export function TenantPlanCard({ tenant }: { tenant: TenantDetail }) {
  const { findPlan, loading } = usePlanCatalog();
  const plan = findPlan(tenant.plan);

  if (loading && !plan) return null;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Plano {plan?.label ?? tenant.plan}
        </Card.Header.Title>
        <Card.Header.Description>
          {plan
            ? "O que esta empresa enxerga hoje. Os limites abaixo são os do plano — um teto próprio, se houver, aparece em Uso."
            : null}
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        {plan ? (
          <PlanSummary plan={plan} showMissing />
        ) : (
          // Dado legado aponta para plano fora do catálogo. O backend trata
          // isso caindo no básico (ver `get_plan`), e dizer isso aqui evita que
          // alguém procure por um plano que não existe mais.
          <Title variant="caption" color="red">
            O plano &quot;{tenant.plan}&quot; não está no catálogo. O sistema
            trata esta empresa como Básico. Defina um plano válido.
          </Title>
        )}
      </Card.Body>
    </Card.Root>
  );
}
