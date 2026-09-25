"use client";

import { RefObject, useMemo } from "react";

import { Card } from "@/components/Card";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";

interface Props {
  formRef: RefObject<FormBuilderRef | null>;
  formSteps: FormStepSchema[];
  /** Chamado com os dados quando o formulário é válido (cria o pedido). */
  onValid: (data: Record<string, unknown>) => void;
  /** Valores iniciais além do padrão (a visita já abre com a data de hoje). */
  initialData?: Record<string, unknown>;
  /** O vendedor mexeu nos dados (conta para perguntar antes de sair). */
  onDirtyChange?: (isDirty: boolean) => void;
}

// Pré-seleciona "Pedido": o caminho comum é criar pedido, não orçamento.
const INITIAL_DATA = { orderKind: "order" };

export function OrderDetailsCard({
  formRef,
  formSteps,
  onValid,
  initialData,
  onDirtyChange,
}: Props) {
  // Estável entre renders: o formulário não pode se reiniciar a cada digitação.
  const initial = useMemo(
    () => ({ ...INITIAL_DATA, ...initialData }),
    [initialData]
  );

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="bold">
          Dados do pedido
        </Card.Header.Title>
        <Card.Header.Description>
          Quem vende, para quem e em que condições. Os itens abaixo são
          liberados assim que a fábrica fica definida.
        </Card.Header.Description>
      </Card.Header>
      <Card.Body>
        <FormBuilder
          ref={formRef}
          steps={formSteps}
          initialData={initial}
          onSubmit={onValid}
          onDirtyChange={onDirtyChange}
          unstyled
        />
      </Card.Body>
    </Card.Root>
  );
}
