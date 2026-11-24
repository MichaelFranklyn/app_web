"use client";

import { Title } from "@/components/Title";
import type { ReactNode } from "react";

interface CardFieldProps {
  label: string;
  /**
   * Texto ou peça de texto inline (ex.: `<DocumentNumber>`). Vai dentro do
   * `Title variant="body"`; vazio vira "Não informado".
   */
  value?: ReactNode;
  /**
   * Valor que já traz o próprio desenho (`<TextLink>`, `<Badge>`): entra como
   * está, sem o `Title` em volta. Tem precedência sobre `value`.
   */
  children?: ReactNode;
}

/**
 * Um dado da ficha com o rótulo EM CIMA e o valor embaixo — o padrão da ficha
 * em DUAS colunas (`Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}`).
 * Ficha numa coluna só usa `Card.Item variant="stat"` (rótulo ao lado).
 * Decisão do usuário em 24/11/2026.
 *
 * Campo vazio diz "Não informado" em tom apagado, e não um "—": o traço
 * sozinho não diz se falta o dado ou se a tela quebrou.
 */
export function Field({ label, value, children }: CardFieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Title variant="micro" color="muted">
        {label}
      </Title>
      {children ??
        (value ? (
          <Title variant="body" className="break-words">
            {value}
          </Title>
        ) : (
          <Title variant="body" color="muted">
            Não informado
          </Title>
        ))}
    </div>
  );
}
