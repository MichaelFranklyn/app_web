"use client";

import { Alert } from "@/components/Alert";
import { getButtonClasses } from "@/components/Button/Root/style";
import { PanelHeader } from "@/components/PanelHeader";
import { MyPlan } from "@/services/plan";
import { ArrowUpRight, Sparkles } from "lucide-react";

// Comparar planos é a vitrine pública, fora do sistema: link de verdade (<a>),
// não um botão que empurra o roteador — e em outra aba, porque quem está
// conferindo o teto de vendedores não quer perder a tela.
const compareClass = getButtonClasses({
  appearance: "outline",
  color: "neutral",
  size: "sm",
  isIconOnly: false,
  fullWidth: false,
  active: false,
  noPadding: false,
  noUppercase: true,
});

/**
 * O contrato em uma linha: qual plano, e o que fazer para mudar.
 *
 * Faixa, e não cartão: o nome do plano é uma palavra e o caminho para trocá-lo
 * é uma frase — num cartão inteiro sobrava espaço vazio ocupando o topo da tela
 * sem contar nada, e empurrava para baixo os números que a pessoa veio ver.
 */
export function PlanHeader({ plan }: { plan: MyPlan }) {
  return (
    <div className="flex flex-col gap-12">
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Plano da empresa</PanelHeader.Title>
            <PanelHeader.Description>
              O que está incluído no seu plano e quanto de cada limite já foi
              usado.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Alert.Root variant="warning" className="items-center">
        <Alert.Icon icon={Sparkles} />
        <Alert.Content>
          <Alert.Title>Plano {plan.label}</Alert.Title>
          <Alert.Description>
            Para mudar de plano, fale com o suporte.
          </Alert.Description>
        </Alert.Content>
        <a
          href="/precos"
          target="_blank"
          rel="noopener noreferrer"
          className={`${compareClass} shrink-0`}
        >
          Comparar planos
          <ArrowUpRight size={14} />
        </a>
      </Alert.Root>
    </div>
  );
}
