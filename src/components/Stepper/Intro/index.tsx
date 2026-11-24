"use client";

import { ReactNode } from "react";

import { Title } from "@/components/Title";

interface StepperIntroProps {
  step: number;
  total: number;
  title: string;
  children: ReactNode;
}

/**
 * Cabeçalho explicativo de cada passo de um wizard.
 * Linguagem simples, para quem nunca usou um sistema: diz o que fazer
 * agora e o que o sistema já fez sozinho.
 */
export function StepperIntro({
  step,
  total,
  title,
  children,
}: StepperIntroProps) {
  return (
    // Texto solto, sem caixa: o wizard já mora num card (ou num modal), e a
    // caixa de borda dentro dele era um card dentro do card — mais uma moldura
    // para o olho atravessar antes do que importa (crítica de configurações,
    // 23/11/2026).
    <div className="flex flex-col gap-2">
      <Title variant="caption" color="secondary" weight="medium">
        Passo {step} de {total}
      </Title>
      <Title variant="body-sm" weight="medium">
        {title}
      </Title>
      <Title variant="body-sm" color="muted">
        {children}
      </Title>
    </div>
  );
}
