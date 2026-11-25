"use client";

import { MoreOptions } from "@/components/MoreOptions";
import { Mail, Pencil, Power, Trash2 } from "lucide-react";
import { useState } from "react";
import { User } from "../../../interface";
import { DeleteUserModal } from "../../DeleteUserModal";
import { EditUserModal } from "../../EditUserModal";
import { ResendWelcomeModal } from "../../ResendWelcomeModal";
import { ToggleUserModal } from "../../ToggleUserModal";

interface UserRowActionsProps {
  user: User;
  onUpdateOptimistic: (id: string, updates: Partial<User>) => void;
  onRemoveOptimistic: (id: string) => void;
  onCommit: () => void;
  onRollback: () => void;
}

export function UserRowActions({
  user,
  onUpdateOptimistic,
  onRemoveOptimistic,
  onCommit,
  onRollback,
}: UserRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [toggleOpen, setToggleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resendOpen, setResendOpen] = useState(false);
  // Convite pendente entra aceitando o convite; conta desativada não entra.
  // Nos dois casos o back recusaria o reenvio — a opção nem aparece.
  const canResendWelcome = user.isActive && !user.isInvitationPending;

  return (
    <>
      <MoreOptions
        options={[
          {
            label: "Editar",
            icon: Pencil,
            onClick: () => setEditOpen(true),
          },
          {
            label: user.isActive ? "Desativar" : "Ativar",
            icon: Power,
            onClick: () => setToggleOpen(true),
          },
          ...(canResendWelcome
            ? [
                {
                  label: "Reenviar primeiros passos",
                  icon: Mail,
                  onClick: () => setResendOpen(true),
                },
              ]
            : []),
          {
            label: "Excluir",
            icon: Trash2,
            danger: true,
            onClick: () => setDeleteOpen(true),
          },
        ]}
      />

      <EditUserModal
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdateOptimistic={onUpdateOptimistic}
        onCommit={onCommit}
        onRollback={onRollback}
      />

      <ToggleUserModal
        id={user.id}
        userName={user.name}
        isActive={user.isActive}
        open={toggleOpen}
        onOpenChange={setToggleOpen}
        onToggle={() =>
          onUpdateOptimistic(user.id, { isActive: !user.isActive })
        }
        onCommit={onCommit}
        onRollback={onRollback}
      />

      <ResendWelcomeModal
        id={user.id}
        userName={user.name}
        email={user.email}
        open={resendOpen}
        onOpenChange={setResendOpen}
      />

      <DeleteUserModal
        id={user.id}
        userName={user.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onRemove={() => onRemoveOptimistic(user.id)}
        onRollback={onRollback}
      />
    </>
  );
}
