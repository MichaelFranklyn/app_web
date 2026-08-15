import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PortalOrder } from "../../interface";
import {
  hasIpi,
  portalOrderDateLine,
  portalOrderTotal,
  portalStatusHint,
  portalStatusLabel,
  portalStatusTone,
} from "../../utils";

interface PortalOrderCardProps {
  order: PortalOrder;
  token: string;
}

/**
 * Um pedido, em card e não em linha de tabela.
 *
 * A página é aberta no celular, a partir de uma conversa — e uma tabela de seis
 * colunas ou rola de lado ou encolhe a fonte até o ponto em que ninguém lê. O
 * card empilha, e o que importa (valor e situação) fica na altura do polegar.
 *
 * O card inteiro é o link para os itens: um "ver detalhes" pequeno num canto é
 * alvo difícil no toque, e aqui a área clicável é a maior possível.
 */
export function PortalOrderCard({ order, token }: PortalOrderCardProps) {
  return (
    <Link href={`/p/${token}/pedidos/${order.id}`} className="block">
      <Card.Root className="h-auto p-[16px] transition-colors hover:bg-(--bg3)">
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-start justify-between gap-[12px]">
            <Title variant="heading-sm" className="min-w-0 break-words">
              {order.factoryName}
            </Title>
            <Badge color={portalStatusTone(order.status)} size="sm">
              <Badge.Text>{portalStatusLabel(order.status)}</Badge.Text>
            </Badge>
          </div>

          <div className="flex flex-col gap-[2px]">
            <Title variant="kpi">{formatMoney(portalOrderTotal(order))}</Title>
            {hasIpi(order) ? (
              <Title variant="body-xs" color="muted">
                {formatMoney(order.totalAmount)} em mercadoria +{" "}
                {formatMoney(order.ipiAmount)} de IPI
              </Title>
            ) : null}
          </div>

          <div className="flex items-end justify-between gap-[12px] border-t border-(--border) pt-[12px]">
            <div className="flex min-w-0 flex-col gap-[4px]">
              <Title variant="body-sm">{portalOrderDateLine(order)}</Title>
              <Title variant="body-xs" color="muted">
                {portalStatusHint(order.status)}
              </Title>
            </div>
            <ChevronRight
              size={20}
              className="shrink-0 text-(--muted)"
              aria-hidden
            />
          </div>
        </div>
      </Card.Root>
    </Link>
  );
}
