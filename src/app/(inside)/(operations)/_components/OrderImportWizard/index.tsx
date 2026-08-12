"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Stepper } from "@/components/Stepper";

import { StepColumns } from "./StepColumns";
import { StepFile } from "./StepFile";
import { StepResult } from "./StepResult";
import { StepReview } from "./StepReview";
import {
  DeferredOrderTarget,
  useOrderImportWizard,
} from "./useOrderImportWizard";

export type { DeferredOrderTarget } from "./useOrderImportWizard";

interface Props {
  /** Pedido existente (detalhe do pedido). Ausente → informe `deferred`. */
  orderId?: string | null;
  /** Fluxo em que o pedido só é criado na confirmação final. */
  deferred?: DeferredOrderTarget;
  /** Fábrica cobra IPI no pedido: habilita mapear/editar a alíquota por item. */
  ipiInOrder?: boolean;
  /** Disparado após gravar itens — recarrega a tabela e os totais do pedido. */
  onImported: () => void;
  /** Informa o pai sobre carregamento em curso (para travar o fechamento do modal). */
  onBusyChange?: (busy: boolean) => void;
  /** Fecha o modal (botão "Fechar" no passo de resultado). */
  onClose: () => void;
}

/**
 * Núcleo do wizard de importação de itens de pedido (Arquivo → Colunas →
 * Revisão → Resultado). Renderiza Modal.Body + Modal.Footer; quem fornece o
 * Modal.Root/Content/Header é o componente que o usa (detalhe do pedido ou a
 * lista e a fábrica, que coletam os dados e só criam o pedido na confirmação).
 */
export function OrderImportWizard({
  orderId,
  deferred,
  ipiInOrder,
  onImported,
  onBusyChange,
  onClose,
}: Props) {
  const {
    step,
    setStep,
    file,
    matrix,
    data,
    headerIndex,
    mapping,
    setMapping,
    reviewRows,
    result,
    isLoading,
    isRedirecting,
    viewOrder,
    handleFiles,
    headerOptions,
    onHeaderChange,
    runPreview,
    confirmableCount,
    skippedItems,
    runConfirm,
    updateRow,
    canMap,
    ipiInOrder: ipiEnabled,
    workbook,
    sheetName,
    sheetOptions,
    onSheetChange,
    unreadableRows,
  } = useOrderImportWizard({
    orderId,
    deferred,
    ipiInOrder,
    onImported,
    onBusyChange,
  });

  return (
    <>
      <Modal.Body className="flex flex-col gap-16 py-24">
        <Stepper.Root
          current={step}
          onChange={(index) => {
            if (!result && !isLoading && !isRedirecting && index < 3)
              setStep(index);
          }}
        >
          <Stepper.Item label="Arquivo">
            <StepFile
              file={file}
              onFiles={handleFiles}
              ready={Boolean(matrix && data)}
            />
          </Stepper.Item>

          <Stepper.Item label="Colunas">
            {data && (
              <StepColumns
                data={data}
                headerOptions={headerOptions}
                headerIndex={headerIndex}
                onHeaderChange={onHeaderChange}
                mapping={mapping}
                setMapping={setMapping}
                ipiInOrder={ipiEnabled}
                sheetOptions={sheetOptions}
                sheetName={sheetName}
                onSheetChange={onSheetChange}
                showSheetSelector={Boolean(
                  workbook && workbook.sheetNames.length > 1
                )}
                unreadableRows={unreadableRows}
              />
            )}
          </Stepper.Item>

          <Stepper.Item label="Revisão">
            <StepReview
              reviewRows={reviewRows}
              updateRow={updateRow}
              confirmableCount={confirmableCount}
              skippedItems={skippedItems}
              ipiInOrder={ipiEnabled}
              unreadableRows={unreadableRows}
            />
          </Stepper.Item>

          <Stepper.Item label="Resultado">
            {result && <StepResult result={result} skipped={skippedItems} />}
          </Stepper.Item>
        </Stepper.Root>
      </Modal.Body>

      <Modal.Footer>
        {result ? (
          // Com o pedido gravado o caminho é a página dele. Só chegamos aqui com
          // `viewOrder` quando algum item falhou ao gravar (a lista de erros
          // acima é a razão de não redirecionar sozinho) — o botão leva o
          // usuário para lá em vez de deixá-lo na lista.
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isRedirecting}
            onClick={viewOrder ?? onClose}
          >
            <Button.Title>{viewOrder ? "Ver pedido" : "Fechar"}</Button.Title>
          </Button.Root>
        ) : (
          <>
            {step > 0 && (
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={isLoading || isRedirecting}
                onClick={() => setStep((s) => s - 1)}
              >
                <Button.Title>Voltar</Button.Title>
              </Button.Root>
            )}
            {step === 0 && (
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                disabled={!data || isLoading}
                onClick={() => setStep(1)}
              >
                <Button.Title>Próximo</Button.Title>
              </Button.Root>
            )}
            {step === 1 && (
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                loading={isLoading}
                disabled={!canMap}
                onClick={runPreview}
              >
                <Button.Title>Casar produtos</Button.Title>
              </Button.Root>
            )}
            {step === 2 && (
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                // O loading só termina quando a página do pedido já carregou —
                // sem o flash de "pronto" com a próxima tela em branco.
                loading={isLoading || isRedirecting}
                disabled={confirmableCount === 0}
                onClick={runConfirm}
              >
                <Button.Title>
                  Importar {confirmableCount} item(ns)
                </Button.Title>
              </Button.Root>
            )}
          </>
        )}
      </Modal.Footer>
    </>
  );
}
