"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
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
      <Card.Root>
        <Card.Header>
          <Card.Header.Title size="sm" weight="semibold">
            Pessoas
          </Card.Header.Title>
          <Card.Header.Description>
            Liberar acesso emite um link novo e derruba os anteriores. Entrar
            como abre uma sessão de 1 hora, registrada na auditoria.
          </Card.Header.Description>
        </Card.Header>

        <Table.Root>
          <Table.Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Pessoa</Table.Head>
                <Table.Head>Papel</Table.Head>
                <Table.Head>Último acesso</Table.Head>
                <Table.Head>Ações</Table.Head>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {loading && users.length === 0 ? (
                <Table.Skeleton columns={4} rows={3} />
              ) : users.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={4}>
                    <EmptyState.Root>
                      <EmptyState.Icon>
                        <UserCog size={32} />
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
                    <Table.Cell className="max-w-[260px]">
                      <div className="flex min-w-0 flex-col gap-[2px]">
                        <Title
                          variant="body-sm"
                          weight="semibold"
                          className="truncate"
                        >
                          {user.name}
                        </Title>
                        <Title
                          variant="micro"
                          color="muted"
                          className="truncate"
                        >
                          {user.email}
                        </Title>
                      </div>
                    </Table.Cell>

                    <Table.Cell variant="dim" className="whitespace-nowrap">
                      {ROLE_LABEL[user.role] ?? user.role}
                      {!user.isActive && " · desativada"}
                    </Table.Cell>

                    <Table.Cell variant="dim" className="whitespace-nowrap">
                      {activityLabel(daysSinceLogin(user.lastLoginAt))}
                    </Table.Cell>

                    <Table.Cell>
                      <div className="flex gap-6">
                        <Button.Root
                          appearance="ghost"
                          color="neutral"
                          size="xs"
                          noUppercase
                          disabled={!user.isActive}
                          onClick={() => setLinkTarget(user)}
                        >
                          <Button.Icon icon={KeyRound} />
                          <Button.Title>Liberar acesso</Button.Title>
                        </Button.Root>

                        {/* SU não entra como SU: o backend recusa, e o botão
                            some para não oferecer o que não se pode fazer. */}
                        {user.role !== "SU" && (
                          <Button.Root
                            appearance="ghost"
                            color="neutral"
                            size="xs"
                            noUppercase
                            disabled={!user.isActive}
                            loading={impersonating === user.id}
                            onClick={() => impersonate(user.id)}
                          >
                            <Button.Icon icon={LogIn} />
                            <Button.Title>Entrar como</Button.Title>
                          </Button.Root>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Table>
        </Table.Root>
      </Card.Root>

      <AccessLinkModal
        user={linkTarget}
        onOpenChange={(open) => !open && setLinkTarget(null)}
      />
    </>
  );
}
