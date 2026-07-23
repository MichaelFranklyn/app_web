import { Alert } from "@/components/Alert";
import { FileWarning } from "lucide-react";

interface Props {
  rows: string[];
}

/**
 * Avisa sobre linhas com cara de item que o PDF não deixou ler (código
 * embaralhado por texto sobreposto). Elas NÃO entram na importação — sem este
 * aviso o usuário acharia que o item subiu. Compartilhado pelos passos de
 * colunas (PDF sem modelo) e de revisão (PDF com modelo da fábrica).
 */
export function UnreadableAlert({ rows }: Props) {
  if (rows.length === 0) return null;
  return (
    <Alert.Root variant="warning">
      <Alert.Icon icon={FileWarning} />
      <Alert.Content>
        <Alert.Title>
          {rows.length} linha(s) do PDF não puderam ser lidas
        </Alert.Title>
        <Alert.Description>
          O código destes itens saiu embaralhado no PDF (texto sobreposto) e
          eles NÃO entram na importação. Confira a descrição, ache o código no
          PDF e adicione o item manualmente:
          <ul className="mt-4 list-disc pl-16">
            {rows.map((desc, i) => (
              <li key={`${desc}-${i}`}>{desc}</li>
            ))}
          </ul>
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
