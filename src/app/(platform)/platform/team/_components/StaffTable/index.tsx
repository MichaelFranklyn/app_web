"use client";

import { Badge } from "@/components/Badges";
import { RowActions } from "@/components/RowActions";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { plural } from "@/utils/format/plural";
import { UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { PlatformStaffMember } from "../../interface";
import {
  STAFF_ROLE_COLOR,
  STAFF_ROLE_LABEL,
  canManage,
  lastAccessLabel,
} from "../../utils";
import { RevokeAccessModal } from "../RevokeAccessModal";

/**
 * A lista de quem tem acesso total.
 *
 * Os desativados FICAM na tabela, apagados: some da lista e alguém recria a
 * conta de quem foi desligado, achando que nunca existiu. É também o registro
 * visível de que a revogação aconteceu.
 */
export function StaffTable({
  members,
  onChanged,
}: {
  members: PlatformStaffMember[];
  onChanged: () => void;
}) {
  const [target, setTarget] = useState<PlatformStaffMember | null>(null);

  return (
    // A tabela é o card: dentro de Card.Root/Card.Body virava card em card.
    <>
      <Table.Root>
        <Table.Table cards>
          <Table.Header>
            <Table.Row>
              <Table.Head>Pessoa</Table.Head>
              <Table.Head>Papel</Table.Head>
              <Table.Head>Último acesso</Table.Head>
              <Table.Head>Situação</Table.Head>
              <Table.Head />
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {members.map((member) => (
              <Table.Row key={member.id}>
                <Table.Cell card="title" wrap>
                  <div className="flex min-w-0 flex-col gap-2">
                    <Title
                      variant="body-sm"
                      weight="semibold"
                      className="[overflow-wrap:anywhere]"
                      color={member.isActive ? "default" : "muted"}
                    >
                      {member.name}
                    </Title>
                    <Title
                      variant="micro"
                      color="muted"
                      className="[overflow-wrap:anywhere]"
                    >
                      {member.email}
                    </Title>
                  </div>
                </Table.Cell>

                <Table.Cell label="Papel">
                  <Badge.Root
                    color={STAFF_ROLE_COLOR[member.role]}
                    appearance="tinted"
                    size="xs"
                  >
                    <Badge.Text>{STAFF_ROLE_LABEL[member.role]}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>

                <Table.Cell
                  label="Último acesso"
                  variant="dim"
                  className="whitespace-nowrap"
                >
                  {lastAccessLabel(member)}
                </Table.Cell>

                <Table.Cell card="status" className="whitespace-nowrap">
                  <Title
                    variant="body-sm"
                    color={member.isActive ? "green" : "red"}
                  >
                    {member.isActive ? "Ativa" : "Revogada"}
                  </Title>
                </Table.Cell>

                <Table.Cell card="actions" className="text-right">
                  {canManage(member) ? (
                    <RowActions
                      label={`Ações de ${member.name}`}
                      actions={[
                        member.isActive
                          ? {
                              label: "Revogar acesso",
                              icon: UserX,
                              danger: true,
                              onClick: () => setTarget(member),
                            }
                          : {
                              label: "Reativar acesso",
                              icon: UserCheck,
                              onClick: () => setTarget(member),
                            },
                      ]}
                    />
                  ) : (
                    // Conta de Super Admin não se altera pela tela — o botão
                    // some em vez de aparecer e recusar.
                    <Title variant="micro" color="muted">
                      pelo servidor
                    </Title>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Table>

        <Table.Footer>
          <Table.Footer.Info>
            {plural(members.length, "conta", "contas")} com acesso à plataforma
            · {members.filter((m) => m.isActive).length} ativas
          </Table.Footer.Info>
        </Table.Footer>
      </Table.Root>

      <RevokeAccessModal
        member={target}
        onOpenChange={(open) => !open && setTarget(null)}
        onDone={onChanged}
      />
    </>
  );
}
