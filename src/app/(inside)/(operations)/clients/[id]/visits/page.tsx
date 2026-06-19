"use client";

import { Badge } from "@/components/Badges";
import { Title } from "@/components/Title";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { CalendarCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CLIENT_VISITS_QUERY, SELLER_CLIENT_FACTORIES_QUERY } from "../gql";
import {
  ClientVisit,
  ClientVisitsQueryResponse,
  SellerClientFactoriesQueryResponse,
} from "../interface";
import {
  STOCK_OBSERVATION_COLOR,
  STOCK_OBSERVATION_LABEL,
  VISIT_OUTCOME_COLOR,
  VISIT_OUTCOME_LABEL,
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  factoryName,
  formatDate,
} from "../utils";
import { DeleteVisitModal } from "./_components/DeleteVisitModal";
import { EditVisitModal } from "./_components/EditVisitModal";
import { VisitsSkeleton } from "./_components/VisitsSkeleton";

const ITEMS_PER_PAGE = 10;

const pageToAfter = (page: number, first: number): string | null =>
  page <= 1 ? null : btoa(`arrayconnection:${(page - 1) * first - 1}`);

export default function VisitsPage() {
  const params = useParams();
  const id = params.id as string;
  const [page, setPage] = useState(1);

  const { data: vinculosData, loading: vinculosLoading } =
    useQuery<SellerClientFactoriesQueryResponse>(SELLER_CLIENT_FACTORIES_QUERY, {
      variables: {
        input: {
          filters: [{ field: "client_id", operator: "eq", value: id }],
          first: 1,
        },
      },
      skip: !id,
    });

  const sellerClientFactoryId =
    vinculosData?.sellerClientFactoryList.edges[0]?.node.id ?? null;

  const variables = useMemo(
    () => ({
      sellerClientFactoryId,
      input: {
        order: { by: "created_at", dir: "desc" },
        first: ITEMS_PER_PAGE,
        after: pageToAfter(page, ITEMS_PER_PAGE),
      },
    }),
    [sellerClientFactoryId, page]
  );

  const {
    data: visitsData,
    loading: visitsLoading,
    refetch,
  } = useQuery<ClientVisitsQueryResponse>(CLIENT_VISITS_QUERY, {
    variables,
    skip: !sellerClientFactoryId,
  });

  const initialVisits = useMemo<ClientVisit[]>(
    () => visitsData?.visitsBySellerClientFactory.edges.map((e) => e.node) ?? [],
    [visitsData]
  );
  const optimistic = useOptimisticList<ClientVisit>({
    initialData: initialVisits,
  });
  const visits = optimistic.items;
  const totalCount = visitsData?.visitsBySellerClientFactory.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const isLoading = vinculosLoading || visitsLoading;

  if (isLoading && visits.length === 0) {
    return <VisitsSkeleton />;
  }

  return (
    <Table.Root>
      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Data</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Resultado</Table.Head>
            <Table.Head>Motivo</Table.Head>
            <Table.Head>Obs. Estoque</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visits.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <CalendarCheck size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhuma visita registrada</EmptyState.Title>
                  <EmptyState.Description>
                    As visitas deste cliente aparecem aqui conforme a rota do
                    vendedor é executada.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            visits.map((v) => (
              <Table.Row key={v.id} className="group">
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {formatDate(v.day?.date ?? v.actualVisitAt)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="strong">
                    {factoryName(v.clientFactoryLink?.factory ?? null)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {v.day?.schedule?.seller?.name ?? "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={VISIT_STATUS_COLOR[v.status]}
                    appearance="tinted"
                  >
                    <Badge.Text>{VISIT_STATUS_LABEL[v.status]}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell>
                  {v.outcome ? (
                    <Badge.Root
                      color={VISIT_OUTCOME_COLOR[v.outcome]}
                      appearance="tinted"
                    >
                      <Badge.Text>{VISIT_OUTCOME_LABEL[v.outcome]}</Badge.Text>
                    </Badge.Root>
                  ) : (
                    <Title variant="body-xs" color="muted">
                      —
                    </Title>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {v.outcomeReason ?? "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  {v.stockObservation ? (
                    <Badge.Root
                      color={STOCK_OBSERVATION_COLOR[v.stockObservation]}
                      appearance="tinted"
                    >
                      <Badge.Text>
                        {STOCK_OBSERVATION_LABEL[v.stockObservation]}
                      </Badge.Text>
                    </Badge.Root>
                  ) : (
                    <Title variant="body-xs" color="muted">
                      —
                    </Title>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-2">
                    <EditVisitModal
                      visit={{
                        id: v.id,
                        status: v.status,
                        outcome: v.outcome,
                        outcomeReason: v.outcomeReason,
                        stockObservation: v.stockObservation,
                        notes: v.notes,
                      }}
                      onUpdateOptimistic={(visitId, updates) =>
                        optimistic.updateOptimistic(
                          visitId,
                          updates as Partial<ClientVisit>
                        )
                      }
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                    />
                    <DeleteVisitModal
                      visitId={v.id}
                      visitLabel={`de ${formatDate(
                        v.day?.date ?? v.actualVisitAt
                      )}`}
                      onDeleted={() => refetch()}
                      onRemoveOptimistic={optimistic.removeOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
      <Table.Footer>
        <Table.Footer.Info>
          {visitsLoading && visits.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {totalCount > 0
            ? `${totalCount} visita(s) · página ${currentPage} de ${totalPages}`
            : "Nenhuma visita registrada"}
        </Table.Footer.Info>
        <Pagination.Smart
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Table.Footer>
    </Table.Root>
  );
}
