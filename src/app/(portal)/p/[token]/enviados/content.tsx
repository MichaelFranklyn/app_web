import { Button } from "@/components/Button";
import { PortalPageHeader } from "../_components/PortalPageHeader";
import { PortalSentOrder, PortalSentOrdersSummary } from "../interface";
import { SentOrderSuccess } from "./_components/SentOrderSuccess";
import { SentOrdersEmpty } from "./_components/SentOrdersEmpty";
import { SentOrdersKpis } from "./_components/SentOrdersKpis";
import { SentOrdersTable } from "./_components/SentOrdersTable";
import { SentOrdersTab } from "./utils";

interface PortalSentOrdersContentProps {
  token: string;
  page: number;
  /** Recorte aberto: tudo, só pedidos feitos ou só orçamentos. */
  tab: SentOrdersTab;
  /** O que foi digitado na busca (fábrica ou número). */
  search: string;
  /** Chegou aqui direto do envio (mais de uma fábrica de uma vez). */
  justSent: boolean;
  orders: PortalSentOrder[];
  /** Quantos o recorte atual (aba + busca) tem, em todas as páginas. */
  total: number;
  totalPages: number;
  canOrder: boolean;
  /** O placar de todos os pedidos; nulo se a consulta falhou. */
  summary: PortalSentOrdersSummary | null;
}

export const SENT_ORDERS_DESCRIPTION =
  "Seus pedidos feitos e os orçamentos que você pediu ao representante, num lugar só.";

/**
 * A conta não tem pedido nenhum — e não só este recorte. Sem o placar (consulta
 * falhou), só dá para dizer isso olhando a primeira página sem filtro.
 */
const isAccountEmpty = (
  props: Pick<
    PortalSentOrdersContentProps,
    "summary" | "orders" | "search" | "tab" | "page"
  >
) =>
  props.summary
    ? props.summary.total === 0
    : props.orders.length === 0 &&
      !props.search &&
      props.tab === "todos" &&
      props.page === 1;

/**
 * Pedidos: tudo o que o cliente comprou ou pediu, junto — os pedidos feitos
 * (de qualquer origem) e os orçamentos que ele mandou pelo portal, com a
 * resposta do representante. A home ("Resumo") fica só com os números.
 *
 * A lista é uma tabela de 10 em 10 (cartões no celular), com busca e abas: com
 * 20, 50 pedidos a antiga grade de cards virava rolagem sem fim.
 */
export function PortalSentOrdersContent(props: PortalSentOrdersContentProps) {
  const {
    token,
    page,
    tab,
    search,
    justSent,
    orders,
    total,
    totalPages,
    canOrder,
    summary,
  } = props;

  return (
    <>
      <PortalPageHeader
        heading="orders"
        title="Pedidos"
        description={SENT_ORDERS_DESCRIPTION}
        actions={
          canOrder ? (
            <Button.Link
              href={`/p/${token}/pedido`}
              appearance="solid"
              color="amber"
            >
              <Button.Title>Fazer pedido</Button.Title>
            </Button.Link>
          ) : undefined
        }
      />

      {justSent ? <SentOrderSuccess count={2} /> : null}

      {summary && summary.total > 0 ? (
        <SentOrdersKpis summary={summary} />
      ) : null}

      {isAccountEmpty(props) ? (
        <SentOrdersEmpty
          token={token}
          page={page}
          tab={tab}
          canOrder={canOrder}
        />
      ) : (
        <SentOrdersTable
          token={token}
          orders={orders}
          total={total}
          page={page}
          totalPages={totalPages}
          tab={tab}
          search={search}
          summary={summary}
        />
      )}
    </>
  );
}
