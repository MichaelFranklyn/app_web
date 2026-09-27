"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { HardDriveDownload } from "lucide-react";

import { DraftBackupState } from "../../useDraftBackup";

/** "26/09 às 14:32" — o momento em que a pessoa estava montando o pedido. */
const savedAtLabel = (iso: string) => {
  const date = new Date(iso);
  const day = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const time = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} às ${time}`;
};

/**
 * Itens de um pedido deste cliente e fábrica que não chegou a ser criado —
 * normalmente porque o sinal caiu. Recuperar devolve os itens à lista; o preço
 * vem como foi digitado, por isso o aviso para conferir antes de criar.
 */
export function DraftBackupNotice({ backup }: { backup: DraftBackupState }) {
  if (!backup.offer) return null;
  const count = backup.offer.items.length;

  return (
    <Alert.Root variant="info" className="flex-wrap" data-testid="draft-backup">
      <Alert.Icon icon={HardDriveDownload} />
      <Alert.Content className="min-w-[200px]">
        <Alert.Title>
          {count === 1 ? "1 item guardado" : `${count} itens guardados`} neste
          aparelho, de {savedAtLabel(backup.offer.savedAt)}
        </Alert.Title>
        <Alert.Description>
          É um pedido deste cliente e desta fábrica que não chegou a ser criado.
          Ao recuperar, confira os preços antes de criar — a tabela pode ter
          mudado desde então.
        </Alert.Description>
      </Alert.Content>

      <Alert.Actions>
        <ConfirmModal
          trigger={
            <Button.Root appearance="ghost" color="red" size="sm" noUppercase>
              <Button.Title>Descartar</Button.Title>
            </Button.Root>
          }
          title="Descartar os itens guardados?"
          description={`${count === 1 ? "O item guardado sai" : `Os ${count} itens guardados saem`} deste aparelho e não dá para recuperar depois.`}
          confirmLabel="Descartar"
          confirmColor="red"
          onConfirm={async () => backup.discard()}
        />
        <Button.Root
          appearance="solid"
          color="amber"
          size="sm"
          noUppercase
          onClick={backup.recover}
        >
          <Button.Title>Recuperar itens</Button.Title>
        </Button.Root>
      </Alert.Actions>
    </Alert.Root>
  );
}
