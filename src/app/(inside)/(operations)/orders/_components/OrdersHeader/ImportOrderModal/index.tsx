"use client";

import { Upload } from "lucide-react";

import { Button } from "@/components/Button";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";

import { OrderImportWizard } from "../../../[id]/_components/OrderItemsTable/ImportOrderModal/OrderImportWizard";
import { ImportOrderModalProps, useImportOrder } from "./useImportOrder";

/**
 * Cria um pedido (vendedor → fábrica → cliente → data) e já importa os itens
 * a partir do arquivo da fábrica, num fluxo só — para a lista /orders, onde
 * ainda não existe pedido. Reaproveita o OrderImportWizard.
 */
export function ImportOrderModal(props: ImportOrderModalProps) {
  const {
    open,
    handleClose,
    orderId,
    setBusy,
    refetchList,
    formRef,
    formSteps,
    handleCreate,
    isLoading,
  } = useImportOrder(props);

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Upload} />
          <Button.Title>Importar pedido</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="5xl">
        <Modal.Header
          title="Importar pedido"
          description={
            orderId
              ? "Suba o arquivo da fábrica (PDF ou Excel): casamos os produtos e você confere antes de gravar."
              : "Escolha o vendedor, a fábrica e o cliente para criar o pedido. Em seguida você sobe o arquivo."
          }
        />

        {orderId ? (
          <OrderImportWizard
            orderId={orderId}
            onImported={refetchList}
            onBusyChange={setBusy}
            onClose={() => handleClose(false)}
          />
        ) : (
          <>
            <Modal.Body>
              <FormBuilder
                ref={formRef}
                steps={formSteps}
                onSubmit={handleCreate}
                loading={isLoading}
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
                loading={isLoading}
                onClick={() => formRef.current?.submitForm()}
              >
                <Button.Title>Continuar</Button.Title>
              </Button.Root>
            </Modal.Footer>
          </>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
