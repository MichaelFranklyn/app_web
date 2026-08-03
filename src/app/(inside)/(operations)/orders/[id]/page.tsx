import { gqlFetch } from "@/services/graphql/gqlFetch";
import { DocumentNode } from "graphql";
import OrderDetailContent from "./content";
import { ORDER_DETAIL_QUERY, ORDER_ITEMS_QUERY } from "./gql";
import { OrderDetailResponse, OrderItemsResponse } from "./interface";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Busca no servidor o que a tela pinta primeiro. Falha de qualquer uma devolve
 * `null` e a página segue: o cliente busca por conta própria (o seed é
 * otimização, não pré-requisito), então backend fora ou sessão expirada viram
 * lentidão, não tela de erro.
 */
async function fetchSeed<T>(
  query: DocumentNode,
  variables: Record<string, unknown>
): Promise<T | null> {
  try {
    const { data } = await gqlFetch<T>({ query, variables });
    return data;
  } catch {
    return null;
  }
}

const Page = async ({ params }: Props) => {
  const { id } = await params;

  // As duas em PARALELO: ambas dependem só do `id`. Antes o detalhe vinha
  // primeiro no cliente e os itens só saíam depois que ele voltava — a tabela
  // nem montava até lá —, dois saltos de rede em série dentro do caminho do LCP.
  const [detail, items] = await Promise.all([
    fetchSeed<OrderDetailResponse>(ORDER_DETAIL_QUERY, { id }),
    fetchSeed<OrderItemsResponse>(ORDER_ITEMS_QUERY, { orderId: id }),
  ]);

  // Só semeia o que veio com CONTEÚDO — mesma regra do `initialData` do
  // `useTableData`. Semear um resultado vazio é pior que não semear: o
  // `cache-first` acertaria um "hit" sem dados e a tela mostraria "pedido não
  // encontrado" (ou "pedido sem itens") sem nunca tentar buscar de novo, mesmo
  // quando o servidor só falhou ou degradou.
  const seedDetail = detail?.order?.data ? detail : null;
  const seedItems = items?.orderItems?.edges?.length ? items : null;

  return (
    <OrderDetailContent id={id} seedDetail={seedDetail} seedItems={seedItems} />
  );
};

export default Page;
