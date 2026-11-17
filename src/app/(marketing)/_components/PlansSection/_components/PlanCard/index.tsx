import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/utils/format/masks";
import { Check } from "lucide-react";
import { ReactNode } from "react";
import { EXTRA_USER_MONTHLY_PRICE, MarketingPlan } from "../../../../plans";

/**
 * Cartão de um plano: a mensalidade, quantos usuários ela inclui, o que o plano
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
  includedUsers,
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

      {/* Tabela comercial de 14/11/2026 (54,90 / 99,90 / 175,90). O campo
          ainda se chama `demoMonthlyPrice` por histórico: é só vitrine — o valor
          cobrado de verdade é calculado no backend (`core/domain/billing.py`). */}
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

      {/* A régua do usuário extra mora no cartão para o preço nunca aparecer
          sem o "quantos cabem" ao lado — a conta inteira fica na calculadora. */}
      {includedUsers !== null && (
        <Title variant="body-xs" color="secondary" className="-mt-8">
          {includedUsers} usuários inclusos · +{" "}
          {formatMoney(EXTRA_USER_MONTHLY_PRICE)} por usuário a mais
        </Title>
      )}

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
            <Check
              size={16}
              className="mt-2 shrink-0 text-(--color-status-success)"
            />

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
