"use client";

import { ArrowLeft, Upload } from "lucide-react";

import { Button } from "@/components/Button";
import { FormBuilder } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Stepper } from "@/components/Stepper";

import { OrderImportWizard } from "../../../../_components/OrderImportWizard";
import { ImportModeChoice } from "./ImportModeChoice";
import { leadingSteps, modalStep, trailSteps } from "./steps";
import { SheetDropzone } from "./SheetDropzone";
import { ImportOrderModalProps, useImportOrder } from "./useImportOrder";

/**
 * Importa um pedido para a lista /orders, onde ainda não existe pedido.
 *
 * São dois caminhos, escolhidos na entrada. A **ficha do sistema** não pergunta
 * nada: ela já sabe de quem é o pedido, e o vendedor cai direto na conferência
 * dos itens. **Outro arquivo** (PDF ou Excel da fábrica) não sabe, e por isso
 * pede vendedor → fábrica → cliente → data antes.
 *
 * Em qualquer um deles o pedido SÓ é criado na confirmação final do wizard,
 * junto com os itens — desistir no meio não deixa pedido vazio para trás.
 */
export function ImportOrderModal(props: ImportOrderModalProps) {
  const {
    open,
    handleClose,
    deferred,
    ipiInOrder,
    setIsBusy,
    refetchList,
    formRef,
    formSteps,
    handleDetailsValid,
    sheetRows,
    handleSheetFile,
    readingSheet,
    mode,
    setMode,
    goToLeadingStep,
    detailsDraft,
    sheetSummary,
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
            deferred
              ? sheetRows
                ? "Confira o que a ficha diz e confirme — o pedido é criado agora, com os preços de hoje."
                : "Suba o arquivo da fábrica (PDF ou Excel): casamos os produtos e você confere antes de gravar. O pedido é criado ao confirmar."
              : mode === "sheet"
                ? "Suba a ficha preenchida: o sistema lê tudo e leva você direto aos itens."
                : mode === "file"
                  ? "Diga de quem é o pedido. O arquivo da fábrica vem no passo seguinte."
                  : "Qual arquivo você tem na mão?"
          }
        />

        {deferred ? (
          <OrderImportWizard
            deferred={deferred}
            initialRows={sheetRows ?? undefined}
            ipiInOrder={ipiInOrder}
            onImported={refetchList}
            onBusyChange={setIsBusy}
            onClose={() => handleClose(false)}
            // A faixa continua de onde o modal parou: os passos daqui entram
            // como cumpridos, e a contagem é a do caminho inteiro.
            leadingSteps={leadingSteps(mode ?? "file")}
            sheetSummary={sheetSummary}
            onLeadingStep={goToLeadingStep}
          />
        ) : mode === null ? (
          <>
            <Modal.Body>
              {/* Sem faixa aqui: antes da escolha não se sabe nem quantos
                  passos o caminho tem. */}
              <ImportModeChoice onChoose={setMode} />
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
            </Modal.Footer>
          </>
        ) : mode === "sheet" ? (
          <>
            <Modal.Body className="flex flex-col gap-16 py-24">
              <Stepper.Trail
                steps={trailSteps(mode)}
                current={modalStep(mode)}
                centered
              />
              <SheetDropzone onFile={handleSheetFile} loading={readingSheet} />
            </Modal.Body>
            <Modal.Footer>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={readingSheet}
                onClick={() => setMode(null)}
              >
                <Button.Icon icon={ArrowLeft} />
                <Button.Title>Voltar</Button.Title>
              </Button.Root>
            </Modal.Footer>
          </>
        ) : (
          <>
            <Modal.Body className="flex flex-col gap-16 py-24">
              <Stepper.Trail
                steps={trailSteps(mode)}
                current={modalStep(mode)}
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
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                onClick={() => setMode(null)}
              >
                <Button.Icon icon={ArrowLeft} />
                <Button.Title>Voltar</Button.Title>
              </Button.Root>
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
