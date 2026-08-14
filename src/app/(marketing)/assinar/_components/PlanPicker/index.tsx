import { Title } from "@/components/Title";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PLANS } from "../../../plans";

/**
 * Fallback de quem chegou a `/assinar` sem plano na URL — link antigo, `?plano`
 * digitado errado ou acesso direto. Em vez de erro, a escolha: são três
 * opções, cabem na tela.
 */
export function PlanPicker() {
  return (
    <div className="flex flex-col gap-16">
      <Title variant="heading-md">Escolha o plano para continuar</Title>

      <div className="flex flex-col gap-12">
        {PLANS.map((plan) => (
          <Link
            key={plan.code}
            href={`/assinar?plano=${plan.code}`}
            className="flex items-center justify-between gap-16 rounded-(--radius-md) border border-(--border) bg-(--bg2) p-24 hover:bg-(--bg3)"
          >
            <span className="flex flex-col gap-4">
              <Title variant="heading-sm">{plan.label}</Title>

              <Title variant="body-sm" color="muted">
                {plan.pitch}
              </Title>
            </span>

            <ArrowRight size={18} className="shrink-0 text-(--muted)" />
          </Link>
        ))}
      </div>
    </div>
  );
}
