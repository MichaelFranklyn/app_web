"use client";

import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { Pagination } from "@/components/Pagination";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useTableData } from "@/hooks/useTableData";
import { UserCog } from "lucide-react";
import { ROLE_LABEL, activityLabel, daysSinceLogin } from "../utils";
import { PLATFORM_USERS_QUERY } from "./gql";
import {
  PlatformUserRow,
  UsersContentProps,
  UsersQueryData,
} from "./interface";
import { ITEMS_PER_PAGE, ROLE_OPTIONS, TABLE_FIELDS } from "./utils";

const COLUMN_COUNT = 4;

/**
 * Todas as pessoas da plataforma, de todas as empresas.
 *
 * Existe para a busca que a lista por empresa não resolve: chega um e-mail no
 * suporte e ninguém sabe de qual tenant ele é. Daí a coluna de empresa e a
 * busca por e-mail serem o centro da tela.
 */
export default function PlatformUsersContent({
  initialData,
}: UsersContentProps) {
  const tableData = useTableData<UsersQueryData, PlatformUserRow>({
    query: PLATFORM_USERS_QUERY,
    fields: TABLE_FIELDS,
    getConnection: (data) => data.platform_users,
    itemsPerPage: ITEMS_PER_PAGE,
    initialData: initialData ?? undefined,
  });

  const isNarrowed = Object.values(tableData.inputValues).some(Boolean);

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow className="text-(--purple)">
              Console
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>Pessoas</PanelHeader.Title>
            <PanelHeader.Description>
              Todas as contas da plataforma. Abra uma para liberar acesso,
              entrar como ela e ver o que fez.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {tableData.error && tableData.displayedData.length === 0 ? (
        <QueryError onRetry={() => tableData.refetch()} />
      ) : (
        <Table.Root sort={tableData.sort}>
          <Table.CardHead>
            <Table.CardHead.Title>Contas</Table.CardHead.Title>
            <Table.CardHead.Actions>
              <Filters
                fields={[
                  {
                    type: "text",
                    key: "search",
                    label: "Buscar",
                    placeholder: "Nome ou e-mail",
                  },
                  {
                    type: "select",
                    key: "role",
                    label: "Papel",
                    placeholder: "Todos os papéis",
                    options: ROLE_OPTIONS,
                  },
                ]}
                values={tableData.inputValues}
                onChange={tableData.setFilters}
                onTextChange={tableData.setFilter}
              />
            </Table.CardHead.Actions>
          </Table.CardHead>

          <Table.Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Pessoa</Table.Head>
                <Table.Head>Empresa</Table.Head>
                <Table.Head>Papel</Table.Head>
                <Table.Head>Último acesso</Table.Head>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {tableData.loading && tableData.displayedData.length === 0 ? (
                <Table.Skeleton columns={COLUMN_COUNT} rows={5} />
              ) : tableData.displayedData.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={COLUMN_COUNT}>
                    <EmptyState.Root>
                      <EmptyState.Icon>
                        <UserCog size={32} />
                      </EmptyState.Icon>
                      <EmptyState.Title>
                        {isNarrowed
                          ? "Nenhuma pessoa encontrada"
                          : "Nenhuma pessoa na plataforma"}
                      </EmptyState.Title>
                      <EmptyState.Description>
                        {isNarrowed
                          ? "Ajuste a busca ou o filtro de papel."
                          : "As contas aparecem aqui conforme as empresas são provisionadas."}
                      </EmptyState.Description>
                    </EmptyState.Root>
                  </Table.Cell>
                </Table.Row>
              ) : (
                tableData.displayedData.map((user) => (
                  // A linha leva à PESSOA, não à empresa: a lista existe para
                  // achar alguém pelo e-mail, e o passo seguinte é agir sobre
                  // essa conta. A empresa fica a um clique, na ficha.
                  <Table.Row key={user.id} href={`/platform/users/${user.id}`}>
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

                    <Table.Cell variant="dim" className="max-w-[220px]">
                      <span className="block truncate">{user.companyName}</span>
                    </Table.Cell>

                    <Table.Cell variant="dim" className="whitespace-nowrap">
                      {ROLE_LABEL[user.role] ?? user.role}
                      {!user.isActive && " · desativada"}
                    </Table.Cell>

                    <Table.Cell variant="dim" className="whitespace-nowrap">
                      {activityLabel(daysSinceLogin(user.lastLoginAt))}
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Table>

          <Table.Footer>
            <Table.Footer.Info>
              {tableData.loading && tableData.displayedData.length > 0 && (
                <Loading.Spinner size="sm" className="mr-6 inline-block" />
              )}
              {tableData.totalItems > 0
                ? `${tableData.totalItems} pessoas · página ${tableData.currentPage} de ${tableData.totalPages}`
                : "Nenhuma pessoa encontrada"}
            </Table.Footer.Info>

            <Pagination.Smart
              currentPage={tableData.currentPage}
              totalPages={tableData.totalPages}
              onPageChange={tableData.setCurrentPage}
            />
          </Table.Footer>
        </Table.Root>
      )}
    </PageContent>
  );
}
