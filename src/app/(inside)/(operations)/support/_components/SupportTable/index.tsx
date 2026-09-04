"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table, TableSort } from "@/components/Table";
import { Title } from "@/components/Title";
import { factoryName } from "@/utils/company";
import { clientDisplayName } from "@/utils/client";
import { formatDate } from "@/utils/format/date";
import {
  SUPPORT_CATEGORY_LABEL,
  SUPPORT_PRIORITY_COLOR,
  SUPPORT_PRIORITY_LABEL,
  SUPPORT_STATUS_COLOR,
  SUPPORT_STATUS_HINT,
  SUPPORT_STATUS_LABEL,
  SupportCase,
  supportAgeLabel,
} from "@/utils/support";
import { Headset } from "lucide-react";

import { SUPPORT_COLUMN_HELP } from "../../help";

interface Props {
  cases: SupportCase[];
  loading: boolean;
  sort: TableSort;
  filterFields: FilterField[];
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  setFilters: (patch: Record<string, string | undefined>) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
}

const COLUMNS = 7;

export function SupportTable({
  cases,
  loading,
  sort,
  filterFields,
  inputValues,
  setFilter,
  setFilters,
  currentPage,
  totalPages,
  totalItems,
  setCurrentPage,
}: Props) {
  return (
    <Table.Root sort={sort}>
      <Table.CardHead>
        <Table.CardHead.Title>Atendimentos</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <InputSearch
            size="sm"
            containerClassName="w-72"
            placeholder="Buscar pelo assunto..."
            value={inputValues.search ?? ""}
            onChange={(e) => setFilter("search", e.target.value)}
          />
          <Filters
            fields={filterFields}
            values={inputValues}
            onChange={setFilters}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="title" title={SUPPORT_COLUMN_HELP.title}>
              Assunto
            </Table.Head>
            {/* Cliente e fábrica não ordenam: o caso guarda o UUID delas, e
                ordenar por UUID dá uma ordem que a coluna não explica. */}
            <Table.Head title={SUPPORT_COLUMN_HELP.client}>Cliente</Table.Head>
            <Table.Head title={SUPPORT_COLUMN_HELP.factory}>Fábrica</Table.Head>
            <Table.Head sortKey="status" title={SUPPORT_COLUMN_HELP.status}>
              Situação
            </Table.Head>
            <Table.Head sortKey="priority" title={SUPPORT_COLUMN_HELP.priority}>
              Urgência
            </Table.Head>
            <Table.Head sortKey="reported_at" title={SUPPORT_COLUMN_HELP.age}>
              Esperando
            </Table.Head>
            <Table.Head title={SUPPORT_COLUMN_HELP.lastUpdate}>
              Último andamento
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {cases.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Headset size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum atendimento</EmptyState.Title>
                  <EmptyState.Description>
                    Quando um cliente relatar um problema, registre aqui para
                    acompanhar a tratativa com a fábrica.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            cases.map((item) => (
              <Table.Row key={item.id} href={`/support/${item.id}`}>
                <Table.Cell>
                  <div className="flex flex-col">
                    <Table.CellText variant="strong">
                      {item.title}
                    </Table.CellText>
                    <Table.CellText variant="dim">
                      {SUPPORT_CATEGORY_LABEL[item.category]}
                    </Table.CellText>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col">
                    <Table.CellText variant="strong">
                      {clientDisplayName(item.client)}
                    </Table.CellText>
                    <Table.CellText variant="dim">
                      {item.seller?.name ?? "sem vendedor"}
                    </Table.CellText>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {item.factory ? factoryName(item.factory) : "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={SUPPORT_STATUS_COLOR[item.status]}
                    appearance="tinted"
                    title={SUPPORT_STATUS_HINT[item.status]}
                  >
                    <Badge.Text>{SUPPORT_STATUS_LABEL[item.status]}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={SUPPORT_PRIORITY_COLOR[item.priority]}
                    appearance="tinted"
                    size="sm"
                  >
                    <Badge.Text>
                      {SUPPORT_PRIORITY_LABEL[item.priority]}
                    </Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col">
                    <Table.CellText variant="dim">
                      {supportAgeLabel(item.ageDays, item.isOpen)}
                    </Table.CellText>
                    <Table.CellText variant="dim">
                      {`desde ${formatDate(item.reportedAt)}`}
                    </Table.CellText>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-col">
                    {item.lastUpdate ? (
                      <>
                        <Table.CellText variant="dim">
                          {item.lastUpdate.body}
                        </Table.CellText>
                        <Table.CellText variant="dim">
                          {formatDate(item.lastUpdate.createdAt)}
                        </Table.CellText>
                      </>
                    ) : (
                      <Title variant="body-xs" color="muted">
                        Sem andamento ainda
                      </Title>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
      <Table.Footer>
        <Table.Footer.Info>
          {loading && cases.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {totalItems > 0
            ? `${totalItems} atendimento(s) · página ${currentPage} de ${totalPages}`
            : "Nenhum atendimento"}
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
