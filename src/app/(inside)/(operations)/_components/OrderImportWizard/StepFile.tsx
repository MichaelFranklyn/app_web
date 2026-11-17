import { Alert } from "@/components/Alert";
import { Import } from "@/components/Import";
import { Input } from "@/components/Input";
import { Stepper } from "@/components/Stepper";
import { CheckCircle2 } from "lucide-react";

import { ReadingPhase } from "./interface";
import { ReadingProgress } from "./ReadingProgress";
import { downloadOrderItemsTemplate } from "./template";

interface StepFileProps {
  /**
   * Posição do passo no caminho INTEIRO (a importação começa antes deste
   * componente): é o "Passo 3 de 6" da caixa de explicação.
   */
  step: number;
  total: number;
  file: File[];
  onFiles: (files: File[]) => void;
  ready: boolean;
  /** PDF subindo ou sendo lido: a tela mostra a fase e o tempo. */
  readingPhase?: ReadingPhase | null;
}

export function StepFile({
  step,
  total,
  file,
  onFiles,
  ready,
  readingPhase,
}: StepFileProps) {
  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro
        step={step}
        total={total}
        title="Envie o pedido da fábrica"
      >
        Arraste o arquivo do pedido (PDF ou Excel) para o quadro abaixo. PDFs
        são lidos automaticamente; se for um PDF escaneado (imagem), peça a
        versão em Excel para a fábrica.
      </Stepper.Intro>
      <Import.TemplateDownload
        description="Não recebeu o pedido da fábrica? Baixe a planilha de exemplo, preencha com código e quantidade de cada item e envie aqui."
        onDownload={downloadOrderItemsTemplate}
      />
      <Input.Archive
        variant="single"
        accept=".pdf,.csv,.xlsx,.xls"
        hint="Pedido em PDF, Excel (.xlsx/.xls) ou CSV."
        value={file}
        onChange={onFiles}
      />
      {readingPhase && <ReadingProgress phase={readingPhase} />}
      {ready && !readingPhase && (
        <Alert.Root variant="success">
          <Alert.Icon icon={CheckCircle2} />
          <Alert.Content>
            <Alert.Description>
              Arquivo lido. Clique em Próximo para conferir as colunas.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </div>
  );
}
