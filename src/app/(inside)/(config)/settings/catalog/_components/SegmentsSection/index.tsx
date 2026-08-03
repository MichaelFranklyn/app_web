"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { Store } from "lucide-react";
import { useMemo } from "react";

import { CLIENT_SEGMENTS_QUERY } from "../../gql";
import { AddSegmentModal } from "./AddSegmentModal";
import { DeleteSegmentModal } from "./DeleteSegmentModal";
import { EditSegmentModal } from "./EditSegmentModal";
import { SegmentNode } from "./interface";

const listInput = { first: 200, order: { by: "name", dir: "asc" } };

export function SegmentsSection() {
  const { data, loading, error, refetch } = useQuery<{
    clientSegments: { edges: { node: SegmentNode }[]; totalCount: number };
  }>(CLIENT_SEGMENTS_QUERY, { variables: { input: listInput } });

  const initial = useMemo<SegmentNode[]>(
    () => data?.clientSegments.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<SegmentNode>({ initialData: initial });
  const segments = optimistic.items;
  const onChanged = () => refetch();

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Segmentos de clientes
          <HelpTooltip
            label="O que é um segmento de cliente?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Segmento
                </Title>
                <Title variant="body-sm">
                  O ramo de atividade da loja. Ex.: &quot;Farmácia&quot;,
                  &quot;Mercearia&quot;, &quot;Atacado&quot;.
                </Title>
                <Title variant="body-sm" color="muted">
                  Você escolhe o segmento na ficha de cada cliente. Ele serve
                  para filtrar a carteira e comparar os números por tipo de
                  negócio.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <AddSegmentModal
            onAddOptimistic={optimistic.addOptimistic}
            onDone={onChanged}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table maxHeight={600}>
        <Table.Header>
          <Table.Row>
            <Table.Head>Segmento</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Skeleton columns={2} rows={3} />
          ) : error && segments.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={2}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : segments.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={2}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Store size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhum segmento cadastrado
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Novo segmento&quot; para cadastrar os ramos de
                    atividade dos seus clientes.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            segments.map((segment) => (
              <Table.Row key={segment.id}>
                <Table.Cell variant="strong">{segment.name}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditSegmentModal
                      segment={segment}
                      onUpdateOptimistic={optimistic.updateOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                      onDone={onChanged}
                    />
                    <DeleteSegmentModal
                      segmentId={segment.id}
                      segmentName={segment.name}
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
