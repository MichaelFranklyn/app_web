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
import { CatalogRowActions } from "../CatalogRowActions";
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
    // Lista de uma ou duas colunas não ocupa a tela toda: em 1440px o nome
    // ficava na ponta esquerda e o "⋯" na direita, longe demais para ler a
    // linha (crítica de configurações, 23/11/2026).
    <Table.Root className="w-full max-w-[720px]">
      <CatalogSectionHead
        title="Segmentos cadastrados"
        helpLabel="O que é um segmento de cliente?"
        helpContent={
          <div className="flex flex-col gap-2">
            <Title variant="label" weight="semibold">
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

      {/* Abaixo do desktop cada linha vira cartão, com editar/excluir no "⋯". */}
      <Table.Table maxHeight={600} cards>
        <Table.Header>
          <Table.Row>
            <Table.Head title={SEGMENT_COLUMN_HELP.name}>Nome</Table.Head>
            <Table.Head
              className="text-right"
              title={SEGMENT_COLUMN_HELP.actions}
            >
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && segments.length === 0 ? (
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
                <EmptyState.Root flat>
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
                <Table.Cell card="title" variant="strong">
                  {segment.name}
                </Table.Cell>
                <Table.Cell card="actions">
                  <CatalogRowActions
                    label={`Ações do segmento ${segment.name}`}
                    editLabel="Editar segmento"
                    deleteLabel="Remover segmento"
                    renderEdit={(control) => (
                      <EditSegmentModal
                        {...control}
                        segment={segment}
                        onUpdateOptimistic={optimistic.updateOptimistic}
                        onCommit={optimistic.commit}
                        onRollback={optimistic.rollback}
                        onDone={onChanged}
                      />
                    )}
                    renderDelete={(control) => (
                      <DeleteSegmentModal
                        {...control}
                        segmentId={segment.id}
                        segmentName={segment.name}
                        onRemoveOptimistic={optimistic.removeOptimistic}
                        onCommit={optimistic.commit}
                        onRollback={optimistic.rollback}
                        onDone={onChanged}
                      />
                    )}
                  />
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
