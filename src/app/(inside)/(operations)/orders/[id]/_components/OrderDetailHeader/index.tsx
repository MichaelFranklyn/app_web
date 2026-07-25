"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { formatDateDMY } from "@/utils/format/masks";
import { clientName, factoryName } from "@/utils/company";
import { OrderDetail } from "../../interface";
import { InvoiceOrderModal } from "../InvoiceOrderModal";
import { MarkDeliveredModal } from "../MarkDeliveredModal";
import { ConvertToOrderModal } from "./ConvertToOrderModal";
import { DeleteOrderModal } from "./DeleteOrderModal";
import { OrderPdfButton } from "./OrderPdfButton";
import { UpdateOrderModal } from "./UpdateOrderModal";

interface Props {
  order: OrderDetail;
  onRefetch: () => void;
}

export function OrderDetailHeader({ order, onRefetch }: Props) {
  // Orçamento (rascunho/enviado): ainda não é pedido de fato — não fatura, mas
  // pode ser convertido em pedido.
  const isQuote = order.status === "DRAFT" || order.status === "SENT";

  return (
    <div className="flex flex-col gap-8">
      <div className="print-hide">
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/orders">Pedidos</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            {order.id.slice(0, 8).toUpperCase()}
          </Breadcrumb.Item>
        </Breadcrumb.Root>
      </div>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>
              {order.id.slice(0, 8).toUpperCase()}
              {" · "}
              {clientName(order.client)}
            </PanelHeader.Title>
            <PanelHeader.Description>
              {factoryName(order.factory)} · {order.seller?.name ?? "—"} ·{" "}
              {formatDateDMY(order.orderDate)}
            </PanelHeader.Description>

            {isQuote && (
              <div className="mt-4">
                <Badge.Root appearance="tinted" color="amber">
                  <Badge.Text>
                    {order.status === "SENT"
                      ? "Orçamento enviado"
                      : "Orçamento"}
                  </Badge.Text>
                </Badge.Root>
              </div>
            )}

            {order.deliveredAt && (
              <div className="mt-4">
                <Badge.Root appearance="tinted" color="green">
                  <Badge.Text>
                    Entregue em {formatDateDMY(order.deliveredAt)}
                  </Badge.Text>
                </Badge.Root>
              </div>
            )}

            {/* Faturado, não entregue: mostra a previsão; vencida → alerta. */}
            {!order.deliveredAt && order.estimatedDeliveryDate && (
              <div className="mt-4">
                <Badge.Root
                  appearance="tinted"
                  color={order.isDeliveryOverdue ? "red" : "blue"}
                >
                  <Badge.Text>
                    {order.isDeliveryOverdue
                      ? `Entrega atrasada (prevista ${formatDateDMY(order.estimatedDeliveryDate)}) — confirme`
                      : `Entrega prevista: ${formatDateDMY(order.estimatedDeliveryDate)}`}
                  </Badge.Text>
                </Badge.Root>
              </div>
            )}

            <PanelHeader.Actions className="mt-6">
              <div className="print-hide flex items-center gap-8">
                <OrderPdfButton order={order} />
                {isQuote && (
                  <ConvertToOrderModal
                    orderId={order.id}
                    onSuccess={onRefetch}
                  />
                )}
                {!order.invoicedAt &&
                  order.status !== "CANCELLED" &&
                  !isQuote && (
                    <InvoiceOrderModal order={order} onSuccess={onRefetch} />
                  )}
                {/* Faturado e ainda não entregue: confirmar a chegada na loja é
                    o que reabastece o estoque do cliente (faturar ≠ entregar). */}
                {order.invoicedAt &&
                  !order.deliveredAt &&
                  order.status !== "CANCELLED" && (
                    <MarkDeliveredModal order={order} onSuccess={onRefetch} />
                  )}
                <UpdateOrderModal
                  orderId={order.id}
                  currentNotes={order.notes}
                  currentFreightType={order.freightType}
                  currentStatus={order.status}
                  currentFileUrl={order.fileUrl}
                  currentFileParsed={order.isFileParsed}
                  currentDeliveryEstimateDays={order.deliveryEstimateDays}
                  currentPaymentTermId={order.paymentTermId}
                  paymentTerms={order.availablePaymentTerms}
                  onSuccess={onRefetch}
                />
                <DeleteOrderModal orderId={order.id} />
              </div>
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>
    </div>
  );
}
