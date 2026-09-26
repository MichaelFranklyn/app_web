import { BulletList } from "@/components/BulletList";
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
          <BulletList.Root className="mt-4">
            {rows.map((desc, i) => (
              <BulletList.Item key={`${desc}-${i}`}>{desc}</BulletList.Item>
            ))}
          </BulletList.Root>
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
