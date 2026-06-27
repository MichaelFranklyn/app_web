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
    result,
    isLoading,
    file,
    extracting,
    handleFiles,
    matrix,
    data,
    templateApplied,
    workbook,
    sheetName,
    sheetOptions,
    handleSheetChange,
    headerOptions,
    headerIndex,
    applyHeader,
    unreadable,
    mapping,
    setMapping,
    ncmChoice,
    setNcmChoice,
    distinctUnits,
    distinctPacks,
    unitLabels,
    packLabels,
    unitRecon,
    setUnitFinal,
    packRecon,
    setPackFinal,
    tierColumns,
    setTierColumns,
    pricesPerUnit,
    setPricesPerUnit,
    ipiChoice,
    handleIpiChoice,
    ipiAsFraction,
    setIpiAsFraction,
    taxColumns,
    setTaxColumns,
    validTaxesCount,
    stMva,
    handleStMvaChange,
    taxesAsFraction,
    setTaxesAsFraction,
    listName,
    setListName,
    region,
    setRegion,
    validFrom,
    setValidFrom,
    validUntil,
    setValidUntil,
    skippedRows,
    importableRows,
    defaultedCount,
    skipped,
    defaultedPack,
    activeTemplate,
    handleSaveTemplate,
    stepValid,
    handleImport,
    canSaveTemplateNow,
  } = useImportPriceListWizard(props);

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Upload} />
          <Button.Title>Importar tabela</Button.Title>
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
              <StepSheet
                file={file}
                extracting={extracting}
                onFiles={handleFiles}
                ready={Boolean(matrix && data)}
                templateApplied={templateApplied}
              />
            </Stepper.Item>

            <Stepper.Item label="Leitura">
              {matrix && data && (
                <StepReading
                  matrix={matrix}
                  data={data}
                  workbook={workbook}
                  sheetName={sheetName}
                  sheetOptions={sheetOptions}
                  onSheetChange={handleSheetChange}
                  headerOptions={headerOptions}
                  headerIndex={headerIndex}
                  applyHeader={applyHeader}
                  unreadable={unreadable}
                />
              )}
            </Stepper.Item>

            <Stepper.Item label="Produto">
              {data && (
                <StepProduct
                  headers={data.headers}
                  mapping={mapping}
                  setMapping={setMapping}
                  ncmChoice={ncmChoice}
                  setNcmChoice={setNcmChoice}
                  distinctUnits={distinctUnits}
                  distinctPacks={distinctPacks}
                  unitLabels={unitLabels}
                  packLabels={packLabels}
                  unitRecon={unitRecon}
                  setUnitFinal={setUnitFinal}
                  packRecon={packRecon}
                  setPackFinal={setPackFinal}
                />
              )}
            </Stepper.Item>

            <Stepper.Item label="Preços">
              {data && (
                <StepPrices
                  headers={data.headers}
                  tierColumns={tierColumns}
                  setTierColumns={setTierColumns}
                  pricesPerUnit={pricesPerUnit}
                  setPricesPerUnit={setPricesPerUnit}
                />
              )}
            </Stepper.Item>

            <Stepper.Item label="Impostos">
              {data && (
                <StepTaxes
                  headers={data.headers}
                  ipiChoice={ipiChoice}
                  onIpiChoice={handleIpiChoice}
                  ipiAsFraction={ipiAsFraction}
                  setIpiAsFraction={setIpiAsFraction}
                  taxColumns={taxColumns}
                  setTaxColumns={setTaxColumns}
                  validTaxesCount={validTaxesCount}
                  stMva={stMva}
                  onStMvaChange={handleStMvaChange}
                  taxesAsFraction={taxesAsFraction}
                  setTaxesAsFraction={setTaxesAsFraction}
                />
              )}
            </Stepper.Item>

            <Stepper.Item label="Tabela">
              <StepDetails
                listName={listName}
                setListName={setListName}
                region={region}
                setRegion={setRegion}
                validFrom={validFrom}
                setValidFrom={setValidFrom}
                validUntil={validUntil}
                setValidUntil={setValidUntil}
                isLoading={isLoading}
                skippedRows={skippedRows}
                importableRows={importableRows}
                defaultedCount={defaultedCount}
              />
            </Stepper.Item>

            <Stepper.Item label="Resultado">
              {result && (
                <StepResult
                  result={result}
                  skipped={skipped}
                  unreadable={unreadable}
                  defaultedPack={defaultedPack}
                />
              )}
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
              {canSaveTemplateNow && (
                <Button.Root
                  type="button"
                  appearance="ghost"
                  color="neutral"
                  size="md"
                  noUppercase
                  loading={isLoading}
                  onClick={handleSaveTemplate}
                >
                  <Button.Title>
                    {activeTemplate ? "Atualizar modelo" : "Salvar como modelo"}
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
