import { Title } from "@/components/Title";
import { PortalOrderCard } from "./_components/PortalOrderCard";
import { PortalOrdersEmpty } from "./_components/PortalOrdersEmpty";
import { PortalPager } from "./_components/PortalPager";
import { PortalSummary } from "./_components/PortalSummary";
import { PortalOrder, PortalPurchaseSummary } from "./interface";

interface PortalContentProps {
  summary: PortalPurchaseSummary | null;
  orders: PortalOrder[];
  totalCount: number;
  hasNextPage: boolean;
  page: number;
  token: string;
}

export function PortalContent({
  summary,
  orders,
  totalCount,
  hasNextPage,
  page,
  token,
}: PortalContentProps) {
  return (
    <div className="flex flex-col gap-[24px]">
      {/* O resumo só na primeira página: navegando para trás no histórico, o
          gráfico dos últimos 12 meses continuaria igual e roubaria a tela dos
          pedidos que o cliente foi procurar. */}
      {summary && page === 1 ? <PortalSummary summary={summary} /> : null}

      <section className="flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[4px]">
          <Title variant="eyebrow" color="muted">
            Seus pedidos
          </Title>
          <Title variant="body-sm" color="muted">
            {totalCount === 1
              ? "1 pedido registrado"
              : `${totalCount} pedidos registrados`}
            {orders.length > 0 ? " · toque para ver os itens" : ""}
          </Title>
        </div>

        {orders.length === 0 ? (
          <PortalOrdersEmpty token={token} page={page} />
        ) : (
          // Duas colunas no desktop: o card tem quatro linhas de conteúdo e,
          // esticado na largura inteira, sobra tanto espaço vazio à direita que
          // a data e o valor deixam de ser lidos como parte do mesmo pedido.
          <div className="desktop:grid-cols-2 grid grid-cols-1 gap-[12px]">
            {orders.map((order) => (
              <PortalOrderCard key={order.id} order={order} token={token} />
            ))}
          </div>
        )}

        <PortalPager token={token} page={page} hasNextPage={hasNextPage} />
      </section>
    </div>
  );
}
