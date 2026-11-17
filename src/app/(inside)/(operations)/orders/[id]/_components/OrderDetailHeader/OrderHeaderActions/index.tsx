"use client";

import { MoreOptions } from "@/components/MoreOptions";
import { OrderDetail } from "../../../interface";
import { EditInvoiceModal } from "../../EditInvoiceModal";
import { InvoiceOrderModal } from "../../InvoiceOrderModal";
import { MarkDeliveredModal } from "../../MarkDeliveredModal";
import { SendToFactoryModal } from "../../SendToFactoryModal";
import { CancelOrderModal } from "../CancelOrderModal";
import { ConvertToOrderModal } from "../ConvertToOrderModal";
import { DeleteOrderModal } from "../DeleteOrderModal";
import { ReopenOrderModal } from "../ReopenOrderModal";
import { OrderExportMenu } from "../OrderExportMenu";
import { ScheduleReturnButton } from "../ScheduleReturnButton";
import { UpdateOrderModal } from "../UpdateOrderModal";
import { useOrderMenu } from "./useOrderMenu";

interface Props {
  order: OrderDetail;
  onRefetch: () => void;
}

/**
 * Ações do pedido em três degraus: o próximo passo do fluxo em âmbar (um só),
 * Editar e Exportar com texto, e o resto no "Mais ações". Antes eram até 7
 * botões do mesmo peso, dois deles âmbar, empurrando o pedido para baixo no
 * celular.
 */
export function OrderHeaderActions({ order, onRefetch }: Props) {
  const { menu, hasMenu, show, primary, isQuote, modalProps } =
    useOrderMenu(order);
  const base = { order, onSuccess: onRefetch };

  return (
    <div className="print-hide flex flex-wrap items-center gap-8">
      {primary === "convert" && (
        <ConvertToOrderModal orderId={order.id} onSuccess={onRefetch} />
      )}
      {primary === "send" && <SendToFactoryModal {...base} />}
      {primary === "invoice" && <InvoiceOrderModal {...base} />}
      {primary === "deliver" && <MarkDeliveredModal {...base} />}

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
      <OrderExportMenu order={order} />
      {hasMenu && <MoreOptions options={menu} showLabel />}

      {/* Modais do menu: só montam quando a ação existe, porque alguns buscam
          dados ao abrir (contatos da fábrica, saldo a faturar). */}
      {show.send && <SendToFactoryModal {...base} {...modalProps("send")} />}
      {show.invoice && (
        <InvoiceOrderModal {...base} {...modalProps("invoice")} />
      )}
      {show.editInvoice && (
        <EditInvoiceModal {...base} {...modalProps("editInvoice")} />
      )}
      {show.scheduleReturn && (
        <ScheduleReturnButton order={order} {...modalProps("scheduleReturn")} />
      )}
      {show.cancel && (
        <CancelOrderModal
          orderId={order.id}
          isQuote={isQuote}
          onSuccess={onRefetch}
          {...modalProps("cancel")}
        />
      )}
      {show.reopen && (
        <ReopenOrderModal
          order={order}
          onSuccess={onRefetch}
          {...modalProps("reopen")}
        />
      )}
      {show.delete && (
        <DeleteOrderModal orderId={order.id} {...modalProps("delete")} />
      )}
    </div>
  );
}
