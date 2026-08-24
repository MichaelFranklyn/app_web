"use client";

import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";

import { CatalogSectionHead } from "../CatalogSectionHead";
import { LABEL_COLUMN_HELP } from "../../help";
import { Title } from "@/components/Title";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useOptimisticList } from "@/hooks/useOptimisticList";
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

type Connection = { edges: { node: LabelNode }[]; totalCount: number };

// Sem `first`: quem consome é o `useCompleteList`, que traz o catálogo inteiro
// e rebusca pelo total quando a primeira página não dá conta. O `first: 200`
// que estava aqui cobria a empresa comum e, no dia em que não cobrisse,
// esconderia o cadastro sem nada na tela dizer — e um cadastro que "não existe"
// é procurado, recriado e vira duplicata.
const listInput = { order: { by: "label", dir: "asc" } };
const getConnection = (d: { productUnitLabels: Connection }) =>
  d.productUnitLabels;

export function LabelsSection() {
  const { data, loading, error, refetch } = useCompleteList<{
    productUnitLabels: Connection;
  }>(PRODUCT_UNIT_LABELS_QUERY, listInput, getConnection, {
    fetchPolicy: "cache-and-network",
  });

  const initial = useMemo<LabelNode[]>(
    () => data?.productUnitLabels.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<LabelNode>({ initialData: initial });
  const labels = optimistic.items;
  const onChanged = () => refetch();

  return (
    <Table.Root>
      <CatalogSectionHead
        count={labels.length}
        loading={loading && labels.length === 0}
        noun={{ one: "rótulo", many: "rótulos" }}
        helpLabel="O que é um rótulo de embalagem?"
        helpContent={
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
      >
        <AddLabelModal
          onAddOptimistic={optimistic.addOptimistic}
          onDone={onChanged}
        />
      </CatalogSectionHead>
      <Table.Table maxHeight={600}>
        <Table.Header>
          <Table.Row>
            <Table.Head title={LABEL_COLUMN_HELP.name}>Rótulo</Table.Head>
            <Table.Head
              className="text-right"
              title={LABEL_COLUMN_HELP.actions}
            >
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? (
            <Table.Skeleton columns={2} rows={3} />
          ) : error && labels.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={2}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
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
