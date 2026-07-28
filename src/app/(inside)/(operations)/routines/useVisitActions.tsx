"use client";

import { MoreOptions } from "@/components/MoreOptions";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { clientDisplayName } from "@/utils/client";
import { contactLabel, contactNoun } from "@/utils/visit";
import { useMutation } from "@apollo/client/react";
import {
  CalendarClock,
  Eye,
  PackageSearch,
  Pencil,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { UPDATE_VISIT_ITEM_MUTATION } from "./gql";
import { VisitScheduleItem } from "./interface";
import { CompletionPromptModal } from "./_components/VisitActions/CompletionPromptModal";
import { EditVisitModal } from "./_components/VisitActions/EditVisitModal";
import { RescheduleVisitModal } from "./_components/VisitActions/RescheduleVisitModal";
import { VisitStockModal } from "@/components/VisitStockModal";
import { VisitDetailPanel } from "./_components/VisitActions/VisitDetailPanel";

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

interface UpdateItemResponse {
  updateVisitScheduleItem?: { status: boolean; message: string };
}

interface Result {
  /** Abre o painel lateral de detalhes da visita. */
  openView: () => void;
  /** Pergunta o próximo passo (pedido/estoque) após concluir a visita. */
  promptAfterComplete: () => void;
  /** Conclui (ou reabre) a visita; ao concluir, oferece pedido/estoque. */
  toggleCompleted: (checked: boolean) => void;
  /** A mutação de conclusão está em andamento. */
  isToggling: boolean;
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

  // Todo texto de ação concorda com o tipo: "a visita" × "o contato". Sem isto o
  // vendedor lê "Marcar visita como concluída" num card que é uma ligação.
  const isRemote = item.contactType === "REMOTE";
  const noun = contactNoun(item.contactType);
  const doneSuffix = isRemote ? "o" : "a";
  const capitalized = contactLabel(item.contactType);

  const [updateItem] = useMutation<UpdateItemResponse>(
    UPDATE_VISIT_ITEM_MUTATION
  );
  const { execute, isLoading: isToggling } = useAsyncAction();

  // Concluir/reabrir a visita. Ao concluir, oferece registrar o pedido ou o
  // estoque do cliente (o mesmo prompt em qualquer visualização).
  const toggleCompleted = (checked: boolean) => {
    execute(
      async () => {
        const res = await updateItem({
          variables: {
            id: item.id,
            input: { status: checked ? "COMPLETED" : "PENDING" },
          },
        });
        const payload = res.data?.updateVisitScheduleItem;
        if (!payload?.status) {
          throw new Error(payload?.message ?? `Erro ao atualizar ${noun}`);
        }
        return payload;
      },
      {
        successMessage: checked
          ? `${capitalized} concluíd${doneSuffix}`
          : `${capitalized} reabert${doneSuffix}`,
        onSuccess: () => {
          onChanged();
          if (checked) setActive("completed");
        },
      }
    );
  };

  // Registrar o estoque é a evidência de que a visita aconteceu, então salvá-lo
  // conclui a visita automaticamente. Sem reabrir o prompt de próximos passos (o
  // estoque já foi o passo) e sem toast redundante quando ela já estava
  // concluída — o modal de estoque já avisa "Estoque registrado".
  const completeFromStock = () => {
    if (item.status === "COMPLETED") {
      onChanged();
      return;
    }
    execute(
      async () => {
        const res = await updateItem({
          variables: { id: item.id, input: { status: "COMPLETED" } },
        });
        const payload = res.data?.updateVisitScheduleItem;
        if (!payload?.status) {
          throw new Error(payload?.message ?? `Erro ao concluir ${noun}`);
        }
        return payload;
      },
      {
        successMessage: `${capitalized} concluíd${doneSuffix}`,
        onSuccess: onChanged,
      }
    );
  };

  // Atalho para lançar/subir o pedido desta visita: leva à página de pedidos do
  // cliente, onde o vendedor cadastra ou importa o pedido. Só existe quando há
  // cliente vinculado.
  const client = item.clientFactoryLink?.client ?? null;
  // A rota /clients/[id] é chaveada pelo id da carteira (company_client), não
  // pelo id global do cliente.
  const companyClientId = client?.companyClient?.id ?? null;
  const clientName = clientDisplayName(client, "Cliente");
  const openClient = companyClientId
    ? () => router.push(`/clients/${companyClientId}/overview`)
    : undefined;
  const openOrder = companyClientId
    ? () => router.push(`/clients/${companyClientId}/orders`)
    : undefined;

  const menu = (
    <MoreOptions
      options={[
        {
          label: `Visualizar ${noun}`,
          icon: Eye,
          onClick: () => setActive("view"),
        },
        ...(openClient
          ? [
              {
                label: "Ver cliente",
                icon: UserRound,
                onClick: openClient,
              },
            ]
          : []),
        {
          label: `Editar ${noun}`,
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
          label: `Remarcar ${noun}`,
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

      <VisitStockModal
        itemId={item.id}
        clientName={clientName}
        open={active === "stock"}
        onOpenChange={(o) => !o && close()}
        onSaved={completeFromStock}
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
        contactType={item.contactType}
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
    toggleCompleted,
    isToggling,
    menu,
    overlays,
  };
}
