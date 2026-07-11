"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Stepper } from "@/components/Stepper";

import { StepColumns } from "./StepColumns";
import { StepFile } from "./StepFile";
import { StepResult } from "./StepResult";
import { StepReview } from "./StepReview";
import { useOrderImportWizard } from "./useOrderImportWizard";

interface Props {
  orderId: string;
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
 * lista, que cria o pedido antes de montar este wizard).
 */
export function OrderImportWizard({
  orderId,
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
    handleFiles,
    headerOptions,
    onHeaderChange,
    runPreview,
    confirmableCount,
    runConfirm,
    updateRow,
    canMap,
  } = useOrderImportWizard({ orderId, onImported, onBusyChange });

  return (
    <>
      <Modal.Body className="flex flex-col gap-16 py-24">
        <Stepper.Root
          current={step}
          onChange={(index) => {
            if (!result && !isLoading && index < 3) setStep(index);
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
              />
            )}
          </Stepper.Item>

          <Stepper.Item label="Revisão">
            <StepReview
              reviewRows={reviewRows}
              updateRow={updateRow}
              confirmableCount={confirmableCount}
            />
          </Stepper.Item>

          <Stepper.Item label="Resultado">
            {result && <StepResult result={result} />}
          </Stepper.Item>
        </Stepper.Root>
      </Modal.Body>

      <Modal.Footer>
        {result ? (
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            onClick={onClose}
          >
            <Button.Title>Fechar</Button.Title>
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
                disabled={isLoading}
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
                loading={isLoading}
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
