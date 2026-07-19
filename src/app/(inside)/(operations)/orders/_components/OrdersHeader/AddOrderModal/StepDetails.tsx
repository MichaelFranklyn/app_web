"use client";

import { RefObject } from "react";

import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";

interface Props {
  formRef: RefObject<FormBuilderRef | null>;
  formSteps: FormStepSchema[];
  /** Chamado com os dados quando o passo é válido (avança para os itens). */
  onValid: (data: Record<string, unknown>) => void;
}

// Pré-seleciona "Pedido": o caminho comum é criar pedido, não orçamento.
const INITIAL_DATA = { orderKind: "order" };

export function StepDetails({ formRef, formSteps, onValid }: Props) {
  return (
    <FormBuilder
      ref={formRef}
      steps={formSteps}
      initialData={INITIAL_DATA}
      onSubmit={onValid}
      unstyled
    />
  );
}
