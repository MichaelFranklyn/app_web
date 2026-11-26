"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { FileInput } from "lucide-react";

import { importScopeText } from "../../useOrdersTab";

interface Props {
  /** DD/MM/AAAA da importação; vazio quando o link não trouxe a data. */
  date: string;
  onClear: () => void;
}

/**
 * Chegou por "Ver pedidos" em Configurações › Importar: a lista, os números
 * do topo e as abas mostram só os pedidos daquele lote. Sem o aviso, a pessoa
 * acharia que sumiram pedidos da empresa.
 */
export function ImportBatchNotice({ date, onClear }: Props) {
  return (
    <Alert.Root variant="info">
      <Alert.Icon icon={FileInput} />
      <Alert.Content>
        <Alert.Title>Você está vendo só os {importScopeText(date)}</Alert.Title>
        <Alert.Description>
          A lista e os números acima mostram apenas os pedidos que entraram
          nesse lote. Os demais pedidos continuam aqui.
        </Alert.Description>
      </Alert.Content>
      <Alert.Actions>
        <Button.Root appearance="ghost" onClick={onClear}>
          <Button.Title>Ver todos os pedidos</Button.Title>
        </Button.Root>
      </Alert.Actions>
    </Alert.Root>
  );
}
