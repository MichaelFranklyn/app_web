"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { FileInput } from "lucide-react";

import { importScopeText } from "../../utils";

interface Props {
  /** DD/MM/AAAA da importação; vazio quando o link não trouxe a data. */
  date: string;
  onClear: () => void;
}

/**
 * Chegou por "Ver clientes novos" em Configurações › Importar: a lista mostra
 * só os clientes que aquele lote pôs na carteira. Sem o aviso, a pessoa
 * acharia que a carteira encolheu — e os cartões do topo, que seguem contando
 * a carteira inteira, pareceriam contradizer a lista.
 */
export function ImportBatchNotice({ date, onClear }: Props) {
  return (
    <Alert.Root variant="info">
      <Alert.Icon icon={FileInput} />
      <Alert.Content>
        <Alert.Title>Você está vendo só os {importScopeText(date)}</Alert.Title>
        <Alert.Description>
          A lista abaixo mostra apenas os clientes que entraram na carteira por
          essa importação. Os cartões acima continuam contando a carteira
          inteira.
        </Alert.Description>
      </Alert.Content>
      <Alert.Actions>
        <Button.Root appearance="ghost" onClick={onClear}>
          <Button.Title>Ver todos os clientes</Button.Title>
        </Button.Root>
      </Alert.Actions>
    </Alert.Root>
  );
}
