"use client";

// Cliente: `Table.CardHead` é o Header do Card (módulo "use client"), e as
// subpeças `.Title`/`.Description` não atravessam a fronteira servidor→cliente.
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import { SearchX } from "lucide-react";
import { useState } from "react";
import { PortalOrderItem } from "../../interface";
import { formatUnits, itemLineTotal } from "../../utils";
import {
  filterOrderItems,
  ORDER_ITEMS_PAGE_SIZE,
  orderItemsPage,
  orderItemsPageCount,
} from "./utils";

interface PortalOrderItemsProps {
  items: PortalOrderItem[];
  /** Linha sob o título. O pedido enviado avisa que o preço é estimado. */
  description?: string;
}

/**
 * Os produtos de um pedido — confirmado ou enviado — com as colunas do
 * detalhe de pedido do sistema: preço sem e com imposto, IPI (alíquota e
 * valor), imposto embutido e o subtotal (mercadoria + imposto, sem IPI).
 * Tabela/nível e desconto ficam de fora: são negociação do escritório.
 *
 * IPI e Imposto só viram coluna quando algum item tem: um pedido sem IPI não
 * precisa de uma coluna inteira de "—". No celular (`cards`) cada linha vira
 * cartão com produto, subtotal, quantidade e o preço com imposto — o mesmo
 * recorte do cartão do sistema.
 *
 * Os itens já vêm todos na página; a busca (nome ou código) e a paginação de
 * 10 em 10 são no próprio navegador. As colunas de IPI/Imposto olham o pedido
 * inteiro, para não piscarem de uma página para outra.
 */
export function PortalOrderItems({
  items,
  description = "Quantidades em unidades.",
}: PortalOrderItemsProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  if (items.length === 0) return null;

  const filtered = filterOrderItems(items, query);
  const totalPages = orderItemsPageCount(filtered.length);
  const currentPage = Math.min(page, totalPages);
  const visible = orderItemsPage(filtered, currentPage);
  const columns =
    5 +
    (items.some((item) => Number(item.ipiAmount) > 0) ? 1 : 0) +
    (items.some((item) => Number(item.taxAmount) > 0) ? 1 : 0);

  const showIpi = items.some((item) => Number(item.ipiAmount) > 0);
  const showTax = items.some((item) => Number(item.taxAmount) > 0);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>
          {items.length === 1 ? "1 produto" : `${items.length} produtos`}
        </Table.CardHead.Title>
        <Table.CardHead.Description>{description}</Table.CardHead.Description>
        {items.length > ORDER_ITEMS_PAGE_SIZE ? (
          <Table.CardHead.Actions>
            <div role="search" className="tablet:w-[280px] w-full">
              <Input.Search
                id="order-items-search"
                aria-label="Buscar produto do pedido"
                placeholder="Buscar por nome ou código"
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
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head>Produto</Table.Head>
            <Table.Head align="right">Quantidade</Table.Head>
            <Table.Head align="right">Preço sem imposto</Table.Head>
            <Table.Head align="right">Preço com imposto</Table.Head>
            {showIpi ? <Table.Head align="right">IPI</Table.Head> : null}
            {showTax ? <Table.Head align="right">Imposto</Table.Head> : null}
            <Table.Head align="right">
              Subtotal{showIpi ? " (sem IPI)" : ""}
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visible.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <SearchX size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum produto encontrado</EmptyState.Title>
                  <EmptyState.Description>
                    {`Nada com "${query.trim()}" neste pedido. Tente outro nome ou o código.`}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : null}
          {visible.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell card="title" wrap>
                <div className="flex min-w-0 flex-col gap-[2px]">
                  <Title
                    variant="body-md"
                    weight="semibold"
                    className="break-words"
                  >
                    {item.productName}
                  </Title>
                  {item.sku ? (
                    <Title variant="body-xs" color="muted">
                      Código {item.sku}
                    </Title>
                  ) : null}
                </div>
              </Table.Cell>
              <Table.Cell label="Quantidade" align="right">
                {formatUnits(item.quantity)}
              </Table.Cell>
              <Table.Cell variant="dim" align="right" card="hidden">
                {formatMoney(item.unitPrice)}
              </Table.Cell>
              <Table.Cell label="Preço com imposto" align="right">
                {formatMoney(item.unitPriceWithTax)}
              </Table.Cell>
              {showIpi ? (
                <Table.Cell variant="dim" align="right" card="hidden">
                  {Number(item.ipiAmount) > 0 ? (
                    <div className="flex flex-col">
                      <Table.CellText variant="strong">
                        {formatNumber(Number(item.ipiRate))}%
                      </Table.CellText>
                      <Table.CellText variant="dim2">
                        {formatMoney(item.ipiAmount)}
                      </Table.CellText>
                    </div>
                  ) : (
                    "—"
                  )}
                </Table.Cell>
              ) : null}
              {showTax ? (
                <Table.Cell variant="dim" align="right" card="hidden">
                  {Number(item.taxAmount) > 0
                    ? formatMoney(item.taxAmount)
                    : "—"}
                </Table.Cell>
              ) : null}
              <Table.Cell card="value" align="right">
                <Title variant="body-md" weight="semibold">
                  {formatMoney(itemLineTotal(item))}
                </Title>
              </Table.Cell>
            </Table.Row>
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
  );
}
