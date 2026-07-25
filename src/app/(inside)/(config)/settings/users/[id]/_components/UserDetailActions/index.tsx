"use client";

import { Button } from "@/components/Button";
import { Pencil, Power } from "lucide-react";
import { useState } from "react";
import { User } from "../../../interface";
import { EditUserModal } from "../../../_components/EditUserModal";
import { ToggleUserModal } from "../../../_components/ToggleUserModal";
import { UserDetail } from "../../../../../_shared/userProfile";

interface Props {
  user: UserDetail;
  onRefetch: () => void;
}

/**
 * Editar e ativar/desativar no perfil, com os MESMOS modais da tabela de
 * usuários. Aqui não há lista otimista: o commit é um refetch do perfil.
 * Excluir não entra — apagar alguém de dentro do próprio perfil dele deixaria a
 * tela sem dono; isso continua na tabela.
 */
export function UserDetailActions({ user, onRefetch }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);

  // Os modais falam a linguagem da tabela (tipo User) — o perfil é um superset.
  const row: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    phone: user.phone,
    createdAt: user.createdAt,
    seller: user.seller
      ? {
          id: user.seller.id,
          isActive: user.seller.isActive,
          region: user.seller.region,
          factoryCount: user.seller.factoryCount,
          clientCount: user.seller.clientCount,
        }
      : null,
  };

  return (
    <>
      <Button.Root
        appearance="outline"
        color={user.isActive ? "red" : "green"}
        size="sm"
        onClick={() => setToggleOpen(true)}
      >
        <Button.Icon icon={Power} />
        <Button.Title>{user.isActive ? "Desativar" : "Ativar"}</Button.Title>
      </Button.Root>

      <Button.Root
        appearance="outline"
        color="neutral"
        size="sm"
        onClick={() => setEditOpen(true)}
      >
        <Button.Icon icon={Pencil} />
        <Button.Title>Editar</Button.Title>
      </Button.Root>

      <EditUserModal
        user={row}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdateOptimistic={() => {}}
        onCommit={onRefetch}
        onRollback={onRefetch}
      />

      <ToggleUserModal
        id={user.id}
        userName={user.name}
        isActive={user.isActive}
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        onToggle={() => {}}
        onCommit={onRefetch}
        onRollback={onRefetch}
      />
    </>
  );
}
