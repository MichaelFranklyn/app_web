"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { CalendarCheck } from "lucide-react";
import { useMemo } from "react";

import { clientName } from "@/utils/company";
import { DeleteFixedScheduleModal } from "./DeleteFixedScheduleModal";
import { FixedScheduleModal } from "./FixedScheduleModal";
import { FIXED_SCHEDULES_QUERY } from "./gql";
import { FixedScheduleNode, FixedSchedulesQueryData } from "./interface";
import { formatOccurrences, scheduleSummary } from "./utils";

interface Props {
  sellerId: string;
}

const listInput = { first: 100, order: { by: "weekday", dir: "asc" } };

/**
 * Os dias fixos do vendedor — a agenda que NÃO é decidida pelo sistema.
 *
 * Fica ao lado da rotina e da carteira de propósito: as três respondem à mesma
 * pergunta ("como este vendedor trabalha"), e o dia fixo é o único caso em que
 * a resposta veio de uma promessa feita a um cliente, não de um cálculo. A
 * rotina de cada semana começa por eles e preenche o resto em volta.
 */
export function FixedSchedulesSection({ sellerId }: Props) {
  const { data, loading, error, refetch } = useQuery<FixedSchedulesQueryData>(
    FIXED_SCHEDULES_QUERY,
    { variables: { input: listInput, sellerId } }
  );

  // Encadeamento opcional até o fim: este card mora dentro do perfil inteiro
  // da pessoa, e uma resposta parcial (backend defasado, campo que ainda não
  // existe no ambiente) não pode derrubar a página junto — os dados cadastrais,
  // a rotina e a carteira continuam válidos sem ele.
  const initial = useMemo<FixedScheduleNode[]>(
    () => data?.fixedSchedules?.edges?.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<FixedScheduleNode>({
    initialData: initial,
  });
  const schedules = optimistic.items;
  const takenClientIds = useMemo(
    () => schedules.map((s) => s.clientId),
    [schedules]
  );
  const onChanged = () => refetch();

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Dias fixos
          <HelpTooltip
            label="O que é um dia fixo?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Dia fixo
                </Title>
                <Title variant="body-sm">
                  Um compromisso com o cliente: &quot;toda terça eu passo na sua
                  loja&quot;.
                </Title>
                <Title variant="body-sm" color="muted">
                  A rotina da semana começa por estes clientes e monta o resto
                  do dia em volta deles. Eles não disputam lugar por urgência —
                  já têm o lugar. Por isso o sistema recusa marcar um dia que
                  não caiba na jornada, e deixa metade das vagas livres para a
                  rotina reagir ao que aparecer.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <FixedScheduleModal
            sellerId={sellerId}
            takenClientIds={takenClientIds}
            onDone={onChanged}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Quando</Table.Head>
            <Table.Head>Próximas datas</Table.Head>
            <Table.Head>Observação</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && schedules.length === 0 ? (
            <Table.Skeleton columns={5} rows={3} />
          ) : error && schedules.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : schedules.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <CalendarCheck size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum dia fixo marcado</EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Marcar dia fixo&quot; quando houver um combinado
                    com o cliente — um dia da semana em que o vendedor sempre
                    passa lá.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            schedules.map((schedule) => (
              <Table.Row key={schedule.id}>
                <Table.Cell variant="strong">
                  {clientName(schedule.client)}
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText>
                    {scheduleSummary(schedule.weekday, schedule.intervalWeeks)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {formatOccurrences(schedule.nextOccurrences)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {schedule.notes || "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <FixedScheduleModal
                      sellerId={sellerId}
                      schedule={schedule}
                      onDone={onChanged}
                    />
                    <DeleteFixedScheduleModal
                      scheduleId={schedule.id}
                      clientLabel={clientName(schedule.client)}
                      onRemoveOptimistic={optimistic.removeOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                      onDone={onChanged}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
