"use client";

import { EmptyState } from "@/components/EmptyState";
import { Input, InputSearch, SelectOption } from "@/components/Input";
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
  loading,
  totalItems: totalCount,
  currentPage,
  totalPages,
  setCurrentPage,
  sellerOptions,
}: ClientsTableProps) {
  const selectedSeller =
    sellerOptions?.find((option) => option.value === inputValues.sellerId) ??
    null;

  return (
    <Table.Root data-tour="clients-table">
      <Table.CardHead>
        <Table.CardHead.Title>Carteira de clientes</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <div className="flex items-center gap-8">
            {sellerOptions && (
              <div className="desktop:w-[200px] w-full">
                <Input.Select
                  size="sm"
                  options={sellerOptions}
                  value={selectedSeller}
                  variant="single"
                  placeholder="Todos os vendedores"
                  onChange={(val: SelectOption | SelectOption[] | null) => {
                    const option = Array.isArray(val) ? val[0] : val;
                    setFilter("sellerId", option?.value);
                  }}
                />
              </div>
            )}
            <InputSearch
              size="sm"
              placeholder="Buscar por razão social ou nome fantasia..."
              data-tour="clients-search"
              value={inputValues.search ?? ""}
              onChange={(e) => setFilter("search", e.target.value || undefined)}
            />
          </div>
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            {/* CNPJ e CNAE moram dentro da coluna Cliente (ver ClientCell). */}
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Cidade</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Última Compra</Table.Head>
            <Table.Head>Última Visita</Table.Head>
            <Table.Head>Score</Table.Head>
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
                    {inputValues.search
                      ? "Nenhum cliente encontrado"
                      : "Nenhum cliente na carteira"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {inputValues.search
                      ? "Tente ajustar a busca para encontrar o cliente."
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
