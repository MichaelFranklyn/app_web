import { Title } from "@/components/Title";
import { FEATURE_LABEL, FEATURE_ORDER } from "@/services/plan";
import { Check, Minus } from "lucide-react";

import { PlanCatalogEntry } from "../../interface";

/** Como o teto aparece: número, ou a palavra que diz que não há teto. */
export const limitText = (limit: number | null): string =>
  limit === null ? "sem limite" : String(limit);

interface Props {
  plan: PlanCatalogEntry;
  /**
   * Mostrar também o que o plano NÃO inclui, em cinza. Ligado na comparação
   * (onde a ausência é a informação) e desligado no resumo de um plano só, que
   * viraria uma lista de negativas.
   */
  showMissing?: boolean;
}

/**
 * O que um plano entrega: recursos e tetos, em uma leitura.
 *
 * Vive no pai de `/platform/plans` e da ficha da empresa porque as duas o usam —
 * a referência e o modal que troca o plano de alguém.
 */
export function PlanSummary({ plan, showMissing = false }: Props) {
  const features = showMissing
    ? FEATURE_ORDER
    : FEATURE_ORDER.filter((feature) => plan.features.includes(feature));

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <Title variant="micro" color="muted">
          Recursos
        </Title>
        <div className="flex flex-col gap-4">
          {features.map((feature) => {
            const included = plan.features.includes(feature);
            return (
              <div key={feature} className="flex items-center gap-6">
                <span
                  className={included ? "text-(--green)" : "text-(--muted)"}
                  aria-hidden
                >
                  {included ? <Check size={14} /> : <Minus size={14} />}
                </span>
                <Title variant="caption" color={included ? undefined : "muted"}>
                  {FEATURE_LABEL[feature]}
                </Title>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Title variant="micro" color="muted">
          Limites
        </Title>
        <div className="flex flex-col gap-4">
          {plan.limits.map((usage) => (
            <div
              key={usage.key}
              className="flex items-baseline justify-between"
            >
              <Title variant="caption" className="capitalize">
                {usage.label}
              </Title>
              <Title
                variant="caption"
                weight="semibold"
                color={usage.limit === null ? "muted" : undefined}
              >
                {limitText(usage.limit)}
              </Title>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
