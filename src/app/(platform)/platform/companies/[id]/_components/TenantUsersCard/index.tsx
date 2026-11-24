"use client";

import { EmptyState } from "@/components/EmptyState";
import { RowActions } from "@/components/RowActions";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { KeyRound, LogIn, UserCog } from "lucide-react";
import { useState } from "react";
import { AccessLinkModal } from "../../../../_components/AccessLinkModal";
import { TenantUser } from "../../interface";
import { ROLE_LABEL, activityLabel, daysSinceLogin } from "../../../../utils";
import { useImpersonate } from "../../../../useImpersonate";

interface Props {
  users: TenantUser[];
  loading: boolean;
}

/**
 * Pessoas da empresa e as duas ações de suporte que se fazem sobre elas:
 * liberar o acesso e entrar como.
 *
 * Ficam aqui, e não numa tela de "usuários da plataforma", porque é sempre a
 * partir de uma empresa que o chamado chega — "fulano da tal empresa não
 * consegue entrar".
 */
export function TenantUsersCard({ users, loading }: Props) {
  const [linkTarget, setLinkTarget] = useState<TenantUser | null>(null);
  const { impersonate, impersonating } = useImpersonate();

  return (
    <>
      {/* A tabela é o card: dentro de um Card.Root virava card em card. */}
      <Table.Root>
        <Table.CardHead>
          <Table.CardHead.Title>Pessoas</Table.CardHead.Title>
          <Table.CardHead.Description>
            Liberar acesso emite um link novo e derruba os anteriores. Entrar
            como abre uma sessão de 1 hora, registrada na auditoria.
          </Table.CardHead.Description>
        </Table.CardHead>

        <Table.Table cards>
          <Table.Header>
            <Table.Row>
              <Table.Head>Pessoa</Table.Head>
              <Table.Head>Papel</Table.Head>
              <Table.Head>Último acesso</Table.Head>
              <Table.Head className="text-right">Ações</Table.Head>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {loading && users.length === 0 ? (
              <Table.Skeleton columns={4} rows={3} />
            ) : users.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <EmptyState.Root flat>
                    <EmptyState.Icon>
                      <UserCog />
                    </EmptyState.Icon>
                    <EmptyState.Title>
                      Nenhuma pessoa cadastrada
                    </EmptyState.Title>
                    <EmptyState.Description>
                      A empresa foi criada mas ainda não tem usuários.
                    </EmptyState.Description>
                  </EmptyState.Root>
                </Table.Cell>
              </Table.Row>
            ) : (
              users.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell card="title" wrap>
                    <div className="flex min-w-0 flex-col gap-2">
                      <Title
                        variant="body-sm"
                        weight="semibold"
                        className="[overflow-wrap:anywhere]"
                      >
                        {user.name}
                      </Title>
                      <Title
                        variant="micro"
                        color="muted"
                        className="[overflow-wrap:anywhere]"
                      >
                        {user.email}
                      </Title>
                    </div>
                  </Table.Cell>

                  <Table.Cell
                    label="Papel"
                    variant="dim"
                    className="whitespace-nowrap"
                  >
                    {ROLE_LABEL[user.role] ?? user.role}
                    {!user.isActive && " · desativada"}
                  </Table.Cell>

                  <Table.Cell
                    label="Último acesso"
                    variant="dim"
                    className="whitespace-nowrap"
                  >
                    {activityLabel(daysSinceLogin(user.lastLoginAt))}
                  </Table.Cell>

                  <Table.Cell card="actions">
                    <RowActions
                      label={`Ações de ${user.name}`}
                      actions={[
                        {
                          label: "Liberar acesso",
                          icon: KeyRound,
                          disabled: !user.isActive,
                          onClick: () => setLinkTarget(user),
                        },
                        // SU não entra como SU: o backend recusa, e a ação
                        // some para não oferecer o que não se pode fazer.
                        {
                          label: "Entrar como",
                          icon: LogIn,
                          absent: user.role === "SU",
                          disabled: !user.isActive || impersonating === user.id,
                          onClick: () => impersonate(user.id),
                        },
                      ]}
                    />
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Table>
      </Table.Root>

      <AccessLinkModal
        user={linkTarget}
        onOpenChange={(open) => !open && setLinkTarget(null)}
      />
    </>
  );
}
