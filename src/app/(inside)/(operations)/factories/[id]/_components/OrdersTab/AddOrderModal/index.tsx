"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/Button";
import { FormBuilder, FormStepSchema } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";

import { StepItems } from "../../../../../_shared/orderDraftItems";
import { AddFactoryOrderProps, useAddFactoryOrder } from "./useAddFactoryOrder";

export function AddOrderModal(props: AddFactoryOrderProps) {
  const {
    open,
    handleClose,
    step,
    formRef,
    formSteps,
    handleDetailsValid,
    goToDetails,
    handleCreate,
    draft,
    paymentMinimum,
    freeFreight,
    isLoading,
  } = useAddFactoryOrder(props);

  // Passos só para o indicador visual (o conteúdo é renderizado à parte).
  const wizardSteps: FormStepSchema[] = useMemo(
    () => [
      { id: "details", title: "Dados do pedido", sections: [] },
      { id: "items", title: "Itens (opcional)", sections: [] },
    ],
    []
  );

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo pedido</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="2xl">
        <Modal.Header
          title="Novo pedido"
          description={
            step === 0
              ? "Selecione o vínculo vendedor-cliente desta fábrica."
              : "Adicione os itens do pedido. Você pode pular esta etapa e incluí-los depois."
          }
        />

        <Modal.Body>
          <FormBuilder.Stepper steps={wizardSteps} currentStepIndex={step} />

          {/* Ambos os passos ficam montados para preservar o estado ao navegar. */}
          <div className={step === 0 ? "" : "hidden"}>
            <FormBuilder
              ref={formRef}
              steps={formSteps}
              initialData={{ orderKind: "order" }}
              onSubmit={handleDetailsValid}
              unstyled
            />
          </div>
          <div className={step === 1 ? "" : "hidden"}>
            <StepItems
              draft={draft}
              minimum={paymentMinimum}
              freeFreight={freeFreight}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          {step === 0 ? (
            <>
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
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                onClick={() => formRef.current?.submitForm()}
              >
                <Button.Title>Avançar</Button.Title>
              </Button.Root>
            </>
          ) : (
            <>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={isLoading}
                onClick={goToDetails}
              >
                <Button.Title>Voltar</Button.Title>
              </Button.Root>
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                loading={isLoading}
                onClick={handleCreate}
              >
                <Button.Title>
                  {draft.items.length > 0
                    ? `Criar pedido com ${draft.items.length} ${draft.items.length === 1 ? "item" : "itens"}`
                    : "Criar pedido"}
                </Button.Title>
              </Button.Root>
            </>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
