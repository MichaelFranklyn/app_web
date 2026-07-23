"use client";

import { Button } from "@/components/Button";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Plus } from "lucide-react";

import { AddProductModalProps, useAddProduct } from "./useAddProduct";

const STEP_DESCRIPTION = [
  "Comece pelos dados do produto: código, nome, categoria e embalagem.",
  "Informe os impostos que incidem sobre o produto. Este passo é opcional.",
  "Informe o preço em cada tabela e nível. Este passo é opcional.",
];

export function AddProductModal(props: AddProductModalProps) {
  const {
    open,
    handleClose,
    formRef,
    steps,
    step,
    isLastStep,
    goNext,
    goPrev,
    handleSubmit,
    isLoading,
  } = useAddProduct(props);

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo produto</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="2xl">
        <Modal.Header
          title="Novo produto"
          description={STEP_DESCRIPTION[step] ?? STEP_DESCRIPTION[0]}
        />
        <Modal.Body>
          <FormBuilder.Stepper steps={steps} currentStepIndex={step} />

          <FormBuilder
            ref={formRef}
            steps={steps}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
        </Modal.Body>
        <Modal.Footer>
          {step === 0 ? (
            <Modal.Close asChild>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={isLoading}
              >
                <Button.Title>Cancelar</Button.Title>
              </Button.Root>
            </Modal.Close>
          ) : (
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
              onClick={goPrev}
            >
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          )}

          {isLastStep ? (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              loading={isLoading}
              onClick={() => formRef.current?.submitForm()}
            >
              <Button.Title>Cadastrar</Button.Title>
            </Button.Root>
          ) : (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              disabled={isLoading}
              onClick={goNext}
            >
              <Button.Title>Avançar</Button.Title>
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
