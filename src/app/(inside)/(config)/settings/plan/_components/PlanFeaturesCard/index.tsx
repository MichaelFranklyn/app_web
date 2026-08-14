import { Card } from "@/components/Card";
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
        <Card.Header.Title size="sm" weight="semibold">
          Recursos
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
