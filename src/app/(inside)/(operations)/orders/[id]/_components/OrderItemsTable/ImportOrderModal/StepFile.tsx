import { Alert } from "@/components/Alert";
import { Input } from "@/components/Input";
import { Stepper } from "@/components/Stepper";
import { CheckCircle2 } from "lucide-react";

interface StepFileProps {
  file: File[];
  onFiles: (files: File[]) => void;
  ready: boolean;
}

export function StepFile({ file, onFiles, ready }: StepFileProps) {
  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro step={1} total={4} title="Envie o pedido da fábrica">
        Arraste o arquivo do pedido (PDF ou Excel) para o quadro abaixo. PDFs
        são lidos automaticamente; se for um PDF escaneado (imagem), peça a
        versão em Excel para a fábrica.
      </Stepper.Intro>
      <Input.Archive
        variant="single"
        accept=".pdf,.csv,.xlsx,.xls"
        hint="Pedido em PDF, Excel (.xlsx/.xls) ou CSV."
        value={file}
        onChange={onFiles}
      />
      {ready && (
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
