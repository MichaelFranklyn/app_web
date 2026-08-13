"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { Pagination } from "@/components/Pagination";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useTableData } from "@/hooks/useTableData";
import { useQuery } from "@apollo/client/react";
import { Activity } from "lucide-react";
import Link from "next/link";
import { operationLabel } from "../utils";
import { ActivityPulse } from "./_components/ActivityPulse";
import { ACTIVITY_SUMMARY_QUERY, PLATFORM_ACTIVITY_QUERY } from "./gql";
import {
  ActivityContentProps,
  ActivityQueryData,
  ActivityRow,
  ActivitySummaryQueryData,
} from "./interface";
import {
  ITEMS_PER_PAGE,
  STATUS_OPTIONS,
  TABLE_FIELDS,
  companyBaseFilters,
  formatDuration,
  formatMoment,
  isSlow,
  summaryVariables,
} from "./utils";

const COLUMN_COUNT = 5;

export default function ActivityContent({
  companyId,
  companyName,
  initialData,
  seedSummary,
}: ActivityContentProps) {
  useSeedQuery(
    [
      {
        query: ACTIVITY_SUMMARY_QUERY,
        variables: summaryVariables(companyId),
        data: seedSummary,
      },
    ],
    companyId ?? "all"
  );

  const summaryQuery = useQuery<ActivitySummaryQueryData>(
    ACTIVITY_SUMMARY_QUERY,
    { variables: summaryVariables(companyId) }
  );
  const summary = summaryQuery.data?.platformActivitySummary?.data ?? null;

  const tableData = useTableData<ActivityQueryData, ActivityRow>({
    query: PLATFORM_ACTIVITY_QUERY,
    fields: TABLE_FIELDS,
    getConnection: (data) => data.platform_activity,
    itemsPerPage: ITEMS_PER_PAGE,
    baseFilters: companyBaseFilters(companyId),
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
            <PanelHeader.Title>
              {companyName
                ? `Histórico — ${companyName}`
                : "Histórico de ações"}
            </PanelHeader.Title>
            <PanelHeader.Description>
              O que os usuários fizeram no sistema. Registrado automaticamente e
              mantido por 90 dias — não guarda os dados enviados, só a operação
              e o registro afetado.
            </PanelHeader.Description>
            {/* O recorte precisa ter volta visível: sem ela, o número menor na
                tela filtrada passa por queda de uso da plataforma inteira. */}
            {companyId && (
              <Link href="/platform/activity" className="w-fit">
                <Title
                  variant="body-sm"
                  color="muted"
                  className="underline underline-offset-2"
                >
                  Ver a plataforma inteira
                </Title>
              </Link>
            )}
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {summary ? (
        <ActivityPulse summary={summary} />
      ) : (
        <Loading.Skeleton className="h-[420px] w-full" />
      )}

      {tableData.error && tableData.displayedData.length === 0 ? (
        <QueryError onRetry={() => tableData.refetch()} />
      ) : (
        <Table.Root sort={tableData.sort}>
          <Table.CardHead>
            <Table.CardHead.Title>Ações</Table.CardHead.Title>
            <Table.CardHead.Actions>
              <Filters
                fields={[
                  {
                    type: "text",
                    key: "search",
                    label: "Operação",
                    placeholder: "Ex.: createOrder",
                  },
                  {
                    type: "select",
                    key: "status",
                    label: "Resultado",
                    placeholder: "Todas",
                    options: STATUS_OPTIONS,
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
                <Table.Head>Quem</Table.Head>
                <Table.Head>Resultado</Table.Head>
                <Table.Head>Duração</Table.Head>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {tableData.loading && tableData.displayedData.length === 0 ? (
                <Table.Skeleton columns={COLUMN_COUNT} rows={6} />
              ) : tableData.displayedData.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={COLUMN_COUNT}>
                    <EmptyState.Root>
                      <EmptyState.Icon>
                        <Activity size={32} />
                      </EmptyState.Icon>
                      <EmptyState.Title>
                        {isNarrowed
                          ? "Nenhuma ação encontrada"
                          : "Nada registrado ainda"}
                      </EmptyState.Title>
                      <EmptyState.Description>
                        {isNarrowed
                          ? "Ajuste a operação ou o resultado."
                          : "O registro começa a partir de agora e cobre os últimos 90 dias."}
                      </EmptyState.Description>
                    </EmptyState.Root>
                  </Table.Cell>
                </Table.Row>
              ) : (
                tableData.displayedData.map((row) => (
                  <Table.Row key={row.id}>
                    <Table.Cell variant="dim" className="whitespace-nowrap">
                      {formatMoment(row.createdAt)}
                    </Table.Cell>

                    <Table.Cell className="max-w-[280px]">
                      <div className="flex min-w-0 flex-col gap-[2px]">
                        <Title
                          variant="body-sm"
                          weight="semibold"
                          className="truncate"
                        >
                          {operationLabel(row.operation)}
                        </Title>
                        {row.errorMessage && (
                          <Title
                            variant="micro"
                            color="red"
                            className="truncate"
                          >
                            {row.errorMessage}
                          </Title>
                        )}
                      </div>
                    </Table.Cell>

                    <Table.Cell className="max-w-[220px]">
                      {row.userEmail ? (
                        <div className="flex min-w-0 flex-col gap-[2px]">
                          <Title variant="body-sm" className="truncate">
                            {row.userEmail}
                          </Title>
                          {/* A empresa vira link: quase toda investigação
                              continua na ficha dela. */}
                          {row.companyId && (
                            <Link
                              href={`/platform/companies/${row.companyId}`}
                              className="w-fit"
                            >
                              <Title
                                variant="micro"
                                color="muted"
                                className="underline underline-offset-2"
                              >
                                ver empresa
                              </Title>
                            </Link>
                          )}
                        </div>
                      ) : (
                        // Mutation pública: ninguém autenticado ainda. É o caso
                        // do login, inclusive o que falhou.
                        <Title variant="micro" color="muted">
                          sem sessão
                        </Title>
                      )}
                    </Table.Cell>

                    <Table.Cell className="whitespace-nowrap">
                      <Badge.Root
                        color={row.status === "error" ? "red" : "green"}
                        appearance="tinted"
                        size="xs"
                      >
                        <Badge.Text>
                          {row.status === "error" ? "Erro" : "Ok"}
                        </Badge.Text>
                      </Badge.Root>
                    </Table.Cell>

                    <Table.Cell className="whitespace-nowrap">
                      <Title
                        variant="body-sm"
                        color={isSlow(row.durationMs) ? "amber" : "muted"}
                      >
                        {formatDuration(row.durationMs)}
                      </Title>
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
