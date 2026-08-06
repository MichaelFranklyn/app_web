"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Users } from "lucide-react";

import { WalletRow, WalletScope } from "../../interface";
import {
  cadenceLabel,
  cityAndState,
  idleLabel,
  riskLabel,
  sumBy,
  WALLET_SCOPES,
  WALLET_SITUATION_COLOR,
  WALLET_SITUATION_HINT,
  WALLET_SITUATION_LABEL,
} from "../../utils";

interface Props {
  items: WalletRow[];
  loading: boolean;
  scope: WalletScope;
  onScopeChange: (scope: WalletScope) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
}

/**
 * A carteira, um cliente por linha, em ordem alfabética — é assim que se
 * procura um nome específico, e a urgência já está nas visões acima da tabela.
 *
 * A linha leva ao cliente pelo id do VÍNCULO (`companyClientId`), que é a chave
 * da rota /clients/[id]; sem vínculo a linha não vira link, em vez de levar a
 * uma página que não existe.
 */
export function WalletReportTable({
  items,
  loading,
  scope,
  onScopeChange,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}: Props) {
  const pageAmount = sumBy(items, (row) => row.periodAmount);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Clientes da carteira</Table.CardHead.Title>
        <Table.CardHead.Description>
          A situação compara cada cliente com o próprio ritmo de compra, e é um
          retrato de hoje — o período do filtro governa só as colunas do
          período.
        </Table.CardHead.Description>
      </Table.CardHead>

      <div className="px-12 pb-8">
        <Tabs.Root
          value={scope}
          onValueChange={(value) => onScopeChange(value as WalletScope)}
        >
          <Tabs.List>
            {WALLET_SCOPES.map((option) => (
              <Tabs.Item key={option.value} value={option.value}>
                {option.label}
              </Tabs.Item>
            ))}
          </Tabs.List>
        </Tabs.Root>
      </div>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Cidade/UF</Table.Head>
            <Table.Head>Situação</Table.Head>
            <Table.Head>Parado há</Table.Head>
            <Table.Head>Ritmo</Table.Head>
            <Table.Head>Atraso</Table.Head>
            <Table.Head>Última compra</Table.Head>
            <Table.Head>No período</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={8} rows={8} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Users size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhum cliente nesta visão
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Escolha outra situação acima ou confira se a carteira do
                    vendedor selecionado tem clientes vinculados.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((row) => (
              <Table.Row
                key={row.clientId}
                href={
                  row.companyClientId
                    ? `/clients/${row.companyClientId}`
                    : undefined
                }
              >
                <Table.Cell
                  variant="strong"
                  className="max-w-[240px] truncate"
                  title={row.clientName}
                >
                  {row.clientName}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {cityAndState(row)}
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={WALLET_SITUATION_COLOR[row.situation]}
                    appearance="tinted"
                  >
                    <Badge.Text>
                      <span title={WALLET_SITUATION_HINT[row.situation]}>
                        {WALLET_SITUATION_LABEL[row.situation]}
                      </span>
                    </Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {idleLabel(row)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {cadenceLabel(row)}
                </Table.Cell>
                <Table.Cell
                  variant={
                    row.riskRatio && row.riskRatio > 1 ? "strong" : "dim"
                  }
                  className="whitespace-nowrap"
                >
                  {riskLabel(row)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "—"}
                </Table.Cell>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatMoney(row.periodAmount)}
                  {row.periodOrderCount > 0 && (
                    <span className="ml-4 text-(--muted)">
                      {row.periodOrderCount} ped.
                    </span>
                  )}
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
          {/* Sem linhas quem fala é o estado vazio, não o rodapé. */}
          {totalItems > 0 &&
            `${totalItems} cliente(s) · página ${currentPage} de ${totalPages} · nesta página: ${formatMoney(pageAmount)}`}
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
