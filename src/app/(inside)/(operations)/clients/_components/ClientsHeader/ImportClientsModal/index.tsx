"use client";

import { Import } from "@/components/Import";

import { Info } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Stepper } from "@/components/Stepper";

import { ImportClientRow } from "./interface";
import { ReviewRows } from "./ReviewRows";
import { StepSheet } from "./StepSheet";
import { useClientsImport } from "./useClientsImport";

interface ImportClientsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RESULT_STEP = 2;

/**
 * Aberto pelo menu "Mais ações" do cabeçalho (ver `ClientsMoreMenu`): o botão
 * próprio somava o quinto botão da fileira, e no celular eles empilhavam numa
 * tela inteira antes da carteira (crítica de 23/11/2026).
 *
 * Em etapas, como o de produtos: Planilha → Revisão → Resultado. Numa coluna
 * só, a explicação, o arquivo e o resumo disputavam o mesmo espaço estreito.
 */
export function ImportClientsModal({
  open,
  onOpenChange,
}: ImportClientsModalProps) {
  const [step, setStep] = useState(0);
  const [pendingRows, setPendingRows] = useState<ImportClientRow[] | null>(
    null
  );
  const { runImport, result, isLoading, resetResult } = useClientsImport();

  // Importação concluída: a navegação trava no Resultado.
  useEffect(() => {
    if (result) setStep(RESULT_STEP);
  }, [result]);

  const handleClose = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      setStep(0);
      setPendingRows(null);
      resetResult();
    }
  };

  const handleImport = async () => {
    if (pendingRows?.length) await runImport(pendingRows);
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Content size="3xl">
        <Modal.Header
          title="Importar clientes"
          description="Envie uma planilha do Excel com os CNPJs para adicionar vários clientes de uma vez. Os demais dados vêm da Receita Federal."
        />

        <Modal.Body className="flex flex-col gap-16 py-24">
          <Stepper.Root
            current={step}
            onChange={(index) => {
              if (!result && index < RESULT_STEP) setStep(index);
            }}
          >
            <Stepper.Item label="Planilha">
              <StepSheet onRowsChange={setPendingRows} />
            </Stepper.Item>

            <Stepper.Item label="Revisão">
              <div className="flex flex-col gap-16">
                {pendingRows?.length ? <ReviewRows rows={pendingRows} /> : null}

                <Alert.Root variant="info">
                  <Alert.Icon icon={Info} />
                  <Alert.Content>
                    <Alert.Description>
                      Serve também a lista exportada de outro sistema: a coluna
                      do CNPJ é encontrada sozinha. Nome, endereço e contato vêm
                      da Receita Federal.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              </div>
            </Stepper.Item>

            <Stepper.Item label="Resultado">
              {result && (
                <Import.Summary
                  result={result}
                  identify={(detail) => detail.cnpj}
                  createdLabel="Adicionados"
                  extraKpis={[
                    { label: "Vínculos criados", value: result.linksCreated },
                    { label: "Códigos gravados", value: result.codesSaved },
                  ]}
                />
              )}
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
                  loading={isLoading}
                  disabled={!pendingRows?.length}
                  onClick={handleImport}
                >
                  <Button.Title>
                    Importar
                    {pendingRows?.length ? ` (${pendingRows.length})` : ""}
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
