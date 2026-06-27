"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { Tag } from "lucide-react";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import type { FieldConfig } from "@/hooks/useTableFilters";
import { useTableData } from "@/hooks/useTableData";
import { useMemo } from "react";
import { AddPriceItemModal } from "./AddPriceItemModal";
import { PRICE_LIST_ITEMS_QUERY } from "./gql";
import { PackInfo, PriceItem, PriceItemsData } from "./interface";
import { PriceListGroupRows } from "./PriceListGroupRows";
import { ITEMS_PER_PAGE, UNGROUPED_KEY, groupByPriceList } from "./utils";

const PRICE_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "search", operator: "like" },
};

interface Props {
  productId: string;
  companyFactoryId: string;
  unitPerPack: string;
  baseUnitLabel: string | null;
  packLabel: string | null;
}

export function PricesTable({
  productId,
  companyFactoryId,
  unitPerPack,
  baseUnitLabel,
  packLabel,
}: Props) {
  const pack: PackInfo = {
    unitPerPack: Number(unitPerPack) || 0,
    baseUnitLabel: baseUnitLabel ?? "un",
    packLabel: packLabel ?? "Embalagem",
  };

  const baseFilters = useMemo(
    () => [{ field: "product_id", operator: "eq", value: productId }],
    [productId]
  );

  const table = useTableData<PriceItemsData, PriceItem>({
    query: PRICE_LIST_ITEMS_QUERY,
    fields: PRICE_FIELDS,
    getConnection: (d) => d.price_list_items,
    baseFilters,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const optimistic = useOptimisticList<PriceItem>({
    initialData: table.displayedData,
  });
  const items = optimistic.items;
  const search = table.inputValues.search ?? "";
  const groups = groupByPriceList(items);

  const handleChanged = () => {
    table.refetch();
  };

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Preços nas tabelas
          <HelpTooltip
            label="Como ler os preços deste produto?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Preço por embalagem
                </Title>
                <Title variant="body-sm">
                  O preço cadastrado é sempre o da <b>embalagem fechada</b>{" "}
                  (caixa, saco, fardo). O preço por unidade é calculado
                  automaticamente dividindo pelas unidades da embalagem.
                </Title>
                <Title variant="body-sm" color="muted">
                  O &quot;preço c/ imposto&quot; é recalculado sozinho nas
                  tabelas ativas quando os impostos do produto mudam. Cada linha
                  é o preço em uma tabela e nível comercial.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <InputSearch
            containerClassName="w-70"
            placeholder="Buscar por tabela ou nível..."
            value={search}
            onChange={(e) => table.setFilter("search", e.target.value)}
          />

          <AddPriceItemModal
            productId={productId}
            companyFactoryId={companyFactoryId}
            packLabel={pack.packLabel}
            onAdded={handleChanged}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Nível</Table.Head>
            <Table.Head>Preço por {pack.packLabel}</Table.Head>
            <Table.Head>Preço c/ imposto</Table.Head>
            <Table.Head>Preço por {pack.baseUnitLabel}</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {table.loading && items.length === 0 ? (
            <Table.Skeleton columns={5} rows={5} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Tag size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {search.trim()
                      ? "Nenhum preço encontrado"
                      : "Nenhum preço cadastrado"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {search.trim()
                      ? "Ajuste a busca ou adicione um novo preço."
                      : 'Use "Adicionar preço" para definir o valor deste produto em uma tabela existente.'}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            groups.map((group) => (
              <PriceListGroupRows
                key={group.priceList?.id ?? UNGROUPED_KEY}
                group={group}
                pack={pack}
                companyFactoryId={companyFactoryId}
                onChanged={handleChanged}
                onRemoveOptimistic={optimistic.removeOptimistic}
                onCommit={optimistic.commit}
                onRollback={optimistic.rollback}
              />
            ))
          )}
        </Table.Body>
      </Table.Table>

      <Table.Footer>
        <Table.Footer.Info>
          {table.loading && items.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {table.totalItems > 0
            ? `${table.totalItems} preço(s) · página ${table.currentPage} de ${table.totalPages}`
            : "Nenhum preço"}
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
