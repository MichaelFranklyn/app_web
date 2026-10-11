"use client";

import { Button } from "@/components/Button";
import { FollowUpModal } from "@/components/FollowUpModal";
import { formatDate } from "@/utils/format/date";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";

import { OrderDetail } from "../../../interface";

interface Props {
  order: OrderDetail;
}

/**
 * "Retornar sobre este orçamento dia 15": o contato agendado já nasce
 * vinculado ao pedido e ao cliente dele — é daqui que a maioria dos retornos
 * de negociação sai.
 */
export function ScheduleFollowUpButton({ order }: Props) {
  const [open, setOpen] = useState(false);
  const client = order.client;
  // Sem cliente não há com quem falar (pedido órfão de cadastro removido).
  if (!client) return null;
  const label = order.invoiceNumber
    ? `NF ${order.invoiceNumber}`
    : formatDate(order.orderDate);

  return (
    <>
      <Button.Root
        type="button"
        appearance="outline"
        color="neutral"
        size="sm"
        noUppercase
        onClick={() => setOpen(true)}
      >
        <Button.Icon icon={CalendarPlus} />
        <Button.Title>Agendar retorno</Button.Title>
      </Button.Root>
      <FollowUpModal
        open={open}
        onOpenChange={setOpen}
        clientId={client.id}
        clientName={client.nomeFantasia ?? client.razaoSocial}
        orderId={order.id}
        orderLabel={label}
      />
    </>
  );
}
