"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useRef } from "react";
import { MyCompany, UpdateCompanyInput } from "../../interface";
import { useSaveCompany } from "../../useSaveCompany";

interface Props {
  company: MyCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  title: string;
  description: string;
  steps: FormStepSchema[];
  initialData: Record<string, unknown>;
  normalize: (
    data: Record<string, unknown>,
    company: MyCompany
  ) => UpdateCompanyInput;
  size?: "sm" | "md" | "lg";
}

/**
 * Edição de um assunto dos dados da empresa. Todos gravam pela mesma
 * `updateCompany` com input parcial, então o que muda entre eles é só a receita
 * (steps + normalize) — daí um modal em vez de três iguais.
 */
export function EditCompanyModal({
  company,
  open,
  onOpenChange,
  onSaved,
  title,
  description,
  steps,
  initialData,
  normalize,
  size = "md",
}: Props) {
  const formRef = useRef<FormBuilderRef>(null);
  const { save, isSaving } = useSaveCompany(company.id, () => {
    onOpenChange(false);
    onSaved();
  });

  const handleSubmit = async (data: Record<string, unknown>) => {
    const input = normalize(data, company);

    // Nada mudou: fechar sem ir ao servidor é mais honesto que um "salvo".
    if (Object.keys(input).length === 0) {
      onOpenChange(false);
      return;
    }

    await save(input);
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size={size}>
        <Modal.Header title={title} description={description} />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isSaving}
            initialData={initialData}
            unstyled
          />
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isSaving}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isSaving}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Salvar alterações</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
