"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { ToggleGroup } from "@/components/ToggleGroup";
import { formatMoney } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import {
  EXTRA_USER_MONTHLY_PRICE,
  MarketingPlan,
  PLANS,
} from "../../../../plans";
import {
  cheaperUpgradeFor,
  extraUsersFor,
  MAX_USERS,
  monthlyTotalFor,
} from "../../../../pricing";

/** Só os planos com preço de tabela entram na conta; o Enterprise é conversa. */
const PRICED_PLANS = PLANS.filter(
  (
    plan
  ): plan is MarketingPlan & {
    demoMonthlyPrice: number;
    includedUsers: number;
  } => plan.demoMonthlyPrice !== null && plan.includedUsers !== null
);

/**
 * "Quero o Básico com mais um usuário: quanto fica?" (14/11/2026).
 *
 * Responde a pergunta na hora, sem o visitante fazer conta: escolhe o plano,
 * soma ou tira usuários e vê a mensalidade abrir em linhas — o plano, os
 * usuários a mais e o total.
 *
 * Quando o plano de cima sai mais barato para a mesma equipe, a calculadora
 * DIZ isso e oferece a troca. Esconder essa virada para vender usuário extra
 * seria ganhar uma mensalidade e perder a confiança do gestor.
 *
 * Começa no Básico com 3 usuários — exatamente o exemplo que motivou a peça.
 */
export function SeatCalculator() {
  const [planCode, setPlanCode] = useState(PRICED_PLANS[0].code);
  const [users, setUsers] = useState(PRICED_PLANS[0].includedUsers + 1);

  const plan =
    PRICED_PLANS.find((candidate) => candidate.code === planCode) ??
    PRICED_PLANS[0];
  const extraUsers = extraUsersFor(plan, users);
  const total = monthlyTotalFor(plan, users) ?? plan.demoMonthlyPrice;
  const upgrade = cheaperUpgradeFor(plan, users);
  const upgradeTotal = upgrade ? monthlyTotalFor(upgrade, users) : null;

  // Trocar de plano nunca derruba a equipe abaixo do que o novo já inclui:
  // quem escolhe o Corporativo pensa em 10 pessoas, não em 3.
  const choosePlan = (code: string) => {
    const next = PRICED_PLANS.find((candidate) => candidate.code === code);
    if (!next) return;
    setPlanCode(next.code);
    setUsers((current) => Math.max(current, next.includedUsers));
  };

  return (
    <div className="desktop:grid-cols-[1fr_1.2fr] desktop:gap-48 tablet:p-32 mt-48 grid gap-24 rounded-(--r-lg) border border-(--border) bg-(--bg2) p-24">
      <div className="flex flex-col gap-12">
        <Title variant="eyebrow" color="amber">
          Simule a sua equipe
        </Title>

        <Title as="h3" variant="heading-md">
          Precisa de mais gente? Some um usuário, não um plano.
        </Title>

        <Title variant="body-md" color="secondary">
          Cada plano já inclui um número de usuários. Passou disso, cada usuário
          a mais custa {formatMoney(EXTRA_USER_MONTHLY_PRICE)} por mês — e, se o
          plano de cima sair mais em conta, a gente avisa.
        </Title>
      </div>

      <div className="flex flex-col gap-24">
        <ToggleGroup
          aria-label="Plano"
          options={PRICED_PLANS.map(({ code, label }) => ({
            value: code,
            label,
          }))}
          value={plan.code}
          onChange={choosePlan}
          fullWidth
        />

        <div className="flex items-center justify-between gap-16">
          <div className="flex flex-col gap-4">
            <Title variant="label">Usuários com login</Title>
            <Title variant="body-xs" color="muted">
              {plural(plan.includedUsers, "incluído", "incluídos")} no{" "}
              {plan.label}
            </Title>
          </div>

          <div className="flex items-center gap-12">
            <Button.Root
              type="button"
              appearance="outline"
              color="neutral"
              isIconOnly
              label="Tirar um usuário"
              disabled={users <= plan.includedUsers}
              onClick={() => setUsers((current) => current - 1)}
            >
              <Button.Icon icon={Minus} />
            </Button.Root>

            <Title
              as="span"
              variant="kpi"
              className="min-w-[3ch] text-center tabular-nums"
              aria-label={plural(users, "usuário", "usuários")}
            >
              {users}
            </Title>

            <Button.Root
              type="button"
              appearance="outline"
              color="neutral"
              isIconOnly
              label="Somar um usuário"
              disabled={users >= MAX_USERS}
              onClick={() => setUsers((current) => current + 1)}
            >
              <Button.Icon icon={Plus} />
            </Button.Root>
          </div>
        </div>

        <div className="flex flex-col gap-8 border-t border-(--border) pt-16">
          <div className="flex items-baseline justify-between gap-12">
            <Title as="span" variant="body-sm" color="secondary">
              {plan.label} · {plural(plan.includedUsers, "usuário", "usuários")}
            </Title>
            <Title as="span" variant="body-sm" className="tabular-nums">
              {formatMoney(plan.demoMonthlyPrice)}
            </Title>
          </div>

          <div className="flex items-baseline justify-between gap-12">
            <Title as="span" variant="body-sm" color="secondary">
              {extraUsers === 0
                ? "Nenhum usuário a mais"
                : `${plural(extraUsers, "usuário", "usuários")} a mais × ${formatMoney(EXTRA_USER_MONTHLY_PRICE)}`}
            </Title>
            <Title as="span" variant="body-sm" className="tabular-nums">
              {formatMoney(extraUsers * EXTRA_USER_MONTHLY_PRICE)}
            </Title>
          </div>

          <div
            className="flex items-baseline justify-between gap-12 pt-8"
            aria-live="polite"
          >
            <Title as="span" variant="label">
              Total por mês
            </Title>
            {/* A `key` remonta o número a cada mudança: a entrada curta
                mostra que a conta mudou sem o olho ter de procurar. */}
            <Title
              key={total}
              as="span"
              variant="kpi"
              color="amber"
              className="animate-rise-in tabular-nums"
            >
              {formatMoney(total)}
            </Title>
          </div>
        </div>

        {upgrade && upgradeTotal !== null && (
          <div className="tablet:flex-row tablet:items-center tablet:justify-between flex flex-col gap-12 rounded-(--r-md) bg-(--amber-bg) p-16">
            <Title variant="body-sm">
              Com {plural(users, "usuário", "usuários")}, o {upgrade.label} sai
              por <strong>{formatMoney(upgradeTotal)}</strong> — mais barato, e
              ainda inclui{" "}
              {plural(upgrade.includedUsers ?? 0, "usuário", "usuários")}.
            </Title>

            <Button.Root
              type="button"
              appearance="outline"
              color="neutral"
              size="sm"
              className="shrink-0"
              onClick={() => choosePlan(upgrade.code)}
            >
              <Button.Title>Ver o {upgrade.label}</Button.Title>
            </Button.Root>
          </div>
        )}

        <Button.Link
          href={`/assinar?plano=${plan.code}&usuarios=${users}`}
          appearance="solid"
          color="amber"
          size="lg"
          fullWidth
        >
          <Button.Title>
            Assinar o {plan.label} com {plural(users, "usuário", "usuários")}
          </Button.Title>
        </Button.Link>
      </div>
    </div>
  );
}
