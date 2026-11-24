"use client";

import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { formatDate } from "@/utils/format/date";
import { scoreBarColor, formatScore } from "@/utils/score";
import { Users } from "lucide-react";
import { CLIENT_COLUMN_HELP } from "../../help";
import { formatCity } from "../../utils";
import { ClientCell } from "./ClientCell";
import { ClientIdentityCells } from "./ClientIdentityCells";
import { ClientStatusTags } from "./ClientStatusTags";
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
  showSeller,
}: ClientsTableProps) {
  const columnCount = showSeller ? 6 : 5;

  // A lista vazia diz coisas diferentes: "sua carteira está vazia" é um estado
  // do sistema, "não achei nada" é consequência do que a pessoa pediu.
  const isNarrowed = Object.values(inputValues).some(Boolean);

  return (
    <Table.Root sort={sort} data-tour="clients-table">
      <Table.CardHead>
        <Table.CardHead.Title>Carteira de clientes</Table.CardHead.Title>
        <Table.CardHead.Actions>
          {/* A busca fica à vista, fora do painel: é por onde quase sempre se
              começa, e escondida atrás de "Filtros" ninguém a achava. O campo
              continua em `filterFields` (escondido) para o aviso dos KPIs
              nomeá-la; o "x" do próprio campo a limpa. */}
          <InputSearch
            size="sm"
            aria-label="Buscar cliente"
            // "Nome, razão social ou CNPJ" era cortado no celular; "nome" já
            // cobre apelido, fantasia e razão social.
            placeholder="Nome ou CNPJ"
            data-tour="clients-search"
            value={inputValues.search ?? ""}
            onChange={(e) => setFilter("search", e.target.value || undefined)}
          />
          <Filters
            resultCount={totalCount}
            resultLoading={loading}
            fields={filterFields}
            values={inputValues}
            onChange={setFilters}
            data-tour="clients-filters"
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            {/* CNPJ e CNAE moram dentro da coluna Cliente (ver ClientCell). */}
            <Table.Head
              sortKey="razao_social"
              title={CLIENT_COLUMN_HELP.client}
            >
              Cliente
            </Table.Head>
            <Table.Head sortKey="address_city" title={CLIENT_COLUMN_HELP.city}>
              Cidade
            </Table.Head>
            {/* Vendedor não ordena: o cliente pode ter vários, e não existe
                "o vendedor" da linha para comparar. */}
            {showSeller && (
              <Table.Head title={CLIENT_COLUMN_HELP.seller}>
                Vendedor
              </Table.Head>
            )}
            {/* As duas datas ordenam por subconsulta que repete a regra da
                célula — ver _COMPUTED_ORDER_COLUMNS no ClientRepository. */}
            <Table.Head
              sortKey="last_order_date"
              sortFirst="desc"
              title={CLIENT_COLUMN_HELP.lastOrder}
            >
              Última Compra
            </Table.Head>
            <Table.Head
              sortKey="last_visit_date"
              sortFirst="desc"
              title={CLIENT_COLUMN_HELP.lastVisit}
            >
              Última Visita
            </Table.Head>
            {/* Score maior = mais urgente, então o 1º clique traz o topo. */}
            <Table.Head
              sortKey="visit_score_total"
              sortFirst="desc"
              title={CLIENT_COLUMN_HELP.score}
            >
              Score
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={columnCount} rows={5} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columnCount}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <Users />
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
                <ClientIdentityCells client={node} />

                <Table.Cell
                  variant="dim"
                  className="whitespace-nowrap"
                  label="Cidade"
                >
                  {formatCity(node.addressCity, node.addressState)}
                </Table.Cell>

                {showSeller && (
                  <SellerCell
                    sellers={node.companyClient?.sellers ?? []}
                    highlightSellerId={inputValues.sellerId ?? null}
                  />
                )}

                <Table.Cell
                  variant="dim"
                  className="whitespace-nowrap"
                  label="Última compra"
                >
                  {/* "Nunca comprou" diz o fato; o "—" virava "Não informado",
                      que sugere dado faltando. */}
                  {formatDate(
                    node.companyClient?.lastOrderDate,
                    "Nunca comprou"
                  )}
                </Table.Cell>

                <Table.Cell
                  variant="dim"
                  className="whitespace-nowrap"
                  label="Última visita"
                >
                  {formatDate(
                    node.companyClient?.lastVisitDate,
                    "Nunca visitado"
                  )}
                </Table.Cell>

                {node.companyClient?.visitScoreTotal != null ? (
                  <Table.ScoreCell
                    data-label="Score"
                    score={Number(node.companyClient.visitScoreTotal)}
                    color={scoreBarColor(
                      Number(node.companyClient.visitScoreTotal)
                    )}
                    label={formatScore(node.companyClient.visitScoreTotal)}
                  >
                    <ClientStatusTags
                      client={node}
                      className="desktop:hidden ml-8"
                    />
                  </Table.ScoreCell>
                ) : (
                  <Table.ScoreCell data-label="Score" score={0} noBar label="—">
                    <ClientStatusTags
                      client={node}
                      className="desktop:hidden ml-8"
                    />
                  </Table.ScoreCell>
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
