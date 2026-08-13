"use client";

import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { Building2 } from "lucide-react";
import { ActivityCell } from "./ActivityCell";
import { TenantsTableProps } from "./interface";
import { TenantCell } from "./TenantCell";

const COLUMN_COUNT = 6;

export function TenantsTable({
  items,
  inputValues,
  setFilter,
  setFilters,
  sort,
  filterFields,
  loading,
  totalItems,
  currentPage,
  totalPages,
  setCurrentPage,
}: TenantsTableProps) {
  // "Nenhuma empresa na plataforma" e "nenhuma empresa com esse filtro" são
  // estados diferentes, e o texto genérico confundiria os dois.
  const isNarrowed = Object.values(inputValues).some(Boolean);

  return (
    <Table.Root sort={sort}>
      <Table.CardHead>
        <Table.CardHead.Title>Empresas da plataforma</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            fields={filterFields}
            values={inputValues}
            onChange={setFilters}
            // A busca vai pelo `onTextChange` para manter o debounce do campo:
            // pelo `onChange` cada tecla viraria uma consulta.
            onTextChange={setFilter}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="razao_social">Empresa</Table.Head>
            <Table.Head sortKey="plan">Plano</Table.Head>
            <Table.Head sortKey="users_count" sortFirst="desc">
              Pessoas
            </Table.Head>
            <Table.Head sortKey="clients_count" sortFirst="desc">
              Clientes
            </Table.Head>
            {/* Volume do período, não histórico: é o que diz se a empresa está
                operando AGORA. O total acumulado premiaria quem já foi grande. */}
            <Table.Head sortKey="gmv_in_period" sortFirst="desc">
              Volume (30d)
            </Table.Head>
            <Table.Head sortKey="last_login_at" sortFirst="desc">
              Último acesso
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={COLUMN_COUNT} rows={5} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMN_COUNT}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Building2 size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {isNarrowed
                      ? "Nenhuma empresa encontrada"
                      : "Nenhuma empresa na plataforma"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "Ajuste a busca ou os filtros para encontrar a empresa."
                      : "Provisione a primeira empresa para começar."}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((tenant) => (
              <Table.Row
                key={tenant.id}
                href={`/platform/companies/${tenant.id}`}
              >
                <TenantCell tenant={tenant} />

                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {tenant.plan}
                </Table.Cell>

                <Table.Cell variant="dim">{tenant.usersCount}</Table.Cell>

                <Table.Cell variant="dim">{tenant.clientsCount}</Table.Cell>

                <Table.Cell className="whitespace-nowrap">
                  <div className="flex flex-col gap-[2px]">
                    <Title variant="body-sm">
                      {formatMoney(tenant.gmvInPeriod)}
                    </Title>
                    <Title variant="micro" color="muted">
                      {tenant.ordersInPeriod} pedidos
                    </Title>
                  </div>
                </Table.Cell>

                <ActivityCell lastLoginAt={tenant.lastLoginAt} />
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
          {totalItems > 0
            ? `${totalItems} empresas · página ${currentPage} de ${totalPages}`
            : "Nenhuma empresa encontrada"}
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
