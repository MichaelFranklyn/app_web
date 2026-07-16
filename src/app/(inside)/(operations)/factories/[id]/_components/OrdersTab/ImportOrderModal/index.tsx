"use client";

import { Upload } from "lucide-react";

import { Button } from "@/components/Button";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";

import { OrderImportWizard } from "../../../../../_components/OrderImportWizard";
import {
  ImportFactoryOrderProps,
  useImportFactoryOrder,
} from "./useImportFactoryOrder";

/**
 * "Importar pedido" da aba de pedidos da fábrica — MESMO fluxo da lista
 * /orders, com a fábrica fixa: escolhe o vínculo vendedor→cliente e sobe o
 * arquivo; o pedido SÓ é criado na confirmação final, junto com os itens.
 */
export function ImportOrderModal(props: ImportFactoryOrderProps) {
  const {
    open,
    handleClose,
    deferred,
    ipiInOrder,
    setIsBusy,
    formRef,
    formSteps,
    handleDetailsValid,
  } = useImportFactoryOrder(props);

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
            deferred
              ? "Suba o arquivo da fábrica (PDF ou Excel): casamos os produtos e você confere antes de gravar. O pedido é criado ao confirmar."
              : "Escolha o vínculo vendedor → cliente do pedido. Em seguida você sobe o arquivo."
          }
        />

        {deferred ? (
          <OrderImportWizard
            deferred={deferred}
            ipiInOrder={ipiInOrder}
            onImported={props.onChanged}
            onBusyChange={setIsBusy}
            onClose={() => handleClose(false)}
          />
        ) : (
          <>
            <Modal.Body>
              <FormBuilder
                ref={formRef}
                steps={formSteps}
                onSubmit={handleDetailsValid}
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
                <Button.Title>Continuar</Button.Title>
              </Button.Root>
            </Modal.Footer>
          </>
        )}
      </Modal.Content>
    </Modal.Root>
  );
}
