import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { formatOrderNumber } from "@/utils/orderNumber";
import { PortalOrderItems } from "../../_components/PortalOrderItems";
import { PortalPageHeader } from "../../_components/PortalPageHeader";
import { PortalOrderDetail } from "../../interface";
import { PortalPdfBrand } from "../../orderPdf";
import {
  portalOrderDateLine,
  portalStatusLabel,
  portalStatusTone,
} from "../../utils";
import { OrderActions } from "./_components/OrderActions";
import { PortalOrderInstallments } from "./_components/PortalOrderInstallments";
import { PortalOrderSummary } from "./_components/PortalOrderSummary";

interface PortalOrderContentProps {
  order: PortalOrderDetail;
  token: string;
  /** A marca do escritório no cabeçalho do PDF. */
  brand: PortalPdfBrand;
}

/**
 * Um pedido confirmado, no molde do detalhe de pedido do sistema (o mesmo do
 * pedido enviado): breadcrumb, cabeçalho com a situação, os produtos à
 * esquerda e o resumo + parcelas numa coluna de 320px à direita (empilha
 * abaixo do desktop).
 */
export function PortalOrderContent({
  order,
  token,
  brand,
}: PortalOrderContentProps) {
  const title = `Pedido ${formatOrderNumber(order.number)}`;

  return (
    <>
      {/* Como o sistema: "Pedido #428" no título e a fábrica na descrição —
          é o número que o cliente e o representante usam para conversar. */}
      <PortalPageHeader
        heading="orders"
        title={title}
        description={`${order.factoryName} · ${portalOrderDateLine(order)}`}
        breadcrumb={
          <Breadcrumb.Root>
            <Breadcrumb.Item href={`/p/${token}/enviados`}>
              Pedidos
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>{title}</Breadcrumb.Item>
          </Breadcrumb.Root>
        }
        actions={<OrderActions order={order} token={token} brand={brand} />}
        badges={
          // `sm`: a tarja de cabeçalho tem a altura do botão `sm`.
          <Badge.Root color={portalStatusTone(order.status)} size="sm">
            <Badge.Text>{portalStatusLabel(order.status)}</Badge.Text>
          </Badge.Root>
        }
      />

      <div className="desktop:flex-row flex flex-col gap-20">
        <div className="flex min-w-0 flex-1 flex-col gap-12">
          <PortalOrderItems items={order.items} />
        </div>
        {/* Abaixo do desktop o resumo sobe: com 25 produtos, o total e as
            parcelas — o que o cliente veio ver — ficariam no fim da rolagem. */}
        <div className="desktop:order-none desktop:w-[320px] desktop:self-start order-first flex w-full shrink-0 flex-col gap-12">
          <PortalOrderSummary order={order} />
          <PortalOrderInstallments installments={order.installments} />
        </div>
      </div>
    </>
  );
}
