import { BulletList } from "@/components/BulletList";
import { Title } from "@/components/Title";
import { Check } from "lucide-react";
import {
  EXTRA_USER_MONTHLY_PRICE,
  MarketingPlan,
  TRIAL_DAYS,
} from "../../../plans";
import { extraUsersFor } from "../../../pricing";
import { useSignedInUser } from "../../../useSignedInUser";
import { BillingCycle } from "../../interface";
import { formatMoney } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";
import { totalForCycle } from "../../utils";

/**
 * O resumo do pedido, fixo ao lado do fluxo. Ele acompanha a rolagem porque a
 * pergunta "o que mesmo eu estou levando?" costuma vir justamente na hora de
 * digitar o cartão, quando o cartão do plano já saiu da tela.
 *
 * O convite ao teste grátis é só para visitante: quem está logado já tem conta
 * (no teste ou com ele vencido), e oferecer de novo o teste confundia — parecia
 * que o caminho era criar outra conta (17/11/2026).
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
  const user = useSignedInUser();

  return (
    <aside className="desktop:sticky desktop:top-[96px] flex flex-col gap-16 rounded-(--r-lg) border border-(--border) bg-(--bg2) p-24">
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
          {plural(users, "usuário", "usuários")} com login
        </Title>

        {extraUsers > 0 && (
          <Title variant="body-xs" color="muted">
            {plan.includedUsers} no plano + {extraUsers} a mais ×{" "}
            {formatMoney(EXTRA_USER_MONTHLY_PRICE)}/mês
          </Title>
        )}
      </div>

      <BulletList.Root marker="icon">
        {plan.features.map((feature) => (
          <BulletList.Item key={feature} icon={Check}>
            <Title variant="body-sm" color="secondary">
              {feature}
            </Title>
          </BulletList.Item>
        ))}
      </BulletList.Root>

      <div className="flex items-baseline justify-between gap-12 border-t border-(--border) pt-16">
        <Title variant="body-sm" color="muted">
          Total
        </Title>

        <Title variant="kpi">
          {total === null ? "A combinar" : formatMoney(total)}
        </Title>
      </div>

      {!user && (
        <Title variant="body-xs" color="muted">
          Prefere experimentar antes? O teste de {TRIAL_DAYS} dias abre com o
          sistema inteiro liberado e não pede cartão.
        </Title>
      )}
    </aside>
  );
}
