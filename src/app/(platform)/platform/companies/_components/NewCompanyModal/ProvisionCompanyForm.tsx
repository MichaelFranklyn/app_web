"use client";

import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { RefObject } from "react";
import { FORM_STEPS } from "./utils";

interface Props {
  /** O botão de enviar mora no rodapé do modal, fora deste componente — daí a
   * ref vir de cima em vez de ser criada aqui. */
  formRef: RefObject<FormBuilderRef | null>;
  onSubmit: (data: Record<string, unknown>) => void;
  isLoading: boolean;
}

/** Formulário de provisionamento (empresa + primeiro responsável). Render puro:
 * a mutation vive no `useProvisionCompany`. */
export function ProvisionCompanyForm({ formRef, onSubmit, isLoading }: Props) {
  return (
    <FormBuilder
      ref={formRef}
      steps={FORM_STEPS}
      onSubmit={onSubmit}
      loading={isLoading}
      unstyled
    />
  );
}
