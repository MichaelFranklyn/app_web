"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Info, Plus } from "lucide-react";

import { AddSellerModalProps, useAddSeller } from "./useAddSeller";

export function AddSellerModal(props: AddSellerModalProps) {
  const {
    open,
    handleOpenChange,
    isFirstStep,
    isLastStep,
    formRef,
    formSteps,
    handleSubmit,
    handleNext,
    handlePrev,
    isLoading,
  } = useAddSeller(props);

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="md">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo Vendedor</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Cadastrar vendedor"
          description="Selecione um usuário existente para pré-preencher os dados, ou preencha manualmente."
        />

        <Modal.Body>
          {isFirstStep && (
            <Alert.Root variant="info" className="mb-16">
              <Alert.Icon icon={Info} />
              <Alert.Content>
                <Alert.Description>
                  Se o vendedor já tiver uma conta no sistema, selecione o
                  usuário para vinculá-lo — nome e e-mail serão preenchidos
                  automaticamente no próximo passo. Caso contrário, clique em{" "}
                  <strong>Próximo</strong> e preencha os dados manualmente.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}
          <FormBuilder
            ref={formRef}
            steps={formSteps}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
        </Modal.Body>

        <Modal.Footer>
          {isFirstStep ? (
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
              onClick={handlePrev}
            >
              <Button.Title>← Voltar</Button.Title>
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
              <Button.Title>Cadastrar vendedor</Button.Title>
            </Button.Root>
          ) : (
            <Button.Root
              type="button"
              appearance="solid"
              color="amber"
              size="md"
              noUppercase
              disabled={isLoading}
              onClick={handleNext}
            >
              <Button.Title>Próximo →</Button.Title>
            </Button.Root>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
