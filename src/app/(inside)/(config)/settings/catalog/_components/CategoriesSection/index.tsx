"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { Tag } from "lucide-react";
import { useMemo } from "react";
import { AddCategoryModal } from "./AddCategoryModal";
import { DeleteCategoryModal } from "./DeleteCategoryModal";
import { EditCategoryModal } from "./EditCategoryModal";
import { ProductCategoryRow } from "./gql";
import {
  buildCategoriesVariables,
  PRODUCT_CATEGORIES_QUERY,
  ProductCategoriesData,
} from "./gql";

export function CategoriesSection() {
  const { data, loading, refetch } = useQuery<ProductCategoriesData>(
    PRODUCT_CATEGORIES_QUERY,
    { variables: buildCategoriesVariables() }
  );

  const initial = useMemo<ProductCategoryRow[]>(
    () => data?.product_categories?.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<ProductCategoryRow>({
    initialData: initial,
  });
  const categories = optimistic.items;
  const onChanged = () => refetch();

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Categorias de produtos
          <HelpTooltip
            label="Qual a diferença entre categoria e segmento?"
            content={
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Title variant="label" color="amber">
                    Segmento
                  </Title>
                  <Title variant="body-sm">
                    A grande frente da obra — a área de atuação a que o material
                    pertence. Ex.: Hidráulica, Elétrica, Estrutura, Acabamento.
                  </Title>
                </div>
                <div className="flex flex-col gap-2">
                  <Title variant="label" color="amber">
                    Categoria
                  </Title>
                  <Title variant="body-sm">
                    Um agrupamento mais fino, de produtos semelhantes dentro de
                    um segmento. Ex.: em Hidráulica → &quot;Tubos e
                    conexões&quot;, &quot;Registros e válvulas&quot;; em
                    Estrutura → &quot;Cimento e argamassa&quot;,
                    &quot;Vergalhões&quot;.
                  </Title>
                </div>
                <Title variant="body-sm" color="muted">
                  Resumindo: o segmento responde &quot;de que área da obra
                  é?&quot; e a categoria, &quot;que tipo de produto é?&quot;.
                  Cada produto fica ligado a uma categoria, o que organiza o
                  catálogo e facilita os filtros ao montar um pedido.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <AddCategoryModal
            onAddOptimistic={optimistic.addOptimistic}
            onChanged={onChanged}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table maxHeight={360}>
        <Table.Header>
          <Table.Row>
            <Table.Head>Nome</Table.Head>
            <Table.Head>Segmento</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && categories.length === 0 ? (
            <Table.Skeleton columns={3} rows={5} />
          ) : categories.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={3}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Tag size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhuma categoria cadastrada
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Nova categoria&quot; para organizar o catálogo de
                    produtos da empresa.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            categories.map((c) => (
              <Table.Row key={c.id}>
                <Table.Cell variant="strong">{c.name}</Table.Cell>
                <Table.Cell variant="dim">{c.segment}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditCategoryModal
                      category={c}
                      onUpdateOptimistic={optimistic.updateOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                      onChanged={onChanged}
                    />
                    <DeleteCategoryModal
                      categoryId={c.id}
                      categoryName={c.name}
                      onRemoveOptimistic={optimistic.removeOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                      onChanged={onChanged}
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
