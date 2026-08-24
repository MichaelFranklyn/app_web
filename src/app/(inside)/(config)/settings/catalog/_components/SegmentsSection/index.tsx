"use client";

import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";

import { CatalogSectionHead } from "../CatalogSectionHead";
import { SEGMENT_COLUMN_HELP } from "../../help";
import { Title } from "@/components/Title";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { Store } from "lucide-react";
import { useMemo } from "react";

import { CLIENT_SEGMENTS_QUERY } from "../../gql";
import { AddSegmentModal } from "./AddSegmentModal";
import { DeleteSegmentModal } from "./DeleteSegmentModal";
import { EditSegmentModal } from "./EditSegmentModal";
import { SegmentNode } from "./interface";

type Connection = { edges: { node: SegmentNode }[]; totalCount: number };

// Sem `first`: quem consome é o `useCompleteList`, que traz o catálogo inteiro
// e rebusca pelo total quando a primeira página não dá conta. O `first: 200`
// que estava aqui cobria a empresa comum e, no dia em que não cobrisse,
// esconderia o cadastro sem nada na tela dizer — e um cadastro que "não existe"
// é procurado, recriado e vira duplicata.
const listInput = { order: { by: "name", dir: "asc" } };
const getConnection = (d: { clientSegments: Connection }) => d.clientSegments;

export function SegmentsSection() {
  const { data, loading, error, refetch } = useCompleteList<{
    clientSegments: Connection;
  }>(CLIENT_SEGMENTS_QUERY, listInput, getConnection, {
    fetchPolicy: "cache-and-network",
  });

  const initial = useMemo<SegmentNode[]>(
    () => data?.clientSegments.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<SegmentNode>({ initialData: initial });
  const segments = optimistic.items;
  const onChanged = () => refetch();

  return (
    <Table.Root>
      <CatalogSectionHead
        count={segments.length}
        loading={loading && segments.length === 0}
        noun={{ one: "segmento", many: "segmentos" }}
        helpLabel="O que é um segmento de cliente?"
        helpContent={
          <div className="flex flex-col gap-2">
            <Title variant="label" color="amber">
              Segmento
            </Title>
            <Title variant="body-sm">
              O ramo de atividade da loja. Ex.: &quot;Farmácia&quot;,
              &quot;Mercearia&quot;, &quot;Atacado&quot;.
            </Title>
            <Title variant="body-sm" color="muted">
              Você escolhe o segmento na ficha de cada cliente. Ele serve para
              filtrar a carteira e comparar os números por tipo de negócio.
            </Title>
          </div>
        }
      >
        <AddSegmentModal
          onAddOptimistic={optimistic.addOptimistic}
          onDone={onChanged}
        />
      </CatalogSectionHead>

      <Table.Table maxHeight={600}>
        <Table.Header>
          <Table.Row>
            <Table.Head title={SEGMENT_COLUMN_HELP.name}>Segmento</Table.Head>
            <Table.Head
              className="text-right"
              title={SEGMENT_COLUMN_HELP.actions}
            >
              Ações
            </Table.Head>
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
