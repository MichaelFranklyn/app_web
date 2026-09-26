import { Card } from "@/components/Card";
import { Import } from "@/components/Import";
import { Alert } from "@/components/Alert";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Stepper } from "@/components/Stepper";
import { Title } from "@/components/Title";
import { CheckCircle2 } from "lucide-react";

import { downloadExampleSheet } from "./template";

interface StepSheetProps {
  file: File[];
  extracting: boolean;
  onFiles: (files: File[]) => void;
  ready: boolean;
  templateApplied: boolean;
}

export function StepSheet({
  file,
  extracting,
  onFiles,
  ready,
  templateApplied,
}: StepSheetProps) {
  return (
    <div className="flex flex-col gap-12">
      <Stepper.Intro
        step={1}
        total={6}
        title="Envie a planilha de preços da fábrica"
      >
        Pegue o arquivo Excel que a fábrica te mandou e arraste para o quadro
        abaixo (ou clique nele para escolher o arquivo). O sistema lê a planilha
        e tenta descobrir sozinho onde está cada informação — nos próximos
        passos você só confere se ele acertou.
      </Stepper.Intro>
      <Import.TemplateDownload
        title="Não tem a planilha da fábrica em mãos?"
        description="Baixe o modelo com as colunas que o sistema reconhece sozinho — inclui exemplos com IPI e ST por MVA."
        onDownload={downloadExampleSheet}
      />
      <Input.Archive
        variant="single"
        accept=".csv,.xlsx,.xls,.pdf"
        hint="Suba a tabela da fábrica em Excel (.xlsx/.csv) ou PDF. Em PDF, lemos a grade automaticamente; confira as colunas no passo seguinte."
        value={file}
        disabled={extracting}
        onChange={onFiles}
      />
      {extracting && (
        <Card.Root inset>
          <Card.Body padding="sm" className="flex flex-row items-center gap-8">
            <Loading.Spinner size="sm" colorClass="amber" />
            <Title variant="body" color="muted">
              Lendo o arquivo e procurando as colunas… Em tabelas grandes (PDF)
              isso pode levar alguns segundos.
            </Title>
          </Card.Body>
        </Card.Root>
      )}
      {!extracting && ready && (
        <Alert.Root variant="success">
          <Alert.Icon icon={CheckCircle2} />
          <Alert.Content>
            <Alert.Description>
              {templateApplied
                ? "Arquivo lido e modelo desta fábrica aplicado: as colunas já vêm mapeadas. Confira nos próximos passos."
                : "Planilha lida com sucesso. Clique em Próximo para conferir o que o sistema entendeu."}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
    </div>
  );
}
