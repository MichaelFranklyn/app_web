import { Title } from "@/components/Title";
import { Check } from "lucide-react";
import {
  EXTRA_USER_MONTHLY_PRICE,
  MarketingPlan,
  TRIAL_DAYS,
} from "../../../plans";
import { extraUsersFor } from "../../../pricing";
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
  users,
  cycle,
}: {
  plan: MarketingPlan;
  users: number;
  cycle: BillingCycle;
}) {
  const total = totalForCycle(plan, cycle, users);
  const extraUsers = extraUsersFor(plan, users);

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

      {/* Os usuários sempre à vista: é a linha que a calculadora mudou, e a
          primeira coisa que o gestor confere antes de pôr o cartão. */}
      <div className="flex flex-col gap-4">
        <Title variant="body-sm" color="secondary">
          {users} {users === 1 ? "usuário" : "usuários"} com login
        </Title>

        {extraUsers > 0 && (
          <Title variant="body-xs" color="muted">
            {plan.includedUsers} no plano + {extraUsers} a mais ×{" "}
            {formatMoney(EXTRA_USER_MONTHLY_PRICE)}/mês
          </Title>
        )}
      </div>

      <ul className="flex flex-col gap-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-8">
            <Check
              size={14}
              className="mt-4 shrink-0 text-(--color-status-success)"
            />

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
