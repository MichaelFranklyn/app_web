"use client";

import { Badge } from "@/components/Badges";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { formatDateDMY } from "@/utils/format/masks";
import { clientName, factoryName } from "@/utils/company";
import { OrderDetail } from "../../interface";
import { EditInvoiceModal } from "../EditInvoiceModal";
import { InvoiceOrderModal } from "../InvoiceOrderModal";
import { MarkDeliveredModal } from "../MarkDeliveredModal";
import { ConvertToOrderModal } from "./ConvertToOrderModal";
import { DeleteOrderModal } from "./DeleteOrderModal";
import { OrderExportMenu } from "./OrderExportMenu";
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

            {/* As tarjas dizem em que pé está o pedido; o `title` explica o
                que cada estado significa para quem ainda não domina o fluxo
                (orçamento → confirmado → faturado → entregue). */}
            {isQuote && (
              <div className="mt-4">
                <Badge.Root
                  appearance="tinted"
                  color="amber"
                  title="Orçamento ainda não é pedido: não gera nota, nem parcelas, nem comissão. Use “Converter em pedido” quando o cliente fechar."
                >
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
                <Badge.Root
                  appearance="tinted"
                  color="green"
                  title="Dia em que a mercadoria chegou na loja do cliente. É essa data que reabastece o estoque estimado dele e alimenta a próxima visita."
                >
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
                  title={
                    order.isDeliveryOverdue
                      ? "A previsão de entrega (data da nota + prazo da fábrica) já passou e ninguém confirmou a chegada. Confirme em “Marcar como entregue” — é o que atualiza o estoque do cliente."
                      : "Previsão calculada a partir da data da nota mais o prazo de entrega da fábrica. Quando a mercadoria chegar, confirme a entrega."
                  }
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
                <OrderExportMenu order={order} />
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
                {/* Faturamento é lançamento manual (data da nota, prazo, entrega):
                    errar acontece, e corrigir não pode exigir apagar o pedido. */}
                {order.invoicedAt && order.status !== "CANCELLED" && (
                  <EditInvoiceModal order={order} onSuccess={onRefetch} />
                )}
                <UpdateOrderModal
                  orderId={order.id}
                  currentOrderDate={order.orderDate}
                  currentNotes={order.notes}
                  currentFreightType={order.freightType}
                  currentStatus={order.status}
                  currentFileUrl={order.fileUrl}
                  currentFileParsed={order.isFileParsed}
                  currentDeliveryEstimateDays={order.deliveryEstimateDays}
                  currentCoverageDays={order.coverageDays}
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
