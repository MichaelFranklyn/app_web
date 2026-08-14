"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";
import { MarketingPlan, TRIAL_DAYS } from "../../../plans";
import { ChargeOutcome } from "../../interface";

/**
 * O fim do fluxo: aprovado ou recusado.
 *
 * No sucesso, o próximo passo é criar a conta — porque hoje a assinatura é
 * simulada e quem entra no sistema entra pelo teste. Quando o gateway real
 * chegar, é aqui que a conta passa a nascer já no plano contratado.
 */
export function ResultStep({
  outcome,
  plan,
  onRetry,
}: {
  outcome: ChargeOutcome;
  plan: MarketingPlan;
  onRetry: () => void;
}) {
  if (outcome === "declined") {
    return (
      <div className="flex flex-col items-start gap-16 rounded-(--radius-md) border border-(--red-bd) bg-(--red-bg) p-24">
        <CircleX size={32} className="text-(--red)" />

        <Title variant="heading-md">Pagamento recusado</Title>

        <Title variant="body-sm" color="secondary" className="max-w-[52ch]">
          O cartão foi recusado pela operadora (simulação). Confira os dados ou
          use outro cartão — nada foi cobrado.
        </Title>

        <Button.Root color="amber" onClick={onRetry}>
          <Button.Title>Tentar outro cartão</Button.Title>
        </Button.Root>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-16 rounded-(--radius-md) border border-(--green-bd) bg-(--green-bg) p-24">
      <CircleCheck size={32} className="text-(--green)" />

      <Title variant="heading-md">Assinatura simulada com sucesso</Title>

      <Title variant="body-sm" color="secondary" className="max-w-[56ch]">
        Em produção, o plano {plan.label} já estaria ativo nesta etapa e você
        seguiria direto para o sistema. Como esta é uma simulação, nada foi
        cobrado e nenhuma assinatura foi criada.
      </Title>

      <Title variant="body-sm" color="secondary" className="max-w-[56ch]">
        Para usar o sistema agora, crie a conta de teste: são {TRIAL_DAYS} dias
        com tudo liberado, sem cartão.
      </Title>

      <div className="flex flex-wrap gap-12">
        <Link href="/signup">
          <Button.Root color="amber">
            <Button.Title>Criar conta de teste</Button.Title>
          </Button.Root>
        </Link>

        <Link href="/precos">
          <Button.Root appearance="ghost">
            <Button.Title>Ver os planos</Button.Title>
          </Button.Root>
        </Link>
      </div>
    </div>
  );
}
