"use client";

import { MoreOptions } from "@/components/MoreOptions";
import {
  CalendarClock,
  Eye,
  PackageSearch,
  Pencil,
  ReceiptText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { VisitScheduleItem } from "../../interface";
import { CompletionPromptModal } from "./CompletionPromptModal";
import { EditVisitModal } from "./EditVisitModal";
import { RescheduleVisitModal } from "./RescheduleVisitModal";
import { StockVisitModal } from "./StockVisitModal";
import { VisitDetailPanel } from "./VisitDetailPanel";

type ActiveModal =
  | "view"
  | "edit"
  | "stock"
  | "reschedule"
  | "completed"
  | null;

interface Args {
  item: VisitScheduleItem;
  currentDayId: string | null;
  scheduleDays: { id: string; date: string }[];
  onChanged: () => void;
}

interface Result {
  /** Abre o painel lateral de detalhes da visita. */
  openView: () => void;
  /** Pergunta o próximo passo (pedido/estoque) após concluir a visita. */
  promptAfterComplete: () => void;
  /** Menu de três pontos (visualizar/editar/estoque/remarcar). */
  menu: ReactNode;
  /** Painel lateral + modais; renderizar uma vez por item. */
  overlays: ReactNode;
}

// Centraliza o estado dos modais/painel de uma visita para que tanto o card da
// grade semanal quanto a lista de paradas do dia compartilhem o mesmo
// comportamento (e o card inteiro possa abrir o painel ao ser clicado).
export function useVisitActions({
  item,
  currentDayId,
  scheduleDays,
  onChanged,
}: Args): Result {
  const router = useRouter();
  const [active, setActive] = useState<ActiveModal>(null);
  const close = () => setActive(null);

  // Atalho para lançar/subir o pedido desta visita: leva à página de pedidos do
  // cliente, onde o vendedor cadastra ou importa o pedido. Só existe quando há
  // cliente vinculado.
  const client = item.clientFactoryLink?.client ?? null;
  const clientId = client?.id ?? null;
  const clientName = client?.nomeFantasia ?? client?.razaoSocial ?? "Cliente";
  const openOrder = clientId
    ? () => router.push(`/clients/${clientId}/orders`)
    : undefined;

  const menu = (
    <MoreOptions
      options={[
        {
          label: "Visualizar visita",
          icon: Eye,
          onClick: () => setActive("view"),
        },
        {
          label: "Editar visita",
          icon: Pencil,
          onClick: () => setActive("edit"),
        },
        {
          label: "Estoque do cliente",
          icon: PackageSearch,
          onClick: () => setActive("stock"),
        },
        ...(openOrder
          ? [
              {
                label: "Lançar pedido",
                icon: ReceiptText,
                onClick: openOrder,
              },
            ]
          : []),
        {
          label: "Remarcar visita",
          icon: CalendarClock,
          onClick: () => setActive("reschedule"),
        },
      ]}
    />
  );

  const overlays = (
    <>
      <VisitDetailPanel
        item={item}
        open={active === "view"}
        onClose={close}
        onEdit={() => setActive("edit")}
        onStock={() => setActive("stock")}
        onReschedule={() => setActive("reschedule")}
        onOrder={openOrder}
      />

      <EditVisitModal
        item={item}
        open={active === "edit"}
        onOpenChange={(o) => !o && close()}
        onDone={onChanged}
        onCompleted={() => setActive("completed")}
      />

      <StockVisitModal
        item={item}
        open={active === "stock"}
        onOpenChange={(o) => !o && close()}
        onSaved={onChanged}
      />

      <RescheduleVisitModal
        item={item}
        currentDayId={currentDayId}
        scheduleDays={scheduleDays}
        open={active === "reschedule"}
        onOpenChange={(o) => !o && close()}
        onDone={onChanged}
      />

      <CompletionPromptModal
        clientName={clientName}
        open={active === "completed"}
        onOpenChange={(o) => !o && close()}
        onStock={() => setActive("stock")}
        onOrder={openOrder}
      />
    </>
  );

  return {
    openView: () => setActive("view"),
    promptAfterComplete: () => setActive("completed"),
    menu,
    overlays,
  };
}
