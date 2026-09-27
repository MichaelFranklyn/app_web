"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { Stepper } from "@/components/Stepper";
import { ArrowLeft, ArrowRight, ClipboardList } from "lucide-react";

import { StepColumns } from "./_components/StepColumns";
import { StepFile } from "./_components/StepFile";
import { StepMatch } from "./_components/StepMatch";
import { StepReview } from "./_components/StepReview";
import { useHistoryImportWizard } from "./useHistoryImportWizard";

export default function OrderHistoryImportContent() {
  const {
    step,
    setStep,
    sheet,
    options,
    matches,
    run,
    canAdvance,
    next,
    back,
  } = useHistoryImportWizard();
  const nextLabel =
    step === 2
      ? "Conferir"
      : step === 3
        ? `Importar ${run.preview?.ordersCreated ?? 0} pedido(s)`
        : "Próximo";

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Importar histórico de pedidos</PanelHeader.Title>
            <PanelHeader.Description>
              Os pedidos antigos entram como entregues, sem comissão nem boleto,
              e ensinam ao sistema o ritmo de compra de cada cliente.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Card.Root>
        <Card.Body className="gap-16">
          <Stepper.Root
            current={step}
            onChange={(index) => {
              if (!run.running && !run.imported && index < step) setStep(index);
            }}
          >
            <Stepper.Item label="Planilha">
              <StepFile
                files={sheet.files}
                onFiles={sheet.onFiles}
                reading={sheet.reading}
                readError={sheet.readError}
                matrix={sheet.matrix}
                headerIndex={sheet.headerIndex}
                onHeaderChange={sheet.setHeaderIndex}
                data={sheet.data}
              />
            </Stepper.Item>
            <Stepper.Item label="Colunas">
              {sheet.mapping && (
                <StepColumns
                  headers={sheet.data.headers}
                  mapping={sheet.mapping}
                  onMappingChange={sheet.setMapping}
                  quantityUnit={sheet.quantityUnit}
                  onQuantityUnitChange={sheet.setQuantityUnit}
                />
              )}
            </Stepper.Item>
            <Stepper.Item label="Quem é quem">
              <StepMatch
                loading={options.loading}
                error={options.error}
                onRetry={options.reload}
                factoryValues={matches.factoryValues}
                factoryOptions={options.factoryOptions}
                factoryMatches={matches.factoryMatches}
                onFactoryMatch={matches.setFactoryMatch}
                hasSellerColumn={matches.hasSellerColumn}
                sellerValues={matches.sellerValues}
                sellerOptions={options.sellerOptions}
                sellerMatches={matches.sellerMatches}
                onSellerMatch={matches.setSellerMatch}
                defaultSellerId={matches.defaultSellerId}
                onDefaultSeller={matches.setDefaultSellerId}
                pending={matches.pending}
              />
            </Stepper.Item>
            <Stepper.Item label="Conferir">
              <StepReview
                result={run.imported ?? run.preview}
                localProblems={run.localProblems}
                progress={run.progress}
                running={run.running}
              />
            </Stepper.Item>
          </Stepper.Root>

          <div className="flex flex-wrap justify-between gap-8">
            {step > 0 && !run.imported ? (
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={run.running}
                onClick={back}
              >
                <Button.Icon icon={ArrowLeft} />
                <Button.Title>Voltar</Button.Title>
              </Button.Root>
            ) : (
              <span />
            )}
            {run.imported ? (
              <Button.Link
                href="/orders"
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
              >
                <Button.Icon icon={ClipboardList} />
                <Button.Title>Ver pedidos</Button.Title>
              </Button.Link>
            ) : (
              <Button.Root
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                disabled={!canAdvance || run.running}
                loading={run.running}
                onClick={next}
              >
                <Button.Title>{nextLabel}</Button.Title>
                <Button.Icon icon={ArrowRight} />
              </Button.Root>
            )}
          </div>
        </Card.Body>
      </Card.Root>
    </PageContent>
  );
}
