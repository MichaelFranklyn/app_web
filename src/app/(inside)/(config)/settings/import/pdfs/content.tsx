"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { Stepper } from "@/components/Stepper";
import { PAGE_HEADING } from "@/utils/modules";
import { ArrowLeft, ArrowRight, ClipboardList, FileUp } from "lucide-react";

import { HistoryBatchesCard } from "../_components/HistoryBatchesCard";
import { StepReview } from "../_components/StepReview";
import { PdfBatchesCard } from "./_components/PdfBatchesCard";
import { StepBatch } from "./_components/StepBatch";
import { StepFiles } from "./_components/StepFiles";
import { PDF_STEPS, usePdfImportWizard } from "./usePdfImportWizard";

interface Props {
  initialBatchId: string | null;
}

export default function OrderPdfImportContent({ initialBatchId }: Props) {
  const wizard = usePdfImportWizard(initialBatchId);
  const { step, run, upload, pdf, build, form, options } = wizard;
  const busy = run.running || form.creating;
  const nextLabel =
    step === PDF_STEPS.BATCH
      ? wizard.batchId
        ? "Próximo"
        : "Abrir lote"
      : step === PDF_STEPS.FILES
        ? "Conferir"
        : `Importar ${run.preview?.ordersCreated ?? 0} pedido(s)`;

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Heading {...PAGE_HEADING.import}>
              Importar pedidos em PDF
            </PanelHeader.Heading>
            <PanelHeader.Description>
              Envie os PDFs dos pedidos de uma fábrica: o sistema lê o cliente,
              a data e os itens de cada um e importa como o histórico da
              planilha. O lote fica guardado; dá para voltar e terminar depois.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Card.Root>
        <Card.Body className="gap-16">
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
                sellerOptions={options.sellerOptions}
                optionsLoading={options.loading}
                optionsError={options.error ?? null}
                onRetry={options.reload}
                factoryId={form.factoryId}
                onFactory={form.setFactoryId}
                sellerId={form.sellerId}
                onSeller={form.setSellerId}
                defaultStatus={form.defaultStatus}
                onStatus={form.setDefaultStatus}
                disabled={form.creating}
                onNewBatch={() => wizard.openBatch(null)}
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
                rowsCount={build.rows.length}
                createClients={wizard.createMissingClients}
                onCreateClients={wizard.setCreateMissingClients}
                createProducts={wizard.createMissingProducts}
                onCreateProducts={wizard.setCreateMissingProducts}
                disabled={busy}
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

      <PdfBatchesCard
        currentBatchId={wizard.batchId}
        sellerOptions={options.sellerOptions}
        disabled={busy || upload.sending}
        onOpen={(id) => {
          wizard.openBatch(id);
          wizard.setStep(PDF_STEPS.FILES);
        }}
      />
      <HistoryBatchesCard />

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
