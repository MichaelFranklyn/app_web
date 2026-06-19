"use client";

import { Button } from "@/components/Button";
import { PanelHeader } from "@/components/PanelHeader";
import { downloadCSV } from "@/utils/format/csv";
import { formatDateDMY } from "@/utils/format/masks";
import { Download } from "lucide-react";
import { User } from "../../interface";
import { AddUserModal } from "./AddUserModal";

export function UsersHeader({
  onAddOptimistic,
  items,
}: {
  onAddOptimistic: (user: User) => void;
  items: User[];
}) {
  const handleExport = () => {
    const headers = ["Nome", "E-mail", "Permissão", "Criado em"];
    const rows = items.map((u) => [
      u.name,
      u.email,
      u.role,
      formatDateDMY(u.createdAt),
    ]);
    downloadCSV("usuarios.csv", [headers, ...rows]);
  };

  return (
    <PanelHeader.Root>
      <PanelHeader.Top>
        <PanelHeader.Left>
          <PanelHeader.Eyebrow>
            Configurações
          </PanelHeader.Eyebrow>
          <PanelHeader.Title>
            Usuários
          </PanelHeader.Title>
          <PanelHeader.Description>
            Gestão de usuários da empresa. Roles: owner, admin, seller.
          </PanelHeader.Description>
          <PanelHeader.Actions className="mt-6">
            <Button.Root
              appearance="outline"
              color="neutral"
              size="md"
              disabled={items.length === 0}
              onClick={handleExport}
            >
              <Button.Icon icon={Download} />
              <Button.Title>Exportar</Button.Title>
            </Button.Root>
            <AddUserModal onAddOptimistic={onAddOptimistic} />
          </PanelHeader.Actions>
        </PanelHeader.Left>
      </PanelHeader.Top>
    </PanelHeader.Root>
  );
}
