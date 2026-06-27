"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import type { FieldConfig } from "@/hooks/useTableFilters";
import { useTableData } from "@/hooks/useTableData";
import { Tags } from "lucide-react";
import { useMemo } from "react";
import { AddItemModal } from "./AddItemModal";
import { PRICE_LIST_ITEMS_QUERY } from "./gql";
import { ItemsQueryData, PriceListItemRow } from "./interface";
import { ItemRowActions } from "./ItemRowActions";
import { ITEMS_PER_PAGE, money } from "./utils";

interface Props {
  priceListId: string;
  companyFactoryId: string;
  /** Tabela ativa esconde itens de produtos desativados (não vendíveis). */
  priceListActive: boolean;
}

const ITEM_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "search", operator: "like" },
};

export function ItemsTable({
  priceListId,
  companyFactoryId,
  priceListActive,
}: Props) {
  const baseFilters = useMemo(
    () => [
      { field: "price_list_id", operator: "eq", value: priceListId },
      ...(priceListActive
        ? [{ field: "product_is_active", operator: "eq", value: "true" }]
        : []),
    ],
    [priceListId, priceListActive]
  );

  const table = useTableData<ItemsQueryData, PriceListItemRow>({
    query: PRICE_LIST_ITEMS_QUERY,
    fields: ITEM_FIELDS,
    getConnection: (d) => d.price_list_items,
    baseFilters,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const optimistic = useOptimisticList<PriceListItemRow>({
    initialData: table.displayedData,
  });
  const items = optimistic.items;
  const search = table.inputValues.search ?? "";

  const handleChanged = () => {
    table.refetch();
  };

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Itens da tabela
          <HelpTooltip
            label="Por que alguns produtos não aparecem?"
            content={
              <Title variant="body-sm">
                Em uma tabela <b>ativa</b>, produtos desativados não aparecem —
                eles não estão disponíveis para venda.
              </Title>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <InputSearch
            containerClassName="w-70"
            placeholder="Buscar por nome ou SKU..."
            value={search}
            onChange={(e) => table.setFilter("search", e.target.value)}
          />

          <AddItemModal
            priceListId={priceListId}
            companyFactoryId={companyFactoryId}
            onAdded={handleChanged}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Produto</Table.Head>
            <Table.Head>Nível</Table.Head>
            <Table.Head>Preço da embalagem</Table.Head>
            <Table.Head>Preço c/ imposto</Table.Head>
            <Table.Head>Preço por unidade</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {table.loading && items.length === 0 ? (
            <Table.Skeleton columns={6} rows={5} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Tags size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {search.trim()
                      ? "Nenhum produto encontrado"
                      : "Nenhum item cadastrado"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {search.trim()
                      ? "Ajuste a busca ou adicione um novo item."
                      : 'Use "Adicionar item" para definir preços nesta tabela.'}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((it) => {
              const withImpost = Number(it.unitPriceWithImpost);
              const perPack = Number(it.product?.unitPerPack) || 1;
              // O preço da tabela é sempre por embalagem; o valor por unidade
              // base é derivado.
              const perBaseUnit = withImpost / perPack;
              const baseUnit = it.product?.unit?.label ?? "un";
              const packLabel = it.product?.unitLabel?.label ?? "Embalagem";
              return (
                <Table.Row key={it.id}>
                  <Table.Cell>
                    <div className="flex flex-col items-start gap-2">
                      <Table.CellText variant="strong">
                        {it.product?.name ?? "Produto removido"}
                      </Table.CellText>
                      {it.product?.sku ? (
                        <Badge.Root
                          color="subtle"
                          appearance="tinted"
                          size="xs"
                        >
                          <Badge.Text>{it.product.sku}</Badge.Text>
                        </Badge.Root>
                      ) : (
                        <Table.CellText variant="dim2">—</Table.CellText>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Table.CellText variant="dim">
                      {it.tier?.name ?? "—"}
                    </Table.CellText>
                  </Table.Cell>
                  <Table.Cell>
                    <Table.CellText variant="dim">
                      R$ {money(Number(it.unitPrice))}
                    </Table.CellText>
                  </Table.Cell>
                  <Table.Cell>
                    <Table.CellText variant="strong">
                      R$ {money(withImpost)}
                    </Table.CellText>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col">
                      <Table.CellText variant="strong">
                        R$ {money(perBaseUnit)} / {baseUnit}
                      </Table.CellText>
                      <Table.CellText variant="dim2">
                        {packLabel} com {perPack} {baseUnit}
                      </Table.CellText>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end">
                      <ItemRowActions
                        item={it}
                        companyFactoryId={companyFactoryId}
                        onChanged={handleChanged}
                        onRemoveOptimistic={optimistic.removeOptimistic}
                        onCommit={optimistic.commit}
                        onRollback={optimistic.rollback}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table.Table>

      <Table.Footer>
        <Table.Footer.Info>
          {table.loading && items.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {table.totalItems > 0
            ? `${table.totalItems} item(ns) · página ${table.currentPage} de ${table.totalPages}`
            : "Nenhum item"}
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
