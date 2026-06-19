"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatDateDMY, formatNumber } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { Eye, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AddPriceItemModal } from "./AddPriceItemModal";
import { PRICE_LIST_ITEMS_QUERY } from "./gql";
import { PriceItemRowActions } from "./PriceItemRowActions";

interface PriceList {
  id: string;
  name: string;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
}

interface PriceItem {
  id: string;
  unitPrice: string;
  unitPriceWithImpost: string;
  priceList: PriceList | null;
  tier: { id: string; name: string } | null;
}

interface PriceItemsData {
  price_list_items: {
    edges: { node: PriceItem }[];
    totalCount: number;
  };
}

interface PriceListGroup {
  priceList: PriceList | null;
  items: PriceItem[];
}

interface Props {
  productId: string;
  companyFactoryId: string;
  unitPerPack: string;
  baseUnitLabel: string | null;
  packLabel: string | null;
}

interface PackInfo {
  unitPerPack: number;
  baseUnitLabel: string;
  packLabel: string;
}

const UNGROUPED_KEY = "__none__";

const ITEMS_PER_PAGE = 10;

const pageToAfter = (page: number, first: number): string | null =>
  page <= 1 ? null : btoa(`arrayconnection:${(page - 1) * first - 1}`);

const money = (value: string): string =>
  Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function groupByPriceList(items: PriceItem[]): PriceListGroup[] {
  const groups = new Map<string, PriceListGroup>();
  for (const item of items) {
    const key = item.priceList?.id ?? UNGROUPED_KEY;
    if (!groups.has(key)) {
      groups.set(key, { priceList: item.priceList, items: [] });
    }
    groups.get(key)!.items.push(item);
  }
  return Array.from(groups.values());
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

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const variables = useMemo(
    () => ({
      input: {
        first: ITEMS_PER_PAGE,
        after: pageToAfter(page, ITEMS_PER_PAGE),
        filters: [
          { field: "product_id", operator: "eq", value: productId },
          ...(search.trim()
            ? [{ field: "search", operator: "like", value: search.trim() }]
            : []),
        ],
      },
    }),
    [productId, page, search]
  );

  const { data, loading, refetch } = useQuery<PriceItemsData>(
    PRICE_LIST_ITEMS_QUERY,
    { variables }
  );

  const items = data?.price_list_items?.edges.map((e) => e.node) ?? [];
  const totalCount = data?.price_list_items?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const groups = groupByPriceList(items);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleChanged = () => {
    refetch();
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
                  tabelas ativas quando os impostos do produto mudam. Cada
                  linha é o preço em uma tabela e nível comercial.
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
            onChange={(e) => handleSearch(e.target.value)}
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
          {loading && items.length === 0 ? (
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
              />
            ))
          )}
        </Table.Body>
      </Table.Table>

      <Table.Footer>
        <Table.Footer.Info>
          {loading && items.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {totalCount > 0
            ? `${totalCount} preço(s) · página ${currentPage} de ${totalPages}`
            : "Nenhum preço"}
        </Table.Footer.Info>

        <Pagination.Smart
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Table.Footer>
    </Table.Root>
  );
}

function PriceListGroupRows({
  group,
  pack,
  companyFactoryId,
  onChanged,
}: {
  group: PriceListGroup;
  pack: PackInfo;
  companyFactoryId: string;
  onChanged: () => void;
}) {
  const router = useRouter();
  const { priceList, items } = group;
  const validity = priceList
    ? `${formatDateDMY(priceList.validFrom)}${
        priceList.validUntil
          ? ` – ${formatDateDMY(priceList.validUntil)}`
          : " · sem fim"
      }`
    : null;

  return (
    <>
      <Table.Row>
        <Table.Cell colSpan={5} className="bg-(--bg3)">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <Table.CellText variant="strong">
                {priceList?.name ?? "Sem tabela"}
              </Table.CellText>
              {priceList && (
                <Badge.Root
                  color={priceList.isActive ? "green" : "neutral"}
                  appearance="tinted"
                >
                  <Badge.Text>
                    {priceList.isActive ? "Ativa" : "Inativa"}
                  </Badge.Text>
                </Badge.Root>
              )}
              {validity && (
                <Table.CellText variant="dim2">{validity}</Table.CellText>
              )}
            </div>
            {priceList && (
              <Button.Root
                appearance="ghost"
                color="neutral"
                size="sm"
                noUppercase
                onClick={() =>
                  router.push(
                    `/factories/${companyFactoryId}/price-lists/${priceList.id}`
                  )
                }
              >
                <Button.Icon icon={Eye} />
                <Button.Title>Ver tabela</Button.Title>
              </Button.Root>
            )}
          </div>
        </Table.Cell>
      </Table.Row>

      {items.map((item) => {
        // O preço da tabela é sempre por embalagem; o valor por unidade base
        // é derivado.
        const perBaseUnit =
          Number(item.unitPriceWithImpost) / (pack.unitPerPack || 1);
        return (
          <Table.Row key={item.id}>
            <Table.Cell>
              <Badge.Root color="neutral" appearance="tinted">
                <Badge.Text>{item.tier?.name ?? "—"}</Badge.Text>
              </Badge.Root>
            </Table.Cell>
            <Table.Cell>
              <Table.CellText variant="dim">
                R$ {money(item.unitPrice)}
              </Table.CellText>
            </Table.Cell>
            <Table.Cell>
              <Table.CellText variant="strong">
                R$ {money(item.unitPriceWithImpost)}
              </Table.CellText>
            </Table.Cell>
            <Table.Cell>
              <div className="flex flex-col">
                <Table.CellText variant="strong">
                  R$ {money(String(perBaseUnit))} / {pack.baseUnitLabel}
                </Table.CellText>
                <Table.CellText variant="dim2">
                  {pack.packLabel} com {formatNumber(Number(pack.unitPerPack))}{" "}
                  {pack.baseUnitLabel}
                </Table.CellText>
              </div>
            </Table.Cell>
            <Table.Cell>
              <div className="flex items-center justify-end gap-4">
                <PriceItemRowActions
                  item={item}
                  label={`${priceList?.name ?? "preço"} · ${item.tier?.name ?? ""}`}
                  onChanged={onChanged}
                />
              </div>
            </Table.Cell>
          </Table.Row>
        );
      })}
    </>
  );
}
