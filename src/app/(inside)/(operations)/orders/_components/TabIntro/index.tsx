"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { ReactNode } from "react";

interface Props {
  /** O que fazer nesta aba, em uma ou duas frases. */
  children: ReactNode;
  /** A ação da aba (ex.: faturar pelo XML), ao lado da instrução. */
  action?: ReactNode;
}

/**
 * A instrução de cada aba: o que está na lista e o que a pessoa faz com ela.
 * A tela antiga empilhava as duas listas e deixava a ação de uma no topo da
 * outra; aqui cada aba diz o próprio passo, junto do botão que o executa.
 */
export function TabIntro({ children, action }: Props) {
  return (
    <Card.Root inset tone="muted">
      <Card.Body
        padding="sm"
        className="tablet:flex-row tablet:items-center tablet:justify-between flex flex-col gap-10"
      >
        <Title variant="body-sm" color="secondary">
          {children}
        </Title>
        {action && <div className="shrink-0">{action}</div>}
      </Card.Body>
    </Card.Root>
  );
}
