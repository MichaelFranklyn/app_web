"use client";

import { ArrowRight, Info, Upload } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Stepper } from "@/components/Stepper";
import { useNavigation } from "@/hooks/useNavigation";

import { useProductImport } from "./hook";
import { ImportProductRow } from "./interface";
import { ImportSummary } from "./ImportSummary";
import { ReviewRows } from "./ReviewRows";
import { TemplateMode } from "./TemplateMode";

interface Props {
  companyFactoryId: string;
  onChanged: () => void;
}

const RESULT_STEP = 2;

export function ImportProductsModal({ companyFactoryId, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [pendingRows, setPendingRows] = useState<ImportProductRow[] | null>(null);
  const { navigateTo } = useNavigation();

  const { runImport, result, isLoading, resetResult } = useProductImport(
    companyFactoryId,
    onChanged
  );

  // Importação concluída: a navegação trava no Resultado.
  useEffect(() => {
    if (result) setStep(RESULT_STEP);
  }, [result]);

  const handleClose = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setStep(0);
      setPendingRows(null);
      resetResult();
    }
  };

  const goToPriceListImport = () => {
    setOpen(false);
    navigateTo(`/factories/${companyFactoryId}/price-lists?import=price-list`);
  };

  const handleImport = async () => {
    if (pendingRows?.length) await runImport(pendingRows);
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Upload} />
          <Button.Title>Importar</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="3xl">
        <Modal.Header
          title="Importar produtos"
          description="Cadastre vários produtos de uma vez no catálogo desta fábrica."
        />

        <Modal.Body className="flex flex-col gap-16 py-24">
          <Stepper.Root
            current={step}
            onChange={(index) => {
              if (!result && index < RESULT_STEP) setStep(index);
            }}
          >
            <Stepper.Item label="Planilha">
              <div className="flex flex-col gap-16">
                <Alert.Root variant="info">
                  <Alert.Icon icon={Info} />
                  <Alert.Content>
                    <Alert.Title>
                      Vai subir uma tabela de preços da fábrica?
                    </Alert.Title>
                    <Alert.Description>
                      Importe direto a tabela de preços — os produtos do catálogo
                      são criados automaticamente junto com os preços.
                    </Alert.Description>
                    <Button.Root
                      type="button"
                      appearance="outline"
                      color="neutral"
                      size="sm"
                      noUppercase
                      className="mt-8 self-start"
                      onClick={goToPriceListImport}
                    >
                      <Button.Title>Importar tabela de preços</Button.Title>
                      <Button.Icon icon={ArrowRight} />
                    </Button.Root>
                  </Alert.Content>
                </Alert.Root>

                <TemplateMode
                  onRowsChange={setPendingRows}
                  onResetResult={resetResult}
                />
              </div>
            </Stepper.Item>

            <Stepper.Item label="Revisão">
              <div className="flex flex-col gap-16">
                {pendingRows?.length ? <ReviewRows rows={pendingRows} /> : null}

                <Alert.Root variant="info">
                  <Alert.Icon icon={Info} />
                  <Alert.Content>
                    <Alert.Description>
                      Categoria, unidade e rótulo de embalagem que não existirem
                      no catálogo são criados automaticamente pelo nome.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              </div>
            </Stepper.Item>

            <Stepper.Item label="Resultado">
              {result && <ImportSummary result={result} />}
            </Stepper.Item>
          </Stepper.Root>
        </Modal.Body>

        <Modal.Footer>
          {result ? (
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
              <Modal.Close asChild>
                <Button.Root
                  type="button"
                  appearance="ghost"
                  color="neutral"
                  size="md"
                  noUppercase
                  disabled={isLoading}
                >
                  <Button.Title>Cancelar</Button.Title>
                </Button.Root>
              </Modal.Close>
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
              {step === 0 ? (
                <Button.Root
                  type="button"
                  appearance="solid"
                  color="amber"
                  size="md"
                  noUppercase
                  disabled={!pendingRows?.length}
                  onClick={() => setStep(1)}
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
                  disabled={!pendingRows?.length}
                  onClick={handleImport}
                >
                  <Button.Title>
                    Importar{pendingRows?.length ? ` (${pendingRows.length})` : ""}
                  </Button.Title>
                </Button.Root>
              )}
            </>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
