"use client";

import { Button } from "@/components/Button";
import { ScheduleVisitModal } from "@/components/ScheduleVisitModal";
import { formatDate } from "@/utils/format/date";
import { CalendarPlus } from "lucide-react";
import { useControlledOpen } from "@/hooks/useControlledOpen";

import { OrderDetail } from "../../../interface";

interface Props {
  order: OrderDetail;
  /** Aberto de fora (menu "Mais ações"): sem `open`, desenha o próprio botão. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * "Retornar sobre este orçamento dia 15": a ligação (ou visita) já nasce na
 * agenda vinculada ao pedido e ao cliente dele — é daqui que a maioria dos
 * retornos de negociação sai.
 */
export function ScheduleReturnButton({
  order,
  open: openProp,
  onOpenChange,
}: Props) {
  const { open, setOpen, isControlled } = useControlledOpen(
    openProp,
    onOpenChange
  );
  const client = order.client;
  // Sem cliente não há com quem falar (pedido órfão de cadastro removido).
  if (!client) return null;
  const label = order.invoiceNumber
    ? `NF ${order.invoiceNumber}`
    : formatDate(order.orderDate);

  return (
    <>
      {!isControlled && (
        <Button.Root
          type="button"
          appearance="outline"
          color="neutral"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Button.Icon icon={CalendarPlus} />
          <Button.Title>Agendar retorno</Button.Title>
        </Button.Root>
      )}
      <ScheduleVisitModal
        open={open}
        onOpenChange={setOpen}
        clientId={client.id}
        clientName={client.nomeFantasia ?? client.razaoSocial}
        contactType="REMOTE"
        orderId={order.id}
        orderLabel={label}
      />
    </>
  );
}
