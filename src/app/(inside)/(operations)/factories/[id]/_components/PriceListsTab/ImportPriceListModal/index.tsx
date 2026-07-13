"use client";

import { Upload } from "lucide-react";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Stepper } from "@/components/Stepper";

import { StepDetails } from "./StepDetails";
import { StepPrices } from "./StepPrices";
import { StepProduct } from "./StepProduct";
import { StepReading } from "./StepReading";
import { StepResult } from "./StepResult";
import { StepSheet } from "./StepSheet";
import { StepTaxes } from "./StepTaxes";
import {
  ImportPriceListModalProps,
  useImportPriceListWizard,
} from "./useImportPriceListWizard";

export function ImportPriceListModal(props: ImportPriceListModalProps) {
  const {
    open,
    handleClose,
    step,
    setStep,
    stepValid,
    isLoading,
    result,
    handleImport,
    template,
    sheetStep,
    readingStep,
    productStep,
    pricesStep,
    taxesStep,
    detailsStep,
    resultStep,
  } = useImportPriceListWizard(props);

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          title="Importar tabela"
        >
          <Button.Icon icon={Upload} />
          <Button.Title>Importar</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="5xl">
        <Modal.Header
          title="Importar tabela de preço"
          description="Suba a planilha da fábrica: criamos a tabela, os níveis, os produtos e os preços."
        />

        <Modal.Body className="flex flex-col gap-16 py-24">
          {/* Depois de importado (result), a navegação trava no Resultado. */}
          <Stepper.Root
            current={step}
            onChange={(index) => {
              if (!result && !isLoading && index < 6) setStep(index);
            }}
          >
            <Stepper.Item label="Planilha">
              <StepSheet {...sheetStep} />
            </Stepper.Item>

            <Stepper.Item label="Leitura">
              {readingStep && <StepReading {...readingStep} />}
            </Stepper.Item>

            <Stepper.Item label="Produto">
              {productStep && <StepProduct {...productStep} />}
            </Stepper.Item>

            <Stepper.Item label="Preços">
              {pricesStep && <StepPrices {...pricesStep} />}
            </Stepper.Item>

            <Stepper.Item label="Impostos">
              {taxesStep && <StepTaxes {...taxesStep} />}
            </Stepper.Item>

            <Stepper.Item label="Tabela">
              <StepDetails {...detailsStep} />
            </Stepper.Item>

            <Stepper.Item label="Resultado">
              {resultStep && <StepResult {...resultStep} />}
            </Stepper.Item>
          </Stepper.Root>
        </Modal.Body>

        <Modal.Footer>
          {result ? (
            // Importação concluída: só resta fechar — reimportar exige reabrir o fluxo.
            <Modal.Close asChild>
              <Button.Root
                type="button"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
              >
                <Button.Title>Fechar</Button.Title>
              </Button.Root>
            </Modal.Close>
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
              {/* Assim que o mapeamento (produto + níveis) está pronto, salvar o
                  modelo independe do nome/vigência da tabela — fica disponível
                  do passo Preços em diante. */}
              {template.canSaveTemplateNow && (
                <Button.Root
                  type="button"
                  appearance="ghost"
                  color="neutral"
                  size="md"
                  noUppercase
                  loading={isLoading}
                  onClick={template.handleSaveTemplate}
                >
                  <Button.Title>
                    {template.activeTemplate
                      ? "Atualizar modelo"
                      : "Salvar como modelo"}
                  </Button.Title>
                </Button.Root>
              )}
              {step < 5 ? (
                <Button.Root
                  type="button"
                  appearance="solid"
                  color="amber"
                  size="md"
                  noUppercase
                  disabled={!stepValid[step]}
                  onClick={() => setStep((s) => s + 1)}
                >
                  <Button.Title>Próximo</Button.Title>
                </Button.Root>
              ) : (
                <Button.Root
                  type="button"
                  appearance="solid"
                  color="amber"
                  size="md"
                  noUppercase
                  loading={isLoading}
                  disabled={!stepValid[5]}
                  onClick={handleImport}
                >
                  <Button.Title>Importar tabela</Button.Title>
                </Button.Root>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
