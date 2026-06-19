"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { formatDateDMY } from "@/utils/format/masks";
import { Users } from "lucide-react";
import { User } from "../../interface";
import { ROLE_COLOR } from "../../utils";
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
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Usuários</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <div className="flex items-center gap-8">
            <InputSearch
              placeholder="Buscar por nome..."
              value={inputValues.search ?? ""}
              onChange={(e) => setFilter("search", e.target.value || undefined)}
            />
          </div>
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Usuário</Table.Head>
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
                  <EmptyState.Title>Nenhum usuário encontrado</EmptyState.Title>
                  <EmptyState.Description>
                    Adicione um novo usuário ou ajuste os filtros de busca.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((node) => (
              <Table.Row key={node.id} className="group">
                <Table.Cell flex>
                  <Avatar
                    size="md"
                    color={ROLE_COLOR[node.role as keyof typeof ROLE_COLOR]}
                    initials={node.name.slice(0, 2).toUpperCase()}
                  />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <Table.CellText variant="strong">
                        {node.name}
                      </Table.CellText>

                      <Table.CellText variant="dim2">
                        Criado em {formatDateDMY(node.createdAt)}
                      </Table.CellText>
                    </div>
                    <Table.CellText variant="dim">{node.email}</Table.CellText>
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
                    color={ROLE_COLOR[node.role as keyof typeof ROLE_COLOR]}
                    appearance="tinted"
                  >
                    <Badge.Text>{node.role}</Badge.Text>
                  </Badge.Root>

                  <UserRowActions
                    user={node}
                    onUpdateOptimistic={onUpdateOptimistic}
                    onRemoveOptimistic={onRemoveOptimistic}
                    onCommit={onCommit}
                    onRollback={onRollback}
                  />
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>

      <Table.Footer>
        <Table.Footer.Info>
          {loading && items.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {totalCount > 0
            ? `${totalCount} usuários · página ${currentPage} de ${totalPages}`
            : "Nenhum usuário encontrado"}
        </Table.Footer.Info>

        <Pagination.Smart
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Table.Footer>
    </Table.Root>
  );
}
