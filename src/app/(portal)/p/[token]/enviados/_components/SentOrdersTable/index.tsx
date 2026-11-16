"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { PortalSentOrder, PortalSentOrdersSummary } from "../../../interface";
import { SentOrdersTab, sentOrdersHref } from "../../utils";
import { SentOrderRow } from "../SentOrderRow";
import { SentOrdersFilter } from "../SentOrdersFilter";
import { SentOrdersSearch } from "../SentOrdersSearch";

interface SentOrdersTableProps {
  token: string;
  orders: PortalSentOrder[];
  /** Quantos o recorte atual (aba + busca) tem, em todas as páginas. */
  total: number;
  page: number;
  totalPages: number;
  tab: SentOrdersTab;
  search: string;
  summary: PortalSentOrdersSummary | null;
}

const COLUMNS = 5;

/**
 * A lista de pedidos em tabela (cartões no celular), de 10 em 10, com busca
 * por fábrica ou número e as abas "Todos / Pedidos feitos / Orçamentos".
 *
 * Antes era uma grade de cards grandes com "Mais recentes / Mais antigos":
 * com 20, 50 pedidos o cliente rolava sem fim e não tinha como achar o pedido
 * da fábrica X. Aqui cada pedido é uma linha, a página diz "página 2 de 5" e
 * a busca vai direto ao que ele procura. Tudo mora na URL — voltar do
 * detalhe devolve a mesma aba, busca e página.
 */
export function SentOrdersTable({
  token,
  orders,
  total,
  page,
  totalPages,
  tab,
  search,
  summary,
}: SentOrdersTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const goToPage = (target: number) =>
    startTransition(() =>
      router.push(sentOrdersHref(token, target, tab, search))
    );

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>
          {total === 1 ? "1 pedido" : `${total} pedidos`}
        </Table.CardHead.Title>
        <Table.CardHead.Description>
          Do mais novo para o mais antigo. Toque em um para ver os produtos.
        </Table.CardHead.Description>
        <Table.CardHead.Actions>
          <SentOrdersSearch
            key={`${tab}:${search}`}
            token={token}
            tab={tab}
            search={search}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      {summary ? (
        <div className="px-16 pt-4">
          <SentOrdersFilter
            token={token}
            tab={tab}
            search={search}
            summary={search ? null : summary}
          />
        </div>
      ) : null}

      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Data</Table.Head>
            <Table.Head align="right">Produtos</Table.Head>
            <Table.Head align="right">Total</Table.Head>
            <Table.Head>Situação</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {orders.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <SearchX size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {page > 1
                      ? "Nada nesta página"
                      : "Nenhum pedido encontrado"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {search
                      ? `Nada com "${search}". Tente o nome da fábrica ou o número do pedido.`
                      : "Nenhum pedido nesta aba."}
                  </EmptyState.Description>
                  {page > 1 || search ? (
                    <EmptyState.Actions>
                      <Button.Link
                        href={sentOrdersHref(token, 1, tab)}
                        appearance="outline"
                        color="neutral"
                      >
                        <Button.Title>Ver todos os pedidos</Button.Title>
                      </Button.Link>
                    </EmptyState.Actions>
                  ) : null}
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            orders.map((order) => (
              <SentOrderRow key={order.id} order={order} token={token} />
            ))
          )}
        </Table.Body>
      </Table.Table>

      {totalPages > 1 ? (
        <Table.Footer>
          <Table.Footer.Info>
            {`${total} pedidos · página ${page} de ${totalPages}`}
          </Table.Footer.Info>
          <Pagination.Smart
            currentPage={page}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </Table.Footer>
      ) : null}
    </Table.Root>
  );
}
