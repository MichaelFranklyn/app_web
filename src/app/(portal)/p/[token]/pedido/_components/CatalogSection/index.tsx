"use client";

import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { plural } from "@/utils/format/plural";
import { SearchX } from "lucide-react";
import { useRouter } from "next/navigation";
import { PortalCatalogItem } from "../../../interface";
import { OrderableProduct } from "../../interface";
import { catalogPageCount, orderHref } from "../../utils";
import { ProductSearch } from "../ProductSearch";
import { ProductTable } from "../ProductTable";

interface CatalogSectionProps {
  token: string;
  search: string | null;
  /** Fábrica do orçamento e o nome dela, que dá título à tabela. */
  factoryId: string;
  factoryName: string | null;
  page: number;
  pageSize: number;
  total: number;
  items: PortalCatalogItem[];
  isInCart: (productId: string) => boolean;
  onAdd: (item: OrderableProduct) => void;
  onRemove: (productId: string) => void;
}

/**
 * Todos os produtos da fábrica do orçamento, uma página por vez. A busca
 * fica no cabeçalho da tabela e a paginação no rodapé, as MESMAS peças das
 * listas do escritório. Trocar de página troca o endereço (`?p=`) — a lista
 * do cliente fica no navegador e sobrevive a uma e outra.
 */
export function CatalogSection({
  token,
  search,
  factoryId,
  factoryName,
  page,
  pageSize,
  total,
  items,
  isInCart,
  onAdd,
  onRemove,
}: CatalogSectionProps) {
  const title = search
    ? `Resultado para "${search}"`
    : factoryName
      ? `Produtos da ${factoryName}`
      : "Todos os produtos";
  const router = useRouter();
  const totalPages = catalogPageCount({ total, pageSize });

  return (
    <ProductTable
      id="todos-os-produtos"
      title={title}
      description="Preços estimados pela sua tabela; o representante confirma o valor final."
      items={items}
      isInCart={isInCart}
      onAdd={onAdd}
      onRemove={onRemove}
      actions={
        <ProductSearch token={token} search={search} factoryId={factoryId} />
      }
      empty={
        <EmptyState.Root flat>
          <EmptyState.Icon>
            <SearchX />
          </EmptyState.Icon>
          <EmptyState.Title>
            {search ? "Nenhum produto encontrado" : "Nenhum produto disponível"}
          </EmptyState.Title>
          <EmptyState.Description>
            {search
              ? `Nada com "${search}". Tente outro nome ou o código do produto.`
              : "Esta fábrica não tem produtos disponíveis para você agora."}
          </EmptyState.Description>
        </EmptyState.Root>
      }
      footer={
        total > 0 ? (
          <>
            <Table.Footer.Info>
              {plural(total, "produto", "produtos")} · página {page} de{" "}
              {Math.max(totalPages, 1)}
            </Table.Footer.Info>
            <Pagination.Smart
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(target) =>
                router.push(orderHref(token, search, target, factoryId))
              }
            />
          </>
        ) : undefined
      }
    />
  );
}
