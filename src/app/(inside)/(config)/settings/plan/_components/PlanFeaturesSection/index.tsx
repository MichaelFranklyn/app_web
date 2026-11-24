"use client";

import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import {
  FEATURE_DESCRIPTION,
  FEATURE_LABEL,
  FEATURE_ORDER,
  PlanFeature,
} from "@/services/plan";
import { Check, Lock } from "lucide-react";

/**
 * Um recurso, como item de checklist: incluído (check verde) ou fora do plano
 * (cadeado, apagado).
 *
 * Era um cartão verde por recurso — oito blocos coloridos competindo com os
 * limites e a assinatura, que são o que a pessoa veio ver. Uma lista dentro de
 * um cartão só diz o mesmo com a cor apenas no ícone (crítica de
 * configurações, 23/11/2026).
 */
function FeatureItem({
  feature,
  included,
}: {
  feature: PlanFeature;
  included: boolean;
}) {
  const StatusIcon = included ? Check : Lock;

  return (
    <li className="flex items-start gap-8">
      <StatusIcon
        aria-hidden
        size={16}
        className={
          included
            ? "mt-2 shrink-0 text-(--color-status-success)"
            : "mt-2 shrink-0 text-(--color-text-disabled)"
        }
      />
      <div className="flex min-w-0 flex-col gap-2">
        <Title
          variant="body-sm"
          weight="semibold"
          color={included ? undefined : "muted"}
        >
          {FEATURE_LABEL[feature]}
          {!included && <span className="sr-only"> (fora do plano)</span>}
        </Title>
        <Title variant="micro" color="muted">
          {FEATURE_DESCRIPTION[feature]}
        </Title>
      </div>
    </li>
  );
}

/**
 * A lista inteira, com o que falta apagado — e não só o que se tem.
 *
 * Mostrar apenas o incluído esconderia justamente a informação que interessa a
 * quem está avaliando trocar de plano: o que existe do outro lado.
 */
export function PlanFeaturesSection({ features }: { features: PlanFeature[] }) {
  const included = FEATURE_ORDER.filter((f) => features.includes(f)).length;

  return (
    <section className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <Title
          variant="heading-sm"
          className="inline-flex items-center gap-6 self-start"
        >
          Recursos
          <HelpTooltip
            label="Por que aparecem recursos que eu não tenho?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" weight="semibold">
                  A lista inteira
                </Title>
                <Title variant="body-sm">
                  O check verde é o que o seu plano inclui; o cadeado cinza
                  existe no sistema mas não está no seu plano.
                </Title>
                <Title variant="body-sm" color="muted">
                  Um recurso em cinza some do menu e das telas — é por isso que
                  ele aparece aqui, para a ausência ter uma explicação em vez de
                  parecer defeito.
                </Title>
              </div>
            }
          />
        </Title>
        <Title variant="body-sm" color="muted">
          {included} de {FEATURE_ORDER.length} recursos incluídos no seu plano.
        </Title>
      </div>

      <Card.Root>
        <Card.Body>
          <ul className="tablet:grid-cols-2 desktop-xl:grid-cols-3 grid grid-cols-1 gap-x-24 gap-y-16">
            {FEATURE_ORDER.map((feature) => (
              <FeatureItem
                key={feature}
                feature={feature}
                included={features.includes(feature)}
              />
            ))}
          </ul>
        </Card.Body>
      </Card.Root>
    </section>
  );
}
