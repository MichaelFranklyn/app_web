"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { formatDateDMY, maskCNPJ } from "@/utils/format/masks";
import { Users } from "lucide-react";

import { ClientReportRow } from "../../interface";
import {
  cityAndState,
  daysSinceOrder,
  idleLabel,
  scoreLabel,
  sellerNames,
} from "../../utils";

interface Props {
  items: ClientReportRow[];
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
}

/** Acima disso o cliente já passou de um mês parado — destaca em âmbar. */
const IDLE_WARN_DAYS = 30;

export function ClientsReportTable({
  items,
  loading,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}: Props) {
  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Carteira de clientes</Table.CardHead.Title>
        <Table.CardHead.Description>
          Retrato de hoje: quem está na carteira, quando comprou e quando foi
          visitado pela última vez.
        </Table.CardHead.Description>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>CNPJ</Table.Head>
            <Table.Head>Cidade / UF</Table.Head>
            <Table.Head>Rede</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Última compra</Table.Head>
            <Table.Head>Sem comprar</Table.Head>
            <Table.Head>Última visita</Table.Head>
            <Table.Head>Score</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={9} rows={8} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={9}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Users size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhum cliente na carteira
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Vincule clientes em Clientes para o relatório ter linhas.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((row) => {
              const idleDays = daysSinceOrder(row.companyClient?.lastOrderDate);
              const isIdle = idleDays === null || idleDays > IDLE_WARN_DAYS;

              return (
                <Table.Row
                  key={row.id}
                  href={
                    row.companyClient
                      ? `/clients/${row.companyClient.id}`
                      : undefined
                  }
                >
                  <Table.Cell
                    variant="strong"
                    className="max-w-[240px] truncate"
                    title={row.razaoSocial}
                  >
                    <span className="inline-flex items-center gap-6">
                      {row.nomeFantasia ?? row.razaoSocial}
                      {row.isNeedsAttention && (
                        <Badge.Root color="amber" appearance="tinted">
                          <Badge.Text>Precisa de atenção</Badge.Text>
                        </Badge.Root>
                      )}
                    </span>
                  </Table.Cell>
                  <Table.Cell variant="dim" className="whitespace-nowrap">
                    {maskCNPJ(row.cnpj)}
                  </Table.Cell>
                  <Table.Cell variant="dim">{cityAndState(row)}</Table.Cell>
                  <Table.Cell variant="dim">
                    {row.companyClient?.network?.name ?? "—"}
                  </Table.Cell>
                  <Table.Cell
                    variant="dim"
                    className="max-w-[160px] truncate"
                    title={sellerNames(row)}
                  >
                    {sellerNames(row)}
                  </Table.Cell>
                  <Table.Cell variant="dim" className="whitespace-nowrap">
                    {row.companyClient?.lastOrderDate
                      ? formatDateDMY(row.companyClient.lastOrderDate)
                      : "—"}
                  </Table.Cell>
                  {/* A coluna que decide a visita: destacada quando passou de um
                      mês, e "nunca comprou" é o caso mais urgente de todos. */}
                  <Table.Cell
                    variant={isIdle ? "default" : "dim"}
                    className="whitespace-nowrap"
                  >
                    {isIdle ? (
                      <Badge.Root
                        color={idleDays === null ? "red" : "amber"}
                        appearance="tinted"
                      >
                        <Badge.Text>
                          {idleLabel(row.companyClient?.lastOrderDate)}
                        </Badge.Text>
                      </Badge.Root>
                    ) : (
                      idleLabel(row.companyClient?.lastOrderDate)
                    )}
                  </Table.Cell>
                  <Table.Cell variant="dim" className="whitespace-nowrap">
                    {row.companyClient?.lastVisitDate
                      ? formatDateDMY(row.companyClient.lastVisitDate)
                      : "—"}
                  </Table.Cell>
                  <Table.Cell variant="dim">{scoreLabel(row)}</Table.Cell>
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
          {/* Sem linhas quem fala é o estado vazio, não o rodapé. */}
          {totalItems > 0 &&
            `${totalItems} cliente(s) · página ${currentPage} de ${totalPages}`}
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
