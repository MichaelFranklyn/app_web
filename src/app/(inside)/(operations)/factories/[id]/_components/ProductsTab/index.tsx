"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { Tooltip } from "@/components/Tooltip";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import type { FieldConfig } from "@/hooks/useTableFilters";
import { useTableData } from "@/hooks/useTableData";
import { AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/Button";
import { useMemo } from "react";
import { AddProductModal } from "./AddProductModal";
import { ImportProductsModal } from "./ImportProductsModal";
import { ProductRowActions } from "./ProductRowActions";
import {
  FACTORY_PRODUCTS_QUERY,
  FactoryProduct,
  FactoryProductsData,
} from "./gql";
import { ITEMS_PER_PAGE } from "./utils";

interface Props {
  companyFactoryId: string;
}

const PRODUCT_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "name,sku", operator: "like" },
  onlyAttention: {
    type: "select",
    queryField: "needs_attention",
    operator: "eq",
  },
};

export function ProductsTab({ companyFactoryId }: Props) {
  const baseFilters = useMemo(
    () => [
      { field: "company_factory_id", operator: "eq", value: companyFactoryId },
    ],
    [companyFactoryId]
  );

  const table = useTableData<FactoryProductsData, FactoryProduct>({
    query: FACTORY_PRODUCTS_QUERY,
    fields: PRODUCT_FIELDS,
    getConnection: (d) => d.factory_products,
    baseFilters,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const optimistic = useOptimisticList<FactoryProduct>({
    initialData: table.displayedData,
  });
  const products = optimistic.items;

  const search = table.inputValues.search ?? "";
  const onlyAttention = table.inputValues.onlyAttention === "true";

  const onChanged = () => {
    table.refetch();
  };

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Catálogo de produtos
          <HelpTooltip
            label="O que significa cada campo do produto?"
            content={
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Title variant="label" color="amber">
                    SKU
                  </Title>
                  <Title variant="body-sm">
                    Código único que identifica o produto no catálogo desta
                    fábrica. Não pode se repetir. Ex.: &quot;CIM-50KG&quot;.
                  </Title>
                </div>
                <div className="flex flex-col gap-2">
                  <Title variant="label" color="amber">
                    Unidade
                  </Title>
                  <Title variant="body-sm">
                    Como o produto é medido/vendido. Ex.: &quot;Saco&quot;,
                    &quot;Metro&quot;, &quot;Unidade&quot;.
                  </Title>
                </div>
                <div className="flex flex-col gap-2">
                  <Title variant="label" color="amber">
                    Rótulo de embalagem
                  </Title>
                  <Title variant="body-sm">
                    Nome da embalagem em que o produto é entregue. Ex.:
                    &quot;Caixa&quot;, &quot;Pallet&quot;, &quot;Fardo&quot;.
                  </Title>
                </div>
                <Title variant="body-sm" color="muted">
                  &quot;Unidades por embalagem&quot; diz quantas unidades vêm em
                  cada embalagem — por exemplo, 12 sacos por pallet. Excluir um
                  produto apenas o desativa: ele permanece na lista como
                  &quot;Inativo&quot; e preserva o histórico de pedidos.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <div className="flex items-center gap-8">
            <InputSearch
              containerClassName="w-72"
              placeholder="Buscar por nome ou SKU..."
              value={search}
              onChange={(e) => table.setFilter("search", e.target.value)}
            />
            <Button.Root
              type="button"
              appearance={onlyAttention ? "solid" : "outline"}
              color={onlyAttention ? "amber" : "neutral"}
              size="sm"
              noUppercase
              onClick={() =>
                table.setFilter(
                  "onlyAttention",
                  onlyAttention ? undefined : "true"
                )
              }
              aria-pressed={onlyAttention}
            >
              <Button.Icon icon={AlertCircle} />
              <Button.Title>Precisa de atenção</Button.Title>
            </Button.Root>
            <ImportProductsModal
              companyFactoryId={companyFactoryId}
              onChanged={onChanged}
            />
            <AddProductModal
              companyFactoryId={companyFactoryId}
              onChanged={onChanged}
              onAddOptimistic={optimistic.addOptimistic}
            />
          </div>
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>SKU</Table.Head>
            <Table.Head>Produto</Table.Head>
            <Table.Head>Categoria</Table.Head>
            <Table.Head>Unidade</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {table.loading && products.length === 0 ? (
            <Table.Skeleton columns={6} rows={5} />
          ) : products.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Package size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {onlyAttention
                      ? "Nenhum produto precisa de atenção"
                      : search.trim()
                        ? "Nenhum produto encontrado"
                        : "Nenhum produto cadastrado"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {onlyAttention
                      ? "Todos os produtos desta fábrica estão revisados."
                      : search.trim()
                        ? "Ajuste a busca ou cadastre um novo produto."
                        : 'Use "Novo produto" para começar o catálogo desta fábrica.'}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            products.map((p) => (
              <Table.Row
                key={p.id}
                href={`/factories/${companyFactoryId}/products/${p.id}`}
              >
                <Table.Cell>
                  <Badge.Root color="subtle" appearance="tinted">
                    <Badge.Text>{p.sku}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell variant="strong">{p.name}</Table.Cell>
                <Table.Cell variant="dim">{p.category?.name ?? "—"}</Table.Cell>
                <Table.Cell variant="dim">{p.unit?.label ?? "—"}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-4">
                    <Badge.Root
                      color={p.isActive ? "green" : "neutral"}
                      appearance="tinted"
                    >
                      <Badge.Text>
                        {p.isActive ? "Ativo" : "Inativo"}
                      </Badge.Text>
                    </Badge.Root>
                    {p.isNeedsAttention && (
                      <Tooltip
                        className="max-w-100 whitespace-normal"
                        content={
                          <div className="flex flex-col gap-2 text-left normal-case">
                            <Title variant="label" color="amber">
                              Importado com aviso
                            </Title>
                            <Title variant="body-sm">
                              {p.attentionReason ??
                                "Revise os dados deste produto."}
                              {
                                " — edite e salve o produto para remover esta marcação."
                              }
                            </Title>
                          </div>
                        }
                      >
                        <Badge.Root color="amber" appearance="tinted">
                          <Badge.Text>Precisa de atenção</Badge.Text>
                        </Badge.Root>
                      </Tooltip>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end">
                    <ProductRowActions
                      product={p}
                      onChanged={onChanged}
                      onUpdateOptimistic={optimistic.updateOptimistic}
                      onRemoveOptimistic={optimistic.removeOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>

      <Table.Footer>
        <Table.Footer.Info>
          {table.loading && products.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {table.totalItems > 0
            ? `${table.totalItems} produto(s) · página ${table.currentPage} de ${table.totalPages}`
            : "Nenhum produto encontrado"}
        </Table.Footer.Info>

        <Pagination.Smart
          currentPage={table.currentPage}
          totalPages={table.totalPages}
          onPageChange={table.setCurrentPage}
        />
      </Table.Footer>
    </Table.Root>
  );
}
