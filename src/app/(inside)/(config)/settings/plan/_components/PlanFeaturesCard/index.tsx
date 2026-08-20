import { Card } from "@/components/Card";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Title } from "@/components/Title";
import {
  FEATURE_DESCRIPTION,
  FEATURE_LABEL,
  FEATURE_ORDER,
  PlanFeature,
} from "@/services/plan";
import { Check, Minus } from "lucide-react";

/**
 * A lista inteira, com o que falta em cinza — e não só o que se tem.
 *
 * Mostrar apenas o incluído esconderia justamente a informação que interessa a
 * quem está avaliando trocar de plano: o que existe do outro lado.
 */
export function PlanFeaturesCard({ features }: { features: PlanFeature[] }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title
          size="sm"
          weight="semibold"
          className="inline-flex items-center gap-6"
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
        </Card.Header.Title>
        <Card.Header.Description>
          O que está incluído no seu plano.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        <div className="flex flex-col gap-12">
          {FEATURE_ORDER.map((feature) => {
            const included = features.includes(feature);
            return (
              <div key={feature} className="flex items-start gap-8">
                <span
                  className={
                    included
                      ? "mt-[2px] text-(--green)"
                      : "mt-[2px] text-(--muted)"
                  }
                  aria-hidden
                >
                  {included ? <Check size={16} /> : <Minus size={16} />}
                </span>
                <div className="flex flex-col">
                  <Title
                    variant="caption"
                    weight="semibold"
                    color={included ? undefined : "muted"}
                  >
                    {FEATURE_LABEL[feature]}
                  </Title>
                  <Title variant="micro" color="muted">
                    {FEATURE_DESCRIPTION[feature]}
                  </Title>
                </div>
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card.Root>
  );
}
