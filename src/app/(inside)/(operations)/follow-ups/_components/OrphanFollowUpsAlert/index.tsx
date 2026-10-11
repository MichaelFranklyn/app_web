"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { UserX } from "lucide-react";

interface Props {
  count: number;
  /** O filtro "de quem saiu" está ligado. */
  active: boolean;
  onShow: () => void;
  onClear: () => void;
}

/**
 * Contatos em aberto com alguém que saiu da empresa. Sem este aviso eles
 * ficariam esquecidos: o lembrete não sai para quem foi desativado, e ninguém
 * mais olha para eles. Só o gestor vê — é ele quem transfere.
 */
export function OrphanFollowUpsAlert({
  count,
  active,
  onShow,
  onClear,
}: Props) {
  if (count === 0 && !active) return null;
  const many =
    count === 1
      ? "1 contato em aberto está"
      : `${count} contatos em aberto estão`;

  return (
    <Alert.Root variant="warning" data-tour="follow-ups-orphans">
      <Alert.Icon icon={UserX} />
      <Alert.Content>
        <Alert.Title>
          {active
            ? "Mostrando os contatos de quem foi desativado"
            : `${many} com quem foi desativado`}
        </Alert.Title>
        <Alert.Description>
          Ninguém recebe lembrete deles. Abra cada um e use Corrigir para passar
          a outra pessoa.
        </Alert.Description>
      </Alert.Content>
      <Alert.Actions>
        <Button.Root
          type="button"
          appearance={active ? "outline" : "solid"}
          color={active ? "neutral" : "amber"}
          size="sm"
          noUppercase
          onClick={active ? onClear : onShow}
        >
          <Button.Title>
            {active ? "Ver todos" : "Ver esses contatos"}
          </Button.Title>
        </Button.Root>
      </Alert.Actions>
    </Alert.Root>
  );
}
