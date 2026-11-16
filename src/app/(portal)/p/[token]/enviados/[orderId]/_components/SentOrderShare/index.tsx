"use client";

import { PortalOrderShare } from "../../../../_components/PortalOrderShare";
import { PortalSentOrderDetail } from "../../../../interface";
import { sentOrderMailSubject, sentOrderShareText } from "../../../utils";
import { exportSentOrderPdf, SentOrderPdfBrand } from "../../sentOrderPdf";

interface SentOrderShareProps {
  order: PortalSentOrderDetail;
  brand: SentOrderPdfBrand;
}

/** PDF, email e WhatsApp do pedido enviado (ainda orçamento). */
export function SentOrderShare({ order, brand }: SentOrderShareProps) {
  return (
    <PortalOrderShare
      seller={order}
      onDownloadPdf={() => exportSentOrderPdf(order, brand)}
      subject={sentOrderMailSubject(order)}
      message={sentOrderShareText(order)}
    />
  );
}
