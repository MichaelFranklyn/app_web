"use client";

import { Alert } from "@/components/Alert";
import { formatDateAtTime } from "@/utils/format/date";
import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { plural } from "@/utils/format/plural";
import { HardDriveDownload } from "lucide-react";

import { DraftBackupState } from "../../useDraftBackup";

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
          {plural(count, "item guardado", "itens guardados")} neste aparelho, de{" "}
          {formatDateAtTime(backup.offer.savedAt)}
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
            <Button.Root appearance="ghost" color="red" size="sm">
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
          onClick={backup.recover}
        >
          <Button.Title>Recuperar itens</Button.Title>
        </Button.Root>
      </Alert.Actions>
    </Alert.Root>
  );
}
