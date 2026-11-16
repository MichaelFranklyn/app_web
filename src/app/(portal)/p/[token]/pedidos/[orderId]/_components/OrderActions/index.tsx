"use client";

import { PortalOrderShare } from "../../../../_components/PortalOrderShare";
import { PortalOrderDetail } from "../../../../interface";
import { exportPortalOrderPdf, PortalPdfBrand } from "../../../../orderPdf";
import { formatOrderNumber } from "@/utils/orderNumber";
import { portalOrderTotal } from "../../../../utils";
import {
  canConfirmDelivery,
  portalOrderFileName,
  portalOrderMailSubject,
  portalOrderPdfContext,
  portalOrderShareText,
} from "../../utils";
import { ConfirmDeliveryModal } from "../ConfirmDeliveryModal";

interface OrderActionsProps {
  order: PortalOrderDetail;
  token: string;
  brand: PortalPdfBrand;
}

/**
 * As ações do cabeçalho do pedido feito: baixar o PDF, mandar ao
 * representante por email ou WhatsApp e — no pedido faturado que ainda não
 * chegou — confirmar a entrega.
 */
export function OrderActions({ order, token, brand }: OrderActionsProps) {
  return (
    <>
      <PortalOrderShare
        seller={order}
        onDownloadPdf={() =>
          exportPortalOrderPdf(
            {
              title: `PEDIDO ${formatOrderNumber(order.number)}`,
              total: portalOrderTotal(order),
              context: portalOrderPdfContext(order),
              items: order.items,
              totalsLabel: "Total do pedido",
              fileName: portalOrderFileName(order),
            },
            brand
          )
        }
        subject={portalOrderMailSubject(order)}
        message={portalOrderShareText(order)}
      />
      {canConfirmDelivery(order) ? (
        <ConfirmDeliveryModal token={token} orderId={order.id} />
      ) : null}
    </>
  );
}
