"use client";

import { Button } from "@/components/Button";
import { FollowUpModal } from "@/components/FollowUpModal";
import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Responsive } from "@/components/Responsive";
import { RowList } from "@/components/RowList";
import { Table } from "@/components/Table";
import { formatDate } from "@/utils/format/date";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { PENDING_COLUMN_HELP } from "../../help";
import { PendingItem, PendingSection } from "../../interface";
import { followUpDefaultDate, hasActiveFilter } from "../../utils";
import { PendingCard } from "../PendingCard";
import { PendingRow } from "./PendingRow";

interface Props {
  items: PendingItem[];
  loading: boolean;
  /** Gestor: mostra de quem é a pendência. */
  showSeller: boolean;
  section: PendingSection;
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
  section,
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

      {items.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Icon>
            <CheckCircle2 size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>
            {filtered
              ? "Nenhuma pendência neste filtro"
              : section === "charges"
                ? "Nenhum boleto vencido"
                : "Nada pendente"}
          </EmptyState.Title>
          <EmptyState.Description>
            {filtered
              ? "Não há pendência com o prazo, o tipo e o responsável escolhidos. Limpe os filtros para ver a lista inteira."
              : section === "charges"
                ? "Nenhuma parcela vencida em aberto: todas foram pagas, canceladas ou marcadas como não pagas."
                : "Nenhuma visita sem resposta, nenhum retorno vencendo, nenhum pedido parado e nenhum cliente esquecido. Quando algo aparecer, é aqui que vai estar."}
          </EmptyState.Description>
        </EmptyState.Root>
      ) : (
        <>
          {/* No celular, a linha vira cartão compacto — prazo e ação à vista. */}
          <Responsive.Show until="tablet" className="px-16 py-12">
            <RowList.Root spacing="md">
              {items.map((item) => (
                <RowList.Item key={item.id}>
                  <PendingCard
                    item={item}
                    showSeller={showSeller}
                    onScheduleReturn={setScheduling}
                  />
                </RowList.Item>
              ))}
            </RowList.Root>
          </Responsive.Show>
          <Responsive.Show from="tablet">
            <Table.Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head title={PENDING_COLUMN_HELP.priority}>
                    Prioridade
                  </Table.Head>
                  <Table.Head title={PENDING_COLUMN_HELP.pending}>
                    O que resolver
                  </Table.Head>
                  <Table.Head title={PENDING_COLUMN_HELP.client}>
                    {showSeller ? "Cliente / responsável" : "Cliente"}
                  </Table.Head>
                  <Table.Head title={PENDING_COLUMN_HELP.due}>Prazo</Table.Head>
                  <Table.Head title={PENDING_COLUMN_HELP.action}>
                    Ação
                  </Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {items.map((item) => (
                  <PendingRow
                    key={item.id}
                    item={item}
                    showSeller={showSeller}
                    onScheduleReturn={setScheduling}
                  />
                ))}
              </Table.Body>
            </Table.Table>
          </Responsive.Show>
        </>
      )}
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
          defaultDueDate={followUpDefaultDate(scheduling.dueDate)}
          onSaved={onRefresh}
        />
      )}
    </Table.Root>
  );
}
