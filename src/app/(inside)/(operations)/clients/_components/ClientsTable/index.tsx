"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { maskCNPJ } from "@/utils/format/masks";
import { scoreBarColor } from "@/utils/score";
import { Users } from "lucide-react";
import { formatCity } from "../../utils";
import { ClientsTableProps } from "./interface";

export function ClientsTable({
  items,
  inputValues,
  setFilter,
  loading,
  totalItems: totalCount,
  currentPage,
  totalPages,
  setCurrentPage,
}: ClientsTableProps) {
  return (
    <Table.Root data-tour="clients-table">
      <Table.CardHead>
        <Table.CardHead.Title>Carteira de clientes</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <div className="flex items-center gap-8">
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
            <Table.Head>Cliente</Table.Head>
            <Table.Head>CNPJ</Table.Head>
            <Table.Head>CNAE</Table.Head>
            <Table.Head>Cidade</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Última Visita</Table.Head>
            <Table.Head>Score</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={7} rows={5} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={7}>
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
                {/* whitespace-nowrap: a coluna não quebra palavra a palavra; como
                    a tabela já rola na horizontal, o nome fica em uma linha. */}
                <Table.Cell className="whitespace-nowrap">
                  <div className="flex flex-col gap-2">
                    <Table.CellText variant="strong">
                      {node.razaoSocial}
                    </Table.CellText>
                    <Table.CellText variant="dim">
                      {node.nomeFantasia
                        ? `${node.nomeFantasia} · Cód: ${node.id.slice(0, 8).toUpperCase()}`
                        : `Cód: ${node.id.slice(0, 8).toUpperCase()}`}
                    </Table.CellText>
                  </div>
                </Table.Cell>

                <Table.Cell>
                  <Badge.Root color="subtle" appearance="tinted">
                    <Badge.Text>{maskCNPJ(node.cnpj)}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>

                <Table.Cell variant="dim" className="text-[13px]">
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{node.cnae ?? "—"}</div>
                    <div className="line-clamp-2">{node.cnaeDescription}</div>
                  </div>
                </Table.Cell>

                <Table.Cell variant="dim">
                  {formatCity(node.addressCity, node.addressState)}
                </Table.Cell>

                <Table.Cell flex>
                  <Avatar size="sm" color="amber" initials="—" />
                  <Table.CellText variant="dim">—</Table.CellText>
                </Table.Cell>

                <Table.Cell variant="dim">—</Table.Cell>

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
