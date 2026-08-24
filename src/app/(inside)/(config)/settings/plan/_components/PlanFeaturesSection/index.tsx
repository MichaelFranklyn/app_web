"use client";

import { Grid } from "@/components/Grid";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import {
  FEATURE_DESCRIPTION,
  FEATURE_ICON,
  FEATURE_LABEL,
  FEATURE_ORDER,
  PlanFeature,
} from "@/services/plan";
import { Check, Lock } from "lucide-react";

/** Um recurso: incluído (verde, legível) ou fora do plano (cinza, apagado). */
function FeatureCard({
  feature,
  included,
}: {
  feature: PlanFeature;
  included: boolean;
}) {
  const Icon = FEATURE_ICON[feature];

  return (
    <div
      className={cn(
        "flex h-full items-start gap-12 rounded-(--r-lg) border p-16 transition-colors",
        included
          ? "border-(--green-bd) bg-(--green-bg)"
          : "border-(--border) bg-(--bg3)"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-32 shrink-0 items-center justify-center rounded-(--r-md)",
          included ? "bg-(--bg2) text-(--green)" : "bg-(--bg4) text-(--muted2)"
        )}
      >
        <Icon size={16} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-6">
          <Title
            variant="caption"
            weight="semibold"
            color={included ? undefined : "muted"}
          >
            {FEATURE_LABEL[feature]}
          </Title>
          <span
            aria-hidden
            className={included ? "text-(--green)" : "text-(--muted2)"}
          >
            {included ? <Check size={13} /> : <Lock size={12} />}
          </span>
        </div>
        <Title variant="micro" color="muted">
          {FEATURE_DESCRIPTION[feature]}
        </Title>
      </div>
    </div>
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
                <Title variant="label" color="amber">
                  A lista inteira
                </Title>
                <Title variant="body-sm">
                  O verde é o que o seu plano inclui; o cinza existe no sistema
                  mas não está no seu plano.
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

      <Grid.Root cols={{ base: 1, tablet: 2, "desktop-xl": 3 }} gap={12}>
        {FEATURE_ORDER.map((feature) => (
          <Grid.Item key={feature}>
            <FeatureCard
              feature={feature}
              included={features.includes(feature)}
            />
          </Grid.Item>
        ))}
      </Grid.Root>
    </section>
  );
}
