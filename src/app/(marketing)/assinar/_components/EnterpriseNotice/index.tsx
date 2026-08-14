import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import Link from "next/link";
import { MarketingPlan, TRIAL_DAYS } from "../../../plans";

/**
 * O Enterprise não passa pelo cartão: o valor é fechado em conversa, e um
 * checkout que inventasse um número aqui prometeria o que ninguém combinou.
 *
 * Enquanto não há canal de contato declarado (`legal.ts`), o caminho oferecido
 * é o teste — dá para avaliar o sistema inteiro enquanto a conversa acontece.
 */
export function EnterpriseNotice({ plan }: { plan: MarketingPlan }) {
  return (
    <div className="flex max-w-[640px] flex-col gap-16">
      <Title variant="heading-md">Plano {plan.label}</Title>

      <Title variant="body-md" color="secondary">
        Este plano tem a mesma matriz de recursos do Pro, sem teto de
        vendedores, fábricas ou clientes. O valor depende do tamanho da operação
        e das condições combinadas, então ele é fechado em conversa e não passa
        por esta tela de pagamento.
      </Title>

      <Title variant="body-md" color="secondary">
        Comece pelo teste de {TRIAL_DAYS} dias: dá para avaliar o sistema
        inteiro enquanto acertamos o contrato.
      </Title>

      <div className="flex flex-wrap gap-12">
        <Link href="/signup">
          <Button.Root color="amber">
            <Button.Title>Criar conta de teste</Button.Title>
          </Button.Root>
        </Link>

        <Link href="/precos">
          <Button.Root appearance="ghost">
            <Button.Title>Comparar os planos</Button.Title>
          </Button.Root>
        </Link>
      </div>
    </div>
  );
}
