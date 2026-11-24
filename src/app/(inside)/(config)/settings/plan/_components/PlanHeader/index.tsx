"use client";
import { Button } from "@/components/Button";

import { Alert } from "@/components/Alert";
import { PanelHeader } from "@/components/PanelHeader";
import { PAGE_HEADING } from "@/utils/modules";
import { MyPlan } from "@/services/plan";
import { ArrowUpRight, Sparkles } from "lucide-react";

/**
 * O contrato em uma linha: qual plano, e onde ver os outros.
 *
 * A frase aqui não pode depender da assinatura: este componente não a conhece,
 * e "cancele a assinatura atual" aparecia até para quem já tinha cancelado
 * (17/11/2026). Como trocar de plano é dito pela `SubscriptionSection`, que
 * sabe o estado.
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
            <PanelHeader.Heading {...PAGE_HEADING.plan}>
              Plano da empresa
            </PanelHeader.Heading>
            <PanelHeader.Description>
              O que está incluído no seu plano e quanto de cada limite já foi
              usado.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {/* Abaixo do desktop o botão desce e toma a linha: ao lado, espremia o
          texto em quatro linhas e sobrava espaço embaixo dele. Neutra, e não
          âmbar de aviso: dizer o plano não é alerta, e o amarelo no topo
          fazia a tela parecer com problema (crítica de configurações,
          23/11/2026). */}
      <Alert.Root
        variant="neutral"
        className="max-desktop:flex-wrap items-center"
      >
        <Alert.Icon icon={Sparkles} />
        <Alert.Content>
          <Alert.Title>Plano {plan.label}</Alert.Title>
          <Alert.Description>
            Veja o que muda nos outros planos.
          </Alert.Description>
        </Alert.Content>
        {/* Comparar planos é a vitrine pública, fora do sistema: em outra aba,
            porque quem está conferindo o teto de vendedores não quer perder a
            tela. */}
        <Button.Link
          href="/precos"
          external
          appearance="outline"
          color="neutral"
          size="sm"
          fullWidthBelowDesktop
          className="shrink-0"
        >
          <Button.Title>Comparar planos</Button.Title>
          <Button.Icon icon={ArrowUpRight} />
        </Button.Link>
      </Alert.Root>
    </div>
  );
}
