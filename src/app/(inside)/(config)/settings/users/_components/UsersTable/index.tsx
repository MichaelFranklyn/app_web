"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { formatDateDMY, maskPhoneBR } from "@/utils/format/masks";
import { Users } from "lucide-react";
import { User } from "../../interface";
import { ROLE_COLOR, ROLE_LABEL, UserRole } from "../../utils";
import { fieldSummary } from "./utils";
import { UserRowActions } from "./UserRowActions";

interface UsersTableProps {
  items: User[];
  loading: boolean;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  setCurrentPage: (page: number) => void;
  onUpdateOptimistic: (id: string, updates: Partial<User>) => void;
  onRemoveOptimistic: (id: string) => void;
  onRollback: () => void;
  onCommit: () => void;
}

/**
 * Uma lista só de pessoas: vendedor não é outra entidade, é um usuário que
 * também opera em campo — o que aparece a mais nele é o badge e o resumo de
 * fábricas/carteira. A linha abre o perfil completo.
 */
export function UsersTable({
  items,
  loading,
  totalItems: totalCount,
  currentPage,
  totalPages,
  inputValues,
  setFilter,
  setCurrentPage,
  onUpdateOptimistic,
  onRemoveOptimistic,
  onRollback,
  onCommit,
}: UsersTableProps) {
  const isEmpty = !loading && items.length === 0;

  return (
    <Tabs.Content value="pessoas">
      <Table.Root className="mt-16" data-tour="users-table">
        <Table.CardHead>
          <Table.CardHead.Title>Pessoas da empresa</Table.CardHead.Title>
          <Table.CardHead.Actions>
            <InputSearch
              size="sm"
              placeholder="Buscar por nome..."
              data-tour="users-search"
              value={inputValues.search ?? ""}
              onChange={(e) => setFilter("search", e.target.value || undefined)}
            />
          </Table.CardHead.Actions>
        </Table.CardHead>

        <Table.Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Pessoa</Table.Head>
              <Table.Head />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading && items.length === 0 ? (
              <Table.Skeleton columns={2} rows={5} />
            ) : isEmpty ? (
              <Table.Row>
                <Table.Cell colSpan={2}>
                  <EmptyState.Root>
                    <EmptyState.Icon>
                      <Users size={32} />
                    </EmptyState.Icon>
                    <EmptyState.Title>
                      Nenhuma pessoa encontrada
                    </EmptyState.Title>
                    <EmptyState.Description>
                      Adicione alguém à equipe ou ajuste a busca.
                    </EmptyState.Description>
                  </EmptyState.Root>
                </Table.Cell>
              </Table.Row>
            ) : (
              items.map((node) => {
                const role = node.role as UserRole;
                const summary = fieldSummary(node);

                return (
                  // A linha abre o perfil completo (dados, e — quando a pessoa
                  // vende — rotina, fábricas e carteira).
                  <Table.Row
                    key={node.id}
                    className="group"
                    href={`/settings/users/${node.id}`}
                  >
                    <Table.Cell flex>
                      <Avatar
                        size="md"
                        color={ROLE_COLOR[role] ?? "neutral"}
                        initials={node.name.slice(0, 2).toUpperCase()}
                      />

                      {/* Identidade numa coluna só: a tabela nunca rola. */}
                      <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex items-center gap-4">
                          <Table.CellText variant="strong">
                            {node.name}
                          </Table.CellText>
                          <Table.CellText variant="dim2">
                            desde {formatDateDMY(node.createdAt)}
                          </Table.CellText>
                        </div>
                        <Table.CellText variant="dim">
                          {node.email}
                          {node.phone ? ` · ${maskPhoneBR(node.phone)}` : ""}
                        </Table.CellText>
                        {summary && (
                          <Table.CellText variant="dim2">
                            {summary}
                          </Table.CellText>
                        )}
                      </div>
                    </Table.Cell>

                    <Table.Cell flex className="justify-end">
                      <Badge.Root
                        color={node.isActive ? "green" : "neutral"}
                        appearance="tinted"
                      >
                        <Badge.Text>
                          {node.isActive ? "Ativo" : "Inativo"}
                        </Badge.Text>
                      </Badge.Root>

                      <Badge.Root
                        color={ROLE_COLOR[role] ?? "neutral"}
                        appearance="tinted"
                      >
                        <Badge.Text>{ROLE_LABEL[role] ?? node.role}</Badge.Text>
                      </Badge.Root>

                      {node.seller && (
                        <Badge.Root color="cyan" appearance="tinted">
                          <Badge.Text>Vende em campo</Badge.Text>
                        </Badge.Root>
                      )}

                      <UserRowActions
                        user={node}
                        onUpdateOptimistic={onUpdateOptimistic}
                        onRemoveOptimistic={onRemoveOptimistic}
                        onCommit={onCommit}
                        onRollback={onRollback}
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Table>

        <Table.Footer>
          <Table.Footer.Info>
            {loading && items.length > 0 && (
              <Loading.Spinner size="sm" className="mr-6 inline-block" />
            )}
            {totalCount > 0
              ? `${totalCount} pessoas · página ${currentPage} de ${totalPages}`
              : "Nenhuma pessoa encontrada"}
          </Table.Footer.Info>

          <Pagination.Smart
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Table.Footer>
      </Table.Root>
    </Tabs.Content>
  );
}
