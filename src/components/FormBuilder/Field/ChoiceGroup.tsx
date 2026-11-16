import { Title } from "@/components/Title";
import React from "react";

interface ChoiceGroupProps {
  /** Nome do campo; dá os ids do rótulo e da mensagem de erro. */
  name: string;
  /** Rótulo já desenhado; recebe `id` = `${name}-label` do chamador. */
  label?: React.ReactNode;
  error?: string;
  className: string;
  children: React.ReactNode;
}

export const choiceLabelId = (name: string) => `${name}-label`;

/**
 * Moldura dos grupos de opções (checkbox, radio, switch) do FormBuilder.
 *
 * Cada opção tem o próprio label, mas o rótulo do GRUPO ("Dias de visita") e a
 * mensagem de erro ficavam soltos: o leitor de tela lia "Segunda, caixa de
 * seleção" sem dizer de que pergunta era nem que ela estava com erro. O
 * `role="group"` nomeia o conjunto e o `aria-describedby` lê o erro junto.
 */
export const ChoiceGroup = ({
  name,
  label,
  error,
  className,
  children,
}: ChoiceGroupProps) => (
  <div
    role="group"
    aria-labelledby={label ? choiceLabelId(name) : undefined}
    aria-describedby={error ? `${name}-error` : undefined}
    className={className}
  >
    {label}
    {children}
    {error && (
      <Title id={`${name}-error`} variant="micro" color="red">
        {error}
      </Title>
    )}
  </div>
);
