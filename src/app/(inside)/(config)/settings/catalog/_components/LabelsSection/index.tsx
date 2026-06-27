"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { Tag } from "lucide-react";
import { useMemo } from "react";
import { PRODUCT_UNIT_LABELS_QUERY } from "../../gql";
import { AddLabelModal } from "./AddLabelModal";
import { DeleteLabelModal } from "./DeleteLabelModal";
import { EditLabelModal } from "./EditLabelModal";

interface LabelNode {
  id: string;
  label: string;
  isActive: boolean;
}

const listInput = { first: 200 };

export function LabelsSection() {
  const { data, loading, refetch } = useQuery<{
    productUnitLabels: { edges: { node: LabelNode }[]; totalCount: number };
  }>(PRODUCT_UNIT_LABELS_QUERY, { variables: { input: listInput } });

  const initial = useMemo<LabelNode[]>(
    () => data?.productUnitLabels.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<LabelNode>({ initialData: initial });
  const labels = optimistic.items;
  const onChanged = () => refetch();

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Rótulos de embalagem
          <HelpTooltip
            label="O que é um rótulo de embalagem?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Rótulo de embalagem
                </Title>
                <Title variant="body-sm">
                  Nome da embalagem em que o produto é entregue. Ex.:
                  &quot;Caixa&quot;, &quot;Pallet&quot;, &quot;Fardo&quot;.
                </Title>
                <Title variant="body-sm" color="muted">
                  Combinado com &quot;unidades por embalagem&quot; no produto,
                  define como ele é comercializado (ex.: 12 sacos por pallet).
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <AddLabelModal
            onAddOptimistic={optimistic.addOptimistic}
            onDone={onChanged}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>
      <Table.Table maxHeight={360}>
        <Table.Header>
          <Table.Row>
            <Table.Head>Rótulo</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Skeleton columns={2} rows={3} />
          ) : labels.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={2}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Tag size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum rótulo cadastrado</EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Novo rótulo&quot; para cadastrar as embalagens em
                    que os produtos são vendidos.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            labels.map((l) => (
              <Table.Row key={l.id}>
                <Table.Cell variant="strong">{l.label}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditLabelModal
                      label={l}
                      onUpdateOptimistic={optimistic.updateOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                      onDone={onChanged}
                    />
                    <DeleteLabelModal
                      labelId={l.id}
                      labelText={l.label}
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
