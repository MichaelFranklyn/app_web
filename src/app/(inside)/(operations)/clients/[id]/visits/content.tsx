"use client";

import { Badge } from "@/components/Badges";
import { ContactTypeTag } from "@/components/ContactTypeTag";
import { Title } from "@/components/Title";
import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { CalendarCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useClientRoute } from "../context";
import { CLIENT_VISITS_QUERY } from "../gql";
import { ClientVisit, ClientVisitsQueryResponse } from "../interface";
import {
  VISIT_OUTCOME_COLOR,
  VISIT_OUTCOME_LABEL,
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
} from "../utils";
import { clientDisplayName } from "@/utils/client";
import { factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import { DeleteVisitModal } from "./_components/DeleteVisitModal";
import { EditVisitModal } from "./_components/EditVisitModal";
import { VisitsSkeleton } from "./_components/VisitsSkeleton";
import { VisitStockAction } from "./_components/VisitStockAction";
import { useVisitsTable } from "./useVisitsTable";

const ITEMS_PER_PAGE = 10;

/**
 * Teto de visitas trazidas de uma vez.
 *
 * O histórico é de UM cliente, então cabe: mesmo um cliente visitado toda semana
 * há dois anos fica na casa da centena. Trazer tudo é o que permite ordenar por
 * Data e por Vendedor — os dois valores vêm do DIA da agenda, tabela vizinha, e
 * o `ORDER BY` do listador genérico não a alcança. Paginando no servidor, essas
 * duas colunas simplesmente não ordenariam.
 */
const MAX_VISITS = 200;

const FACTORY_NAMES_SHOWN = 2;

const abbreviate = (names: string[]): string => {
  const shown = names.slice(0, FACTORY_NAMES_SHOWN).join(", ");
  const rest = names.length - FACTORY_NAMES_SHOWN;
  return rest > 0 ? `${shown} +${rest}` : shown;
};

/** Por que o sistema mandou visitar: as fábricas de score alto. */
const focusLabel = (visit: ClientVisit): string => {
  const names = (visit.focusFactories ?? [])
    .map((f) => factoryName(f.factory))
    .filter((name): name is string => Boolean(name));

  if (names.length === 0)
    return factoryName(visit.clientFactoryLink?.factory ?? null);
  return abbreviate(names);
};

/**
 * O que o vendedor de fato tratou, derivado das observações de estoque que ele
 * registrou. Pode incluir fábricas fora do foco: ele está na loja e aproveita
 * para levantar o estoque de outros catálogos.
 */
const treatedLabel = (visit: ClientVisit): string => {
  const names = (visit.treatedFactories ?? [])
    .map((f) => factoryName(f))
    .filter((name): name is string => Boolean(name));

  return names.length === 0 ? "—" : abbreviate(names);
};

const clientLabel = (visit: ClientVisit): string =>
  clientDisplayName(visit.clientFactoryLink?.client, "Cliente");

export default function VisitsContent() {
  const { companyClientId } = useClientRoute();
  const [page, setPage] = useState(1);

  const variables = useMemo(
    () => ({
      companyClientId,
      input: {
        order: { by: "created_at", dir: "desc" },
        first: MAX_VISITS,
        after: null,
      },
    }),
    [companyClientId]
  );

  const {
    data: visitsData,
    loading: visitsLoading,
    refetch,
  } = useQuery<ClientVisitsQueryResponse>(CLIENT_VISITS_QUERY, {
    variables,
    skip: !companyClientId,
  });

  const initialVisits = useMemo<ClientVisit[]>(
    () => visitsData?.visitsByCompanyClient.edges.map((e) => e.node) ?? [],
    [visitsData]
  );
  const optimistic = useOptimisticList<ClientVisit>({
    initialData: initialVisits,
  });
  const table = useVisitsTable(optimistic.items);

  const totalCount = visitsData?.visitsByCompanyClient.totalCount ?? 0;
  // Passou do teto: o rodapé avisa, em vez de deixar a conta não fechar em
  // silêncio com o total que o servidor informou.
  const isTruncated = totalCount > optimistic.items.length;

  const totalPages = Math.max(1, Math.ceil(table.totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  // Paginação local: a lista inteira já está aqui, e recortar a página depois
  // do filtro é o que faz "página 1 de 3" bater com o que está na tela.
  const visits = useMemo(
    () =>
      table.displayedData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [table.displayedData, currentPage]
  );

  const isLoading = visitsLoading;

  if (isLoading && visits.length === 0) {
    return <VisitsSkeleton />;
  }

  return (
    <Table.Root sort={table.sort} data-tour="client-visits-table">
      <Table.CardHead>
        <Table.CardHead.Title>Visitas do cliente</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            fields={table.filterFields}
            values={table.inputValues}
            onChange={table.setFilters}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="date" sortFirst="desc">
              Data
            </Table.Head>
            {/* Motivo e fábricas tratadas saem de listas de fábricas por visita:
                não há um valor único por linha para comparar. */}
            <Table.Head>Motivo da visita</Table.Head>
            <Table.Head>Fábricas tratadas</Table.Head>
            <Table.Head sortKey="seller">Vendedor</Table.Head>
            <Table.Head sortKey="status">Status</Table.Head>
            <Table.Head sortKey="outcome">Resultado</Table.Head>
            <Table.Head sortKey="outcomeReason">Motivo</Table.Head>
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
                  <EmptyState.Title>
                    {table.totalUnfiltered > 0
                      ? "Nenhuma visita encontrada"
                      : "Nenhuma visita registrada"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {table.totalUnfiltered > 0
                      ? "Ajuste os filtros para encontrar a visita."
                      : "As visitas deste cliente aparecem aqui conforme a rota do vendedor é executada."}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            visits.map((v) => (
              <Table.Row key={v.id} className="group">
                {/* Tipo junto da data, não em coluna própria: a tabela já tem
                    8 colunas e uma nona a faria rolar na horizontal. */}
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {formatDate(v.day?.date ?? v.actualVisitAt)}
                  </Table.CellText>
                  <ContactTypeTag
                    contactType={v.contactType}
                    className="mt-2 flex"
                  />
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="strong">
                    {focusLabel(v)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {treatedLabel(v)}
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
                  <div className="flex items-center justify-end gap-2">
                    <VisitStockAction
                      visitId={v.id}
                      clientName={clientLabel(v)}
                      onSaved={() => refetch()}
                    />
                    <EditVisitModal
                      visit={{
                        id: v.id,
                        status: v.status,
                        outcome: v.outcome,
                        outcomeReason: v.outcomeReason,
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
          {table.totalItems > 0
            ? `${table.totalItems} visita(s) · página ${currentPage} de ${totalPages}${
                isTruncated ? ` · mostrando as ${MAX_VISITS} mais recentes` : ""
              }`
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
