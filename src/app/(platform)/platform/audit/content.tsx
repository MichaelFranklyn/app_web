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
import { ScrollText } from "lucide-react";
import { AUDIT_LABEL } from "../companies/[id]/utils";
import { PLATFORM_AUDIT_QUERY } from "./gql";
import { AuditContentProps, AuditQueryData, AuditRow } from "./interface";
import {
  ACTION_OPTIONS,
  ITEMS_PER_PAGE,
  TABLE_FIELDS,
  formatMoment,
} from "./utils";

const COLUMN_COUNT = 4;

export default function PlatformAuditContent({
  initialData,
}: AuditContentProps) {
  const tableData = useTableData<AuditQueryData, AuditRow>({
    query: PLATFORM_AUDIT_QUERY,
    fields: TABLE_FIELDS,
    getConnection: (data) => data.platform_audit,
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
            <PanelHeader.Title>Auditoria</PanelHeader.Title>
            <PanelHeader.Description>
              Tudo que a plataforma fez sobre as empresas. Não registra a
              operação do dia a dia dos clientes.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {tableData.error && tableData.displayedData.length === 0 ? (
        <QueryError onRetry={() => tableData.refetch()} />
      ) : (
        <Table.Root sort={tableData.sort}>
          <Table.CardHead>
            <Table.CardHead.Title>Ações registradas</Table.CardHead.Title>
            <Table.CardHead.Actions>
              <Filters
                fields={[
                  {
                    type: "select",
                    key: "action",
                    label: "Ação",
                    placeholder: "Todas as ações",
                    options: ACTION_OPTIONS,
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
                <Table.Head>Quando</Table.Head>
                <Table.Head>Ação</Table.Head>
                <Table.Head>Alvo</Table.Head>
                <Table.Head>Quem</Table.Head>
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
                        <ScrollText size={32} />
                      </EmptyState.Icon>
                      <EmptyState.Title>
                        {isNarrowed
                          ? "Nenhuma ação com esse filtro"
                          : "Nenhuma ação registrada"}
                      </EmptyState.Title>
                      <EmptyState.Description>
                        {isNarrowed
                          ? "Escolha outra ação ou limpe o filtro."
                          : "Suspensões, mudanças de plano e sessões de suporte aparecem aqui."}
                      </EmptyState.Description>
                    </EmptyState.Root>
                  </Table.Cell>
                </Table.Row>
              ) : (
                tableData.displayedData.map((row) => (
                  <Table.Row
                    key={row.id}
                    href={
                      // A empresa pode ter sido apagada depois (a FK é SET
                      // NULL): sem alvo, a linha permanece mas não leva a lugar
                      // nenhum.
                      row.targetCompanyId
                        ? `/platform/companies/${row.targetCompanyId}`
                        : undefined
                    }
                  >
                    <Table.Cell variant="dim" className="whitespace-nowrap">
                      {formatMoment(row.createdAt)}
                    </Table.Cell>

                    <Table.Cell className="whitespace-nowrap">
                      <Title variant="body-sm" weight="semibold">
                        {AUDIT_LABEL[row.action.toUpperCase()] ?? row.action}
                      </Title>
                    </Table.Cell>

                    <Table.Cell className="max-w-[280px]">
                      <div className="flex min-w-0 flex-col gap-[2px]">
                        <Title variant="body-sm" className="truncate">
                          {row.targetLabel ?? "—"}
                        </Title>
                        {row.reason && (
                          <Title
                            variant="micro"
                            color="muted"
                            className="truncate"
                          >
                            {row.reason}
                          </Title>
                        )}
                      </div>
                    </Table.Cell>

                    <Table.Cell variant="dim" className="max-w-[220px]">
                      <span className="block truncate">{row.actorEmail}</span>
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
                ? `${tableData.totalItems} ações · página ${tableData.currentPage} de ${tableData.totalPages}`
                : "Nenhuma ação registrada"}
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
