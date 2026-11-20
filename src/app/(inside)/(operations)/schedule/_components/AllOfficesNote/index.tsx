"use client";

import { Alert } from "@/components/Alert";
import { useMyOffices } from "@/hooks/useMyOffices";
import { Building2 } from "lucide-react";

import { allOfficesNoteText } from "../../utils";

interface Props {
  /** Só a agenda de quem está logado junta os escritórios. */
  isOwnAgenda: boolean;
}

/**
 * Avisa, por escrito, que a agenda junta os clientes de todos os escritórios
 * da pessoa — senão um cliente de outro escritório no meio da semana parece
 * engano. Pedido e estoque continuam no escritório de cada um.
 */
export function AllOfficesNote({ isOwnAgenda }: Props) {
  const { activeOffices } = useMyOffices({ skip: !isOwnAgenda });
  const text = isOwnAgenda ? allOfficesNoteText(activeOffices) : null;
  if (!text) return null;

  return (
    <Alert.Root variant="info" role="note">
      <Alert.Icon icon={Building2} />
      <Alert.Content>
        <Alert.Title>Sua agenda junta todos os seus escritórios</Alert.Title>
        <Alert.Description>
          {text} Os de outro escritório vêm com o nome dele. Para fazer pedido
          ou ver o estoque de lá, saia da agenda e troque de escritório no topo
          da tela.
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
