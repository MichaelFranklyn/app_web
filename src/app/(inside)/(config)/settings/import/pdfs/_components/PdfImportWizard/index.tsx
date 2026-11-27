"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { Stepper } from "@/components/Stepper";
import { PAGE_HEADING } from "@/utils/modules";
import { plural } from "@/utils/format/plural";
import { ArrowLeft, ArrowRight, ClipboardList, FileUp } from "lucide-react";

import { StepReview } from "../../../_components/StepReview";
import { PDF_STEPS, usePdfImportWizard } from "../../usePdfImportWizard";
import { batchOpenedAt } from "../../utils";
import { PdfBreadcrumb } from "../PdfBreadcrumb";
import { StepBatch } from "../StepBatch";
import { StepFiles } from "../StepFiles";

interface Props {
  initialBatchId: string | null;
}

/**
 * O passo a passo de um lote (novo em `/new`, já aberto em `/[batchId]`). A
 * lista dos lotes fica na tela de cima, a que a breadcrumb leva de volta.
 */
export function PdfImportWizard({ initialBatchId }: Props) {
  const wizard = usePdfImportWizard(initialBatchId);
  const { step, run, upload, pdf, build, form, options } = wizard;
  const busy = run.running || form.creating;
  const nextLabel =
    step === PDF_STEPS.BATCH
      ? !wizard.batchId
        ? "Abrir lote"
        : form.factoryChanged
          ? "Trocar fábrica"
          : "Próximo"
      : step === PDF_STEPS.FILES
        ? "Conferir"
        : `Importar ${plural(run.preview?.ordersCreated ?? 0, "pedido", "pedidos")}`;
  const batchName = pdf.batch
    ? `Lote ${pdf.batch.factoryName}`
    : wizard.batchId
      ? "Lote"
      : "Novo lote";

  return (
    <PageContent>
      <div className="flex flex-col gap-8">
        <PdfBreadcrumb current={batchName} />
        <PanelHeader.Root>
          <PanelHeader.Top>
            <PanelHeader.Left>
              <PanelHeader.Heading {...PAGE_HEADING.import}>
                {batchName}
              </PanelHeader.Heading>
              <PanelHeader.Description>
                {pdf.batch
                  ? `Aberto em ${batchOpenedAt(pdf.batch.createdAt)}. O lote fica guardado: dá para sair e terminar depois.`
                  : "Escolha a fábrica, envie os PDFs e confira a prévia de cada pedido. Nada é gravado antes de importar."}
              </PanelHeader.Description>
            </PanelHeader.Left>
          </PanelHeader.Top>
        </PanelHeader.Root>
      </div>

      <Card.Root>
        <Card.Body>
          <Stepper.Root
            current={step}
            onChange={(index) => {
              if (!busy && !upload.sending && !run.imported && index < step) {
                if (step === PDF_STEPS.REVIEW) run.resetPreview();
                wizard.setStep(index);
              }
            }}
          >
            <Stepper.Item label="Lote">
              <StepBatch
                batch={pdf.batch}
                batchLoading={Boolean(wizard.batchId) && pdf.loading}
                factoryOptions={options.factoryOptions}
                optionsLoading={options.loading}
                optionsError={options.error ?? null}
                onRetry={options.reload}
                factoryId={form.factoryId}
                onFactory={form.setFactoryId}
                factoryLocked={form.factoryLocked}
                factoryChanged={form.factoryChanged}
                disabled={form.creating}
              />
            </Stepper.Item>
            <Stepper.Item label="PDFs">
              <StepFiles
                batch={pdf.batch}
                files={pdf.files}
                loading={pdf.loading}
                error={pdf.error}
                onRetry={() => void pdf.reload()}
                reading={pdf.reading}
                onAdd={upload.add}
                sending={upload.sending}
                progress={upload.progress}
                failed={upload.failed}
                onClearFailed={upload.clearFailed}
                canResend={upload.canResend}
                onResend={upload.resend}
                overrides={wizard.overrides}
                onOverride={wizard.setOverride}
                sellerOptions={options.sellerOptions}
                defaults={wizard.defaults}
                onDefaults={wizard.setDefaults}
                rowsCount={build.rows.length}
                createClients={wizard.createMissingClients}
                onCreateClients={wizard.setCreateMissingClients}
                createProducts={wizard.createMissingProducts}
                onCreateProducts={wizard.setCreateMissingProducts}
                disabled={busy}
                onChangeFactory={
                  form.factoryLocked
                    ? undefined
                    : () => wizard.setStep(PDF_STEPS.BATCH)
                }
              />
            </Stepper.Item>
            <Stepper.Item label="Conferir">
              <StepReview
                result={run.imported ?? run.preview}
                localProblems={run.localProblems}
                progress={run.progress}
                running={run.running}
                step={3}
                total={3}
                describeRow={(row) => build.labels[row] ?? `Linha ${row}`}
                onIncludeMissingProducts={wizard.includeMissingProducts}
              />
            </Stepper.Item>
          </Stepper.Root>

          <div className="flex flex-wrap justify-between gap-8">
            {run.imported ? (
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="md"
                onClick={wizard.sendMore}
              >
                <Button.Icon icon={FileUp} />
                <Button.Title>Enviar mais PDFs</Button.Title>
              </Button.Root>
            ) : step > 0 ? (
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="md"
                disabled={busy}
                onClick={wizard.back}
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
              >
                <Button.Icon icon={ClipboardList} />
                <Button.Title>Ver pedidos</Button.Title>
              </Button.Link>
            ) : (
              <Button.Root
                appearance="solid"
                color="amber"
                size="md"
                disabled={!wizard.canAdvance || busy}
                loading={busy}
                onClick={wizard.next}
              >
                <Button.Title>{nextLabel}</Button.Title>
                <Button.Icon icon={ArrowRight} />
              </Button.Root>
            )}
          </div>
        </Card.Body>
      </Card.Root>

      <ConfirmModal
        open={wizard.leave.isAsking}
        onOpenChange={(open) => !open && wizard.leave.stay()}
        title="Sair no meio do envio?"
        description="Ainda há PDFs subindo ou pedidos sendo importados. Se sair agora, o que não terminou fica pela metade."
        confirmLabel="Sair mesmo assim"
        cancelLabel="Continuar aqui"
        confirmColor="red"
        onConfirm={async () => wizard.leave.confirmLeave()}
      />
    </PageContent>
  );
}
