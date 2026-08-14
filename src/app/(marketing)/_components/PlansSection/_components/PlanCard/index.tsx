import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/utils/format/masks";
import { Check } from "lucide-react";
import { ReactNode } from "react";
import { MarketingPlan } from "../../../../plans";

/**
 * Cartão de um plano. Sem preço — o que diferencia os três aqui é o que cada um
 * libera e até onde vai o volume.
 *
 * O destacado ganha borda âmbar e o botão sólido; os outros ficam no contorno.
 * Um cartão maior ou deslocado obrigaria a grade a ter altura irregular no
 * celular, onde os três empilham e o destaque não significa mais nada.
 *
 * O botão chega pronto em `cta`, montado pelo pai: `CtaLink` é irmão do
 * `PlansSection`, não deste cartão.
 */
export function PlanCard({
  label,
  pitch,
  limits,
  features,
  isHighlighted,
  demoMonthlyPrice,
  cta,
}: MarketingPlan & { cta: ReactNode }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-16 rounded-(--radius-lg) border bg-(--bg2) p-24",
        isHighlighted
          ? "border-(--amber-bd) shadow-(--shadow-md)"
          : "border-(--border)"
      )}
    >
      <div className="flex items-center justify-between gap-12">
        <Title variant="heading-md">{label}</Title>

        {isHighlighted && (
          <span className="rounded-(--radius-xs) bg-(--amber-bg2) px-8 py-4">
            <Title variant="micro" color="amber" weight="semibold">
              Mais escolhido
            </Title>
          </span>
        )}
      </div>

      {/* PENDENTE — o valor sai de `demoMonthlyPrice`, que é número de
          DEMONSTRAÇÃO para o checkout simulado ter o que exibir. Antes de a
          landing ir ao ar, ele precisa virar a tabela comercial de verdade. */}
      <div className="flex items-baseline gap-8">
        <Title variant="kpi">
          {demoMonthlyPrice === null
            ? "Sob consulta"
            : formatMoney(demoMonthlyPrice)}
        </Title>

        {demoMonthlyPrice !== null && (
          <Title variant="body-sm" color="muted">
            /mês
          </Title>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <Title variant="body-sm" color="secondary">
          {pitch}
        </Title>

        <Title variant="body-xs" color="muted">
          {limits}
        </Title>
      </div>

      <ul className="flex flex-1 flex-col gap-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-8">
            <Check size={16} className="mt-2 shrink-0 text-(--green)" />

            <Title variant="body-sm" color="secondary">
              {feature}
            </Title>
          </li>
        ))}
      </ul>

      {cta}
    </div>
  );
}
