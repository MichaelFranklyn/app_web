"use client";

import { Title } from "@/components/Title";
import type { ReactNode } from "react";

interface Props {
  label: string;
  /** Texto ou peça de texto (ex.: `<DocumentNumber>`, que não quebra linha). */
  value: ReactNode;
}

/**
 * Rótulo em cima, valor embaixo. Campo vazio diz "Não informado" em tom
 * apagado, e não um "—": o traço sozinho não diz se falta o dado ou se a
 * tela quebrou (crítica de configurações, 23/11/2026). Quem preenche é o
 * botão de editar do card.
 */
export function DataField({ label, value }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Title variant="micro" color="muted">
        {label}
      </Title>
      {value ? (
        <Title variant="body">{value}</Title>
      ) : (
        <Title variant="body" color="muted">
          Não informado
        </Title>
      )}
    </div>
  );
}
