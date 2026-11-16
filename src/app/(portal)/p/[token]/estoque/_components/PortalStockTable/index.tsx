"use client";

import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Tabs } from "@/components/Tabs";
import { SearchX } from "lucide-react";
import { useState } from "react";
import { PortalStockItem } from "../../../interface";
import {
  filterStock,
  itemsOfFactory,
  STOCK_FILTERS,
  STOCK_PAGE_SIZE,
  StockFilter,
  stockFactories,
  stockFilterCounts,
  stockPageCount,
  stockPageIds,
} from "../../utils";
import { PortalStockRow } from "../PortalStockRow";
import { StockFactoryPicker } from "../StockFactoryPicker";

interface PortalStockTableProps {
  items: PortalStockItem[];
}

const COLUMNS = 4;

/**
 * A lista do estoque: uma tabela de 10 em 10 (cartões no celular), com o mais
 * perto de acabar no topo, busca por nome/código/fábrica e a faixa "Todos /
 * Acabando / Sem estimativa". Antes era uma grade de 40+ cards iguais: o
 * cliente não achava o produto que queria e não sabia por onde começar.
 *
 * Com mais de uma fábrica, a lista mostra uma por vez (a mais urgente
 * primeiro), como no "Fazer pedido": misturadas, o cliente não sabia de quem
 * era cada produto.
 *
 * Fábrica, busca, filtro e página só ESCONDEM linhas — nenhuma sai do DOM. Assim o que
 * foi digitado numa página continua no formulário quando o cliente muda de
 * página ou de filtro, e o botão manda tudo junto.
 */
export function PortalStockTable({ items }: PortalStockTableProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [page, setPage] = useState(1);
  const factories = stockFactories(items);
  const hasPicker = factories.length > 1;
  const [chosen, setChosen] = useState(factories[0] ?? "");
  // Depois do envio a lista é relida: se a fábrica escolhida sumiu, volta à
  // primeira em vez de mostrar uma tabela vazia.
  const factory = factories.includes(chosen) ? chosen : (factories[0] ?? "");

  // Uma fábrica só: o recorte não muda nada, e o nome dela segue na linha.
  const scoped = hasPicker ? itemsOfFactory(items, factory) : items;
  const counts = stockFilterCounts(scoped);
  const filtered = filterStock(scoped, query, filter);
  const totalPages = stockPageCount(filtered.length);
  const currentPage = Math.min(page, totalPages);
  const visibleIds = stockPageIds(filtered, currentPage);

  const selectFactory = (value: string) => {
    setChosen(value);
    setFilter("all");
    setPage(1);
  };

  return (
    <>
      {hasPicker ? (
        <StockFactoryPicker
          factories={factories}
          value={factory}
          onChange={selectFactory}
        />
      ) : null}

      <Table.Root>
        <Table.CardHead>
          <Table.CardHead.Title>
            {scoped.length === 1 ? "1 produto" : `${scoped.length} produtos`}
          </Table.CardHead.Title>
          <Table.CardHead.Description>
            O que está mais perto de acabar aparece primeiro. Deixe em branco o
            que você não souber.
          </Table.CardHead.Description>
          {scoped.length > STOCK_PAGE_SIZE ? (
            <Table.CardHead.Actions>
              <div role="search" className="tablet:w-[280px] w-full">
                <Input.Search
                  id="stock-search"
                  aria-label="Buscar produto do estoque"
                  placeholder="Buscar produto"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  containerClassName="w-full"
                />
              </div>
            </Table.CardHead.Actions>
          ) : null}
        </Table.CardHead>

        {/* A faixa só aparece quando recorta alguma coisa: com tudo "Todos",
          seriam três botões que mostram a mesma lista. */}
        {counts.low > 0 || counts.unknown > 0 ? (
          <div className="px-16 pt-4">
            <Tabs.Filter
              aria-label="Mostrar produtos"
              className="mb-0"
              value={filter}
              onValueChange={(value) => {
                setFilter(value as StockFilter);
                setPage(1);
              }}
            >
              {STOCK_FILTERS.filter(
                ({ value }) => value === "all" || counts[value] > 0
              ).map(({ value, label }) => (
                <Tabs.FilterItem key={value} value={value}>
                  {`${label} (${counts[value]})`}
                </Tabs.FilterItem>
              ))}
            </Tabs.Filter>
          </div>
        ) : null}

        <Table.Table cards>
          <Table.Header>
            <Table.Row>
              <Table.Head>Produto</Table.Head>
              <Table.Head>Última compra</Table.Head>
              <Table.Head>Situação</Table.Head>
              <Table.Head align="right">Ainda dura quantos dias?</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={COLUMNS}>
                  <EmptyState.Root flat>
                    <EmptyState.Icon>
                      <SearchX size={32} />
                    </EmptyState.Icon>
                    <EmptyState.Title>
                      Nenhum produto encontrado
                    </EmptyState.Title>
                    <EmptyState.Description>
                      {query.trim()
                        ? `Nada com "${query.trim()}" aqui. Tente outro nome ou o código.`
                        : "Nenhum produto nesta lista."}
                    </EmptyState.Description>
                  </EmptyState.Root>
                </Table.Cell>
              </Table.Row>
            ) : null}
            {items.map((item) => (
              <PortalStockRow
                key={item.productId}
                item={item}
                hidden={!visibleIds.has(item.productId)}
                showFactory={!hasPicker}
              />
            ))}
          </Table.Body>
        </Table.Table>

        {totalPages > 1 ? (
          <Table.Footer>
            <Table.Footer.Info>
              {filtered.length === 1
                ? "1 produto"
                : `${filtered.length} produtos`}{" "}
              · página {currentPage} de {totalPages}
            </Table.Footer.Info>
            <Pagination.Smart
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </Table.Footer>
        ) : null}
      </Table.Root>
    </>
  );
}
