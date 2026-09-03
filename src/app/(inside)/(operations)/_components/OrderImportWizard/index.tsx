"use client";

import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Stepper } from "@/components/Stepper";

import { StepColumns } from "./StepColumns";
import { StepFile } from "./StepFile";
import { StepResult } from "./StepResult";
import { StepReview } from "./StepReview";
import { StepSheetSummary } from "./StepSheetSummary";
import { STEP_LABEL } from "./steps";
import type { ImportRow } from "./utils";
import {
  DeferredOrderTarget,
  REVIEW_STEP,
  useOrderImportWizard,
} from "./useOrderImportWizard";

export type { DeferredOrderTarget } from "./useOrderImportWizard";

interface Props {
  /** Pedido existente (detalhe do pedido). Ausente → informe `deferred`. */
  orderId?: string | null;
  /** Fluxo em que o pedido só é criado na confirmação final. */
  deferred?: DeferredOrderTarget;
  /**
   * Itens de uma ficha de pedido nossa, já lidos. Quando vêm, o wizard abre na
   * revisão: não há arquivo a escolher nem coluna a mapear.
   */
  initialRows?: ImportRow[];
  /** Fábrica cobra IPI no pedido: habilita mapear/editar a alíquota por item. */
  ipiInOrder?: boolean;
  /** Disparado após gravar itens — recarrega a tabela e os totais do pedido. */
  onImported: () => void;
  /** Informa o pai sobre carregamento em curso (para travar o fechamento do modal). */
  onBusyChange?: (busy: boolean) => void;
  /** Fecha o modal (botão "Fechar" no passo de resultado). */
  onClose: () => void;
  /**
   * Passos que o pai já cumpriu antes de entregar a tela ao wizard (ex.:
   * "Escolha" e "Arquivo", no modal de importação). Entram na faixa como
   * cumpridos, para a trilha contar o caminho INTEIRO — quem está no meio de
   * uma importação precisa ver quantos passos faltam, não quantos sobraram
   * dentro deste componente.
   */
  leadingSteps?: readonly string[];
  /** O que a ficha diz (cliente, fábrica, condição) — mostrado na conferência. */
  sheetSummary?: string;
  /**
   * Volta para um passo do pai (os de `leadingSteps`).
   *
   * A trilha é uma só, então voltar tem de atravessar a fronteira entre os dois
   * componentes: sem isto, quem chegou ao wizard só sai fechando o modal e
   * recomeçando — e clicar num passo anterior da faixa não fazia nada.
   */
  onLeadingStep?: (index: number) => void;
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
  initialRows,
  ipiInOrder,
  onImported,
  onBusyChange,
  onClose,
  leadingSteps = [],
  sheetSummary,
  onLeadingStep,
}: Props) {
  const {
    step,
    setStep,
    fromSheet,
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
    initialRows,
    ipiInOrder,
    onImported,
    onBusyChange,
  });

  // Com a ficha, escolher o arquivo e mapear coluna não existem — o arquivo é
  // nosso e já se explica. O wizard começa, então, no passo em que ela mostra o
  // que leu; um passo morto na trilha só faria procurar o que fazer nele.
  const firstStep = fromSheet ? REVIEW_STEP : 0;
  // Quantos passos já ficaram para trás (no pai) e quantos o caminho tem ao
  // todo. É esta conta que a caixa "Passo 3 de 6" mostra: quem está importando
  // quer saber quanto falta até o fim, não até o fim deste componente.
  const done = leadingSteps.length;
  const total = done + (fromSheet ? 2 : 4);

  return (
    <>
      <Modal.Body className="flex flex-col gap-16 py-24">
        <Stepper.Root
          current={done + step - firstStep}
          onChange={(index) => {
            if (result || isLoading || isRedirecting) return;
            // Antes do wizard: quem manda é o pai (o passo mora lá).
            if (index < done) {
              onLeadingStep?.(index);
              return;
            }
            const target = index - done + firstStep;
            if (target < REVIEW_STEP + 1) setStep(target);
          }}
        >
          {leadingSteps.map((label) => (
            <Stepper.Item key={label} label={label} />
          ))}

          {!fromSheet && (
            <Stepper.Item label={STEP_LABEL.file}>
              <StepFile
                step={done + 1}
                total={total}
                file={file}
                onFiles={handleFiles}
                ready={Boolean(matrix && data)}
              />
            </Stepper.Item>
          )}

          {!fromSheet && (
            <Stepper.Item label={STEP_LABEL.columns}>
              {data && (
                <StepColumns
                  step={done + 2}
                  total={total}
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
          )}

          {/* Mesma posição, conteúdos diferentes: a ficha nossa não tem coluna
              a apontar nem produto a casar na mão, então aqui ela mostra o que
              leu e pede a confirmação — é o "Arquivo" da trilha dela. */}
          <Stepper.Item label={fromSheet ? STEP_LABEL.file : STEP_LABEL.review}>
            {fromSheet ? (
              <StepSheetSummary
                step={done + 1}
                total={total}
                summary={sheetSummary}
                reviewRows={reviewRows}
                confirmableCount={confirmableCount}
                skippedItems={skippedItems}
              />
            ) : (
              <StepReview
                step={done + 3}
                total={total}
                reviewRows={reviewRows}
                updateRow={updateRow}
                confirmableCount={confirmableCount}
                skippedItems={skippedItems}
                ipiInOrder={ipiEnabled}
                unreadableRows={unreadableRows}
              />
            )}
          </Stepper.Item>

          <Stepper.Item label={STEP_LABEL.result}>
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
            {(step > firstStep || (done > 0 && onLeadingStep)) && (
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={isLoading || isRedirecting}
                onClick={() =>
                  step > firstStep
                    ? setStep((s) => s - 1)
                    : // No primeiro passo daqui, voltar é sair do wizard: o
                      // passo anterior é do pai.
                      onLeadingStep?.(done - 1)
                }
              >
                <Button.Title>Voltar</Button.Title>
              </Button.Root>
            )}
            {step === 0 && !fromSheet && (
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
            {step === 1 && !fromSheet && (
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
            {step === REVIEW_STEP && (
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
                  {fromSheet
                    ? // Na ficha o botão é o momento em que o pedido nasce —
                      // dizer "importar itens" esconderia isso.
                      `Subir pedido com ${confirmableCount} item(ns)`
                    : `Importar ${confirmableCount} item(ns)`}
                </Button.Title>
              </Button.Root>
            )}
          </>
        )}
      </Modal.Footer>
    </>
  );
}
