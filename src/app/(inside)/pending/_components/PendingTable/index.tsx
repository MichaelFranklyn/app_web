"use client";

import { Button } from "@/components/Button";
import { FollowUpModal } from "@/components/FollowUpModal";
import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { formatDate, getBrtTodayIso } from "@/utils/format/date";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { PENDING_COLUMN_HELP } from "../../help";
import { PendingItem } from "../../interface";
import { hasActiveFilter } from "../../utils";
import { PendingRow } from "./PendingRow";

interface Props {
  items: PendingItem[];
  loading: boolean;
  /** Gestor: mostra a coluna de quem é a pendência. */
  showSeller: boolean;
  filterFields: FilterField[];
  filterValues: Record<string, string>;
  setFilters: (patch: Record<string, string | undefined>) => void;
  onRefresh: () => void;
  /** Hora da leitura ("14:32") — a lista é calculada na hora. */
  readAt: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
}

export function PendingTable({
  items,
  loading,
  showSeller,
  filterFields,
  filterValues,
  setFilters,
  onRefresh,
  readAt,
  currentPage,
  totalPages,
  totalItems,
  setCurrentPage,
}: Props) {
  const columns = showSeller ? 6 : 5;
  // Um modal só, fora das linhas: evento de dentro do modal (portal) subiria
  // até a linha e a faria navegar.
  const [scheduling, setScheduling] = useState<PendingItem | null>(null);
  const filtered = hasActiveFilter(filterValues);

  return (
    <Table.Root data-tour="pending-table">
      <Table.CardHead>
        <Table.CardHead.Title>O que fazer</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Button.Root
            type="button"
            appearance="ghost"
            color="neutral"
            size="sm"
            noUppercase
            loading={loading}
            onClick={onRefresh}
          >
            <Button.Icon icon={RefreshCw} />
            <Button.Title>Atualizar</Button.Title>
          </Button.Root>
          <Filters
            fields={filterFields}
            values={filterValues}
            onChange={setFilters}
            data-tour="pending-filters"
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head title={PENDING_COLUMN_HELP.priority}>
              Prioridade
            </Table.Head>
            <Table.Head title={PENDING_COLUMN_HELP.pending}>
              Pendência
            </Table.Head>
            <Table.Head title={PENDING_COLUMN_HELP.client}>Cliente</Table.Head>
            <Table.Head title={PENDING_COLUMN_HELP.due}>Prazo</Table.Head>
            {showSeller && (
              <Table.Head title={PENDING_COLUMN_HELP.seller}>
                Vendedor
              </Table.Head>
            )}
            <Table.Head title={PENDING_COLUMN_HELP.where}>
              Onde resolver
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <CheckCircle2 size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {filtered
                      ? "Nenhuma pendência neste filtro"
                      : "Nada pendente"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {filtered
                      ? "Não há pendência com o tipo, o período e o vendedor escolhidos. Limpe os filtros para ver a lista inteira."
                      : "Nenhuma visita sem resposta, nenhum retorno vencendo, nenhum pedido parado e nenhum cliente esquecido. Quando algo aparecer, é aqui que vai estar."}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((item) => (
              <PendingRow
                key={item.id}
                item={item}
                showSeller={showSeller}
                onScheduleReturn={setScheduling}
              />
            ))
          )}
        </Table.Body>
      </Table.Table>
      <Table.Footer>
        <Table.Footer.Info>
          {loading && items.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {totalItems > 0
            ? `${totalItems} pendência(s) · página ${currentPage} de ${totalPages}`
            : "Nenhuma pendência"}
          {readAt ? ` · lido às ${readAt}` : ""}
        </Table.Footer.Info>
        <Pagination.Smart
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Table.Footer>
      {scheduling && (
        <FollowUpModal
          open
          onOpenChange={(open) => !open && setScheduling(null)}
          clientId={scheduling.clientId}
          clientName={scheduling.clientName}
          returnItemId={scheduling.entityId}
          returnLabel={formatDate(scheduling.dueDate)}
          // O dia combinado; se já passou, hoje (agendar no passado é recusado).
          defaultDueDate={
            scheduling.dueDate >= getBrtTodayIso()
              ? scheduling.dueDate
              : getBrtTodayIso()
          }
          onSaved={onRefresh}
        />
      )}
    </Table.Root>
  );
}
