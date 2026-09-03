"use client";

import { Upload } from "lucide-react";

import { Button } from "@/components/Button";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Stepper } from "@/components/Stepper";

import { OrderImportWizard } from "../../../../../_components/OrderImportWizard";
import { FILE_STEPS } from "../../../../../_components/OrderImportWizard/steps";
import {
  ImportFactoryOrderProps,
  useImportFactoryOrder,
} from "./useImportFactoryOrder";

/** A trilha daqui: sem "Escolha" — esta entrada é só de arquivo de fábrica. */
const TRAIL = ["Informações", ...FILE_STEPS];

/**
 * "Importar pedido" da aba de pedidos da fábrica — MESMO fluxo da lista
 * /orders, com a fábrica fixa: escolhe o vínculo vendedor→cliente e sobe o
 * arquivo; o pedido SÓ é criado na confirmação final, junto com os itens.
 *
 * A faixa de passos é a mesma da lista, atravessando este modal e o wizard: o
 * "Informações" daqui entra como cumprido e o wizard continua a contagem, para
 * quem está importando ver quanto falta até o fim — e não até o fim de um
 * componente que ele não sabe que existe.
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
    goToLeadingStep,
    detailsDraft,
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
            leadingSteps={TRAIL.slice(0, 1)}
            onLeadingStep={goToLeadingStep}
          />
        ) : (
          <>
            <Modal.Body className="flex flex-col gap-16 py-24">
              <Stepper.Trail
                steps={TRAIL.map((label) => ({ label }))}
                current={0}
                centered
              />
              <FormBuilder
                ref={formRef}
                steps={formSteps}
                initialData={detailsDraft}
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
