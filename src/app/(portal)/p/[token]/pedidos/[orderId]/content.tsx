import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { formatMoney } from "@/utils/format/masks";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PortalOrderDetail } from "../../interface";
import {
  hasIpi,
  portalOrderDateLine,
  portalOrderTotal,
  portalStatusHint,
  portalStatusLabel,
  portalStatusTone,
} from "../../utils";
import { PortalOrderInstallments } from "./_components/PortalOrderInstallments";
import { PortalOrderItems } from "./_components/PortalOrderItems";

interface PortalOrderContentProps {
  order: PortalOrderDetail;
  token: string;
}

export function PortalOrderContent({ order, token }: PortalOrderContentProps) {
  return (
    <div className="flex flex-col gap-[16px]">
      <Link
        href={`/p/${token}`}
        className="flex items-center gap-[6px] text-(--muted) hover:text-(--text2)"
      >
        <ArrowLeft size={16} />
        <Title variant="body-sm">Minhas compras</Title>
      </Link>

      <Card.Root className="h-auto p-[16px]">
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-start justify-between gap-[12px]">
            <Title variant="heading-md" className="min-w-0 break-words">
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

          <div className="flex flex-col gap-[4px] border-t border-(--border) pt-[12px]">
            <Title variant="body-sm">{portalOrderDateLine(order)}</Title>
            <Title variant="body-xs" color="muted">
              {portalStatusHint(order.status)}
            </Title>
            {order.paymentTermName ? (
              <Title variant="body-xs" color="muted">
                Condição de pagamento: {order.paymentTermName}
              </Title>
            ) : null}
          </div>
        </div>
      </Card.Root>

      <PortalOrderItems items={order.items} />
      <PortalOrderInstallments installments={order.installments} />
    </div>
  );
}
