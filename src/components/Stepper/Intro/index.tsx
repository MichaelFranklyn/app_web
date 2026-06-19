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
export function StepperIntro({ step, total, title, children }: StepperIntroProps) {
  return (
    <div className="flex flex-col gap-2 rounded-(--r-lg) border border-(--border) bg-(--bg2) px-12 py-10">
      <Title variant="caption" color="amber" weight="medium">
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
