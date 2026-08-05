"use client";

import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { formatDate } from "@/utils/format/date";
import { scoreBarColor } from "@/utils/score";
import { Users } from "lucide-react";
import { formatCity } from "../../utils";
import { ClientCell } from "./ClientCell";
import { ClientsTableProps } from "./interface";
import { SellerCell } from "./SellerCell";

export function ClientsTable({
  items,
  inputValues,
  setFilter,
  setFilters,
  sort,
  filterFields,
  loading,
  totalItems: totalCount,
  currentPage,
  totalPages,
  setCurrentPage,
}: ClientsTableProps) {
  // A lista vazia diz coisas diferentes: "sua carteira está vazia" é um estado
  // do sistema, "não achei nada" é consequência do que a pessoa pediu.
  const isNarrowed = Object.values(inputValues).some(Boolean);

  return (
    <Table.Root sort={sort} data-tour="clients-table">
      <Table.CardHead>
        <Table.CardHead.Title>Carteira de clientes</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            fields={filterFields}
            values={inputValues}
            onChange={setFilters}
            // A busca vai por aqui para manter o debounce do campo: pelo
            // `onChange` cada tecla viraria uma consulta ao backend.
            onTextChange={setFilter}
            data-tour="clients-filters"
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            {/* CNPJ e CNAE moram dentro da coluna Cliente (ver ClientCell). */}
            <Table.Head sortKey="razao_social">Cliente</Table.Head>
            <Table.Head sortKey="address_city">Cidade</Table.Head>
            {/* Vendedor não ordena: o cliente pode ter vários, e não existe
                "o vendedor" da linha para comparar. */}
            <Table.Head>Vendedor</Table.Head>
            {/* As duas datas ordenam por subconsulta que repete a regra da
                célula — ver _COMPUTED_ORDER_COLUMNS no ClientRepository. */}
            <Table.Head sortKey="last_order_date" sortFirst="desc">
              Última Compra
            </Table.Head>
            <Table.Head sortKey="last_visit_date" sortFirst="desc">
              Última Visita
            </Table.Head>
            {/* Score maior = mais urgente, então o 1º clique traz o topo. */}
            <Table.Head sortKey="visit_score_total" sortFirst="desc">
              Score
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={6} rows={5} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Users size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {isNarrowed
                      ? "Nenhum cliente encontrado"
                      : "Nenhum cliente na carteira"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "Tente ajustar a busca ou os filtros para encontrar o cliente."
                      : "Os clientes vinculados às fábricas que você atende aparecerão aqui."}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((node) => (
              <Table.Row
                key={node.id}
                href={`/clients/${node.companyClient?.id ?? node.id}/overview`}
                data-tour="clients-row"
                className="group"
              >
                <ClientCell client={node} />

                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatCity(node.addressCity, node.addressState)}
                </Table.Cell>

                <SellerCell
                  sellers={node.companyClient?.sellers ?? []}
                  highlightSellerId={inputValues.sellerId ?? null}
                />

                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatDate(node.companyClient?.lastOrderDate)}
                </Table.Cell>

                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatDate(node.companyClient?.lastVisitDate)}
                </Table.Cell>

                {node.companyClient?.visitScoreTotal != null ? (
                  <Table.ScoreCell
                    score={Number(node.companyClient.visitScoreTotal)}
                    color={scoreBarColor(
                      Number(node.companyClient.visitScoreTotal)
                    )}
                    label={Number(node.companyClient.visitScoreTotal).toFixed(
                      0
                    )}
                  />
                ) : (
                  <Table.ScoreCell score={0} noBar label="—" />
                )}
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
            ? `${totalCount} clientes · página ${currentPage} de ${totalPages}`
            : "Nenhum cliente encontrado"}
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
