"use client";

import { Title } from "@/components/Title";
import { ReactNode } from "react";

interface Props {
  number: number;
  title: string;
  /** Uma linha do que esta escolha muda — dita antes da escolha. */
  hint?: string;
  children: ReactNode;
}

/** Um bloco da configuração da semana: número, pergunta e a escolha. Numerado
 * para a pessoa saber onde está e quanto falta — são poucas perguntas, mas
 * todas de uma vez numa tela só. */
export function SetupSection({ number, title, hint, children }: Props) {
  return (
    <section className="flex gap-12">
      <span
        aria-hidden
        className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-(--amber-bg) text-(--amber)"
      >
        <Title variant="body-xs" weight="semibold" as="span">
          {number}
        </Title>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Title variant="body-sm" weight="semibold">
            {title}
          </Title>
          {hint && (
            <Title variant="body-xs" color="muted">
              {hint}
            </Title>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
