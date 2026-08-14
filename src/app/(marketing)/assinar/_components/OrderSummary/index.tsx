import { Title } from "@/components/Title";
import { Check } from "lucide-react";
import { MarketingPlan, TRIAL_DAYS } from "../../../plans";
import { BillingCycle } from "../../interface";
import { formatMoney } from "@/utils/format/masks";
import { totalForCycle } from "../../utils";

/**
 * O resumo do pedido, fixo ao lado do fluxo. Ele acompanha a rolagem porque a
 * pergunta "o que mesmo eu estou levando?" costuma vir justamente na hora de
 * digitar o cartão, quando o cartão do plano já saiu da tela.
 */
export function OrderSummary({
  plan,
  cycle,
}: {
  plan: MarketingPlan;
  cycle: BillingCycle;
}) {
  const total = totalForCycle(plan, cycle);

  return (
    <aside className="desktop:sticky desktop:top-[96px] flex flex-col gap-16 rounded-(--radius-lg) border border-(--border) bg-(--bg2) p-24">
      <Title variant="label" color="muted">
        Seu pedido
      </Title>

      <div className="flex items-baseline justify-between gap-12">
        <Title variant="heading-md">Plano {plan.label}</Title>

        <Title variant="body-sm" color="muted">
          {cycle === "annual" ? "Anual" : "Mensal"}
        </Title>
      </div>

      <ul className="flex flex-col gap-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-8">
            <Check size={14} className="mt-4 shrink-0 text-(--green)" />

            <Title variant="body-sm" color="secondary">
              {feature}
            </Title>
          </li>
        ))}
      </ul>

      <div className="flex items-baseline justify-between gap-12 border-t border-(--border) pt-16">
        <Title variant="body-sm" color="muted">
          Total
        </Title>

        <Title variant="kpi">
          {total === null ? "A combinar" : formatMoney(total)}
        </Title>
      </div>

      <Title variant="body-xs" color="muted">
        Prefere experimentar antes? O teste de {TRIAL_DAYS} dias abre com o
        sistema inteiro liberado e não pede cartão.
      </Title>
    </aside>
  );
}
