"use client";

import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { FollowUp } from "@/utils/followUp";
import { PhoneCall } from "lucide-react";

import { FOLLOW_UP_COLUMN_HELP } from "../../help";
import { FollowUpRow } from "./FollowUpRow";

interface Props {
  followUps: FollowUp[];
  loading: boolean;
  showResponsible: boolean;
  filterFields: FilterField[];
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  setFilters: (patch: Record<string, string | undefined>) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
}

export function FollowUpsTable({
  followUps,
  loading,
  showResponsible,
  filterFields,
  inputValues,
  setFilter,
  setFilters,
  currentPage,
  totalPages,
  totalItems,
  setCurrentPage,
}: Props) {
  const columns = showResponsible ? 5 : 4;

  return (
    <Table.Root data-tour="follow-ups-table">
      <Table.CardHead>
        <Table.CardHead.Title>Contatos</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <InputSearch
            size="sm"
            containerClassName="w-72"
            placeholder="Ex: orçamento, boleto..."
            value={inputValues.search ?? ""}
            onChange={(e) => setFilter("search", e.target.value)}
          />
          {filterFields.length > 0 && (
            <Filters
              fields={filterFields}
              values={inputValues}
              onChange={setFilters}
            />
          )}
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head title={FOLLOW_UP_COLUMN_HELP.dueDate}>Dia</Table.Head>
            <Table.Head title={FOLLOW_UP_COLUMN_HELP.client}>
              Cliente
            </Table.Head>
            <Table.Head title={FOLLOW_UP_COLUMN_HELP.reason}>Motivo</Table.Head>
            <Table.Head title={FOLLOW_UP_COLUMN_HELP.situation}>
              Situação
            </Table.Head>
            {showResponsible && (
              <Table.Head title={FOLLOW_UP_COLUMN_HELP.responsible}>
                Quem faz
              </Table.Head>
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {followUps.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <PhoneCall size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum contato aqui</EmptyState.Title>
                  <EmptyState.Description>
                    Combinou de voltar a falar com um cliente? Agende o contato
                    e ele aparece nas Pendências no dia certo.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            followUps.map((item) => (
              <FollowUpRow
                key={item.id}
                item={item}
                showResponsible={showResponsible}
              />
            ))
          )}
        </Table.Body>
      </Table.Table>
      <Table.Footer>
        <Table.Footer.Info>
          {loading && followUps.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {totalItems > 0
            ? `${totalItems} contato(s) · página ${currentPage} de ${totalPages}`
            : "Nenhum contato"}
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
