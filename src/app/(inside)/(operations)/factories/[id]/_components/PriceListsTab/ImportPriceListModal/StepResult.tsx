import { Alert } from "@/components/Alert";
import { CheckCircle2, Info } from "lucide-react";

import { DefaultedPackView } from "./DefaultedPackView";
import { ImportPriceListResult } from "./interface";
import { LeftOutView } from "./LeftOutView";
import { ResultView } from "./ResultView";

interface StepResultProps {
  result: ImportPriceListResult;
  skipped: { sku: string; name: string; reason: string }[];
  unreadable: string[];
  defaultedPack: { sku: string; name: string }[];
}

export function StepResult({
  result,
  skipped,
  unreadable,
  defaultedPack,
}: StepResultProps) {
  return (
    <div className="flex flex-col gap-12">
      {result.failed > 0 ? (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Title>Importação parcial</Alert.Title>
            <Alert.Description>
              A tabela &quot;{result.listName}&quot; foi criada, mas{" "}
              {result.failed} linha(s) falharam — veja os motivos abaixo. Você
              pode corrigir a planilha e importar de novo: produtos já criados
              são reaproveitados e os preços são atualizados.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : skipped.length > 0 || unreadable.length > 0 ? (
        <Alert.Root variant="warning">
          <Alert.Icon icon={Info} />
          <Alert.Content>
            <Alert.Title>
              Tabela importada — mas {skipped.length + unreadable.length}{" "}
              linha(s) ficaram de fora
            </Alert.Title>
            <Alert.Description>
              A tabela &quot;{result.listName}&quot; está ativa com{" "}
              {result.totalRows} linha(s). As linhas abaixo NÃO entraram —
              confira se há produtos que precisam ser cadastrados à mão ou
              ajustados na planilha.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : (
        <Alert.Root variant="success">
          <Alert.Icon icon={CheckCircle2} />
          <Alert.Content>
            <Alert.Title>Tabela importada com sucesso</Alert.Title>
            <Alert.Description>
              A tabela &quot;{result.listName}&quot; está ativa com as{" "}
              {result.totalRows} linha(s) da planilha — nenhuma ficou de fora.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      <ResultView result={result} />
      {defaultedPack.length > 0 && <DefaultedPackView items={defaultedPack} />}
      {(skipped.length > 0 || unreadable.length > 0) && (
        <LeftOutView skipped={skipped} unreadable={unreadable} />
      )}
    </div>
  );
}
