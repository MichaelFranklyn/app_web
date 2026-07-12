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

export function StepDetails({ formRef, formSteps, onValid }: Props) {
  return (
    <FormBuilder ref={formRef} steps={formSteps} onSubmit={onValid} unstyled />
  );
}
