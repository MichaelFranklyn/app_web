import { Breadcrumb } from "@/components/Breadcrumb";
import { formatOrderNumber } from "@/utils/orderNumber";
import { PortalOrderItems } from "../../_components/PortalOrderItems";
import { PortalPageHeader } from "../../_components/PortalPageHeader";
import { PortalSentOrderDetail } from "../../interface";
import { SentOrderBadge } from "../_components/SentOrderBadge";
import { SentOrderSuccess } from "../_components/SentOrderSuccess";
import { sentOrderDateLine, sentOrderStage } from "../utils";
import { SentOrderShare } from "./_components/SentOrderShare";
import { SentOrderStatus } from "./_components/SentOrderStatus";
import { SentOrderPdfBrand } from "./sentOrderPdf";

interface PortalSentOrderContentProps {
  order: PortalSentOrderDetail;
  token: string;
  /** Chegou aqui direto do botão "Enviar ao representante". */
  justSent: boolean;
  brand: SentOrderPdfBrand;
}

/**
 * Um pedido enviado, no molde do detalhe de pedido do sistema: breadcrumb,
 * cabeçalho com a situação e as ações, os produtos à esquerda e o resumo
 * numa coluna de 320px à direita (empilha abaixo do desktop).
 */
export function PortalSentOrderContent({
  order,
  token,
  justSent,
  brand,
}: PortalSentOrderContentProps) {
  // Virou pedido → "Pedido #N"; antes disso é o orçamento que o cliente pediu.
  const kind = sentOrderStage(order) === "ordered" ? "Pedido" : "Orçamento";
  const title = `${kind} ${formatOrderNumber(order.number)}`;

  return (
    <>
      <PortalPageHeader
        heading="orders"
        title={title}
        description={`${order.factoryName} · ${sentOrderDateLine(order)}`}
        breadcrumb={
          <Breadcrumb.Root>
            <Breadcrumb.Item href={`/p/${token}/enviados`}>
              Pedidos
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>{title}</Breadcrumb.Item>
          </Breadcrumb.Root>
        }
        badges={<SentOrderBadge order={order} />}
        actions={<SentOrderShare order={order} brand={brand} />}
      />

      {justSent ? <SentOrderSuccess /> : null}

      <div className="desktop:flex-row flex flex-col gap-20">
        <div className="flex min-w-0 flex-1 flex-col gap-12">
          <PortalOrderItems
            items={order.items}
            description="Quantidades em unidades; preços estimados pela sua tabela."
          />
        </div>
        <div className="desktop:w-[320px] desktop:self-start flex w-full shrink-0 flex-col gap-12">
          <SentOrderStatus order={order} token={token} />
        </div>
      </div>
    </>
  );
}
