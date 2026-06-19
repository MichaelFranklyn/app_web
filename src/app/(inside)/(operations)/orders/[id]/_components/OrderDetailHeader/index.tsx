"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { PanelHeader } from "@/components/PanelHeader";
import { formatDateDMY } from "@/utils/format/masks";
import { clientName, factoryName } from "../../../utils";
import { OrderDetail } from "../../interface";
import { DeleteOrderModal } from "./DeleteOrderModal";
import { UpdateOrderModal } from "./UpdateOrderModal";

interface Props {
  order: OrderDetail;
  onRefetch: () => void;
}

export function OrderDetailHeader({ order, onRefetch }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div className="print-hide">
        <Breadcrumb.Root>
          <Breadcrumb.Item href="/orders">Pedidos</Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>{order.id.slice(0, 8).toUpperCase()}</Breadcrumb.Item>
        </Breadcrumb.Root>
      </div>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow>05 — Pedidos</PanelHeader.Eyebrow>
            <PanelHeader.Title>
              {order.id.slice(0, 8).toUpperCase()}
              {" · "}
              {clientName(order.client)}
            </PanelHeader.Title>
            <PanelHeader.Description>
              {factoryName(order.factory)} · {order.seller?.name ?? "—"} ·{" "}
              {formatDateDMY(order.orderDate)}
            </PanelHeader.Description>

            <PanelHeader.Actions className="mt-6">
              <div className="print-hide flex items-center gap-8">
                <UpdateOrderModal
                  orderId={order.id}
                  currentNotes={order.notes}
                  currentFreightType={order.freightType}
                  currentStatus={order.status}
                  currentFileUrl={order.fileUrl}
                  currentFileParsed={order.fileParsed}
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
