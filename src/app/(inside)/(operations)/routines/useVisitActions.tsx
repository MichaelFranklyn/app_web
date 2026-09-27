"use client";

import { MoreOptions } from "@/components/MoreOptions";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import {
  useOfflineEntry,
  useSendOrQueue,
  visitStatusDraft,
} from "@/services/offlineQueue";
import { VISIT_CACHE_FIELDS } from "@/utils/cacheFields";
import { clientDisplayName } from "@/utils/client";
import { newOrderUrl } from "@/utils/newOrderUrl";
import { contactLabel, contactNoun } from "@/utils/visit";
import { useMutation } from "@apollo/client/react";
import {
  CalendarCheck,
  CalendarClock,
  Eye,
  MapPin,
  PackageSearch,
  Pencil,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { UPDATE_VISIT_ITEM_MUTATION } from "./gql";
import { VisitScheduleItem } from "./interface";
import { CompletionPromptModal } from "./_components/VisitActions/CompletionPromptModal";
import { EditVisitModal } from "./_components/VisitActions/EditVisitModal";
import { PromoteContactModal } from "./_components/PromoteContactModal";
import { RescheduleVisitModal } from "./_components/VisitActions/RescheduleVisitModal";
import {
  usePrefetchStockCandidates,
  VisitStockModal,
} from "@/components/VisitStockModal";
import { getTodayIso } from "@/utils/format/date";
import { VisitDetailPanel } from "./_components/VisitActions/VisitDetailPanel";
import { WholeDayModal } from "./_components/VisitActions/WholeDayModal";

type ActiveModal =
  | "view"
  | "edit"
  | "stock"
  | "reschedule"
  | "completed"
  | "promote"
  | "wholeDay"
  | null;

interface Args {
  item: VisitScheduleItem;
  /** Data do dia em que a parada está — padrão da viagem ao promover. */
  dayDate?: string | null;
  onChanged: () => void;
}

interface UpdateItemResponse {
  updateVisitScheduleItem?: { status: boolean; message: string };
}

interface Result {
  /**
   * Status a mostrar: o guardado no aparelho (sem sinal) ganha do que veio do
   * servidor, porque é a resposta mais nova que a pessoa deu.
   */
  status: VisitScheduleItem["status"];
  /** A resposta desta visita está guardada esperando o sinal. */
  isAwaitingSignal: boolean;
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
  dayDate = null,
  onChanged,
}: Args): Result {
  const router = useRouter();
  const pathname = usePathname();
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
  const invalidateClient = useInvalidateQueriesClient();
  const sendOrQueue = useSendOrQueue();
  // Visita de hoje ainda aberta: os produtos do estoque ficam no cache para o
  // modal abrir mesmo quando o sinal cair dentro da loja.
  usePrefetchStockCandidates(
    item.id,
    dayDate === getTodayIso() && item.status === "PENDING"
  );
  const queued = useOfflineEntry(`visit:${item.id}`);
  const status =
    queued?.kind === "visitStatus"
      ? (queued.variables.status as VisitScheduleItem["status"])
      : item.status;

  const link = item.clientFactoryLink;
  const client = link?.client ?? null;
  const clientName = clientDisplayName(client, "Cliente");

  /**
   * Grava o status da visita — ou, sem sinal, guarda no aparelho. `queued` no
   * retorno diz qual dos dois aconteceu; a recusa do servidor lança como antes.
   */
  const saveStatus = (next: string, failMessage: string) =>
    sendOrQueue(
      visitStatusDraft(
        { id: item.id, status: next, label: clientName },
        new Date()
      ),
      async (context) => {
        const res = await updateItem({
          variables: { id: item.id, input: { status: next } },
          context,
        });
        const payload = res.data?.updateVisitScheduleItem;
        if (!payload?.status) {
          throw new Error(payload?.message ?? failMessage);
        }
        return payload;
      }
    );

  /** Toast de quando a resposta ficou no aparelho. */
  const queuedMessage = `Sem sinal: ${noun} guardad${doneSuffix} no aparelho. Vai sozinh${doneSuffix} quando o sinal voltar.`;

  /**
   * A visita mudou: recarrega a semana (é a tela) e invalida o assunto, porque
   * o MESMO item aparece no histórico da ficha do cliente. Passa também aos
   * modais filhos — concluir, remarcar, editar, fechar o dia e promover contato
   * desatualizam as duas telas do mesmo jeito.
   */
  const syncVisit = () => {
    onChanged();
    void invalidateClient(VISIT_CACHE_FIELDS);
  };

  // Concluir/reabrir a visita. Ao concluir, oferece registrar o pedido ou o
  // estoque do cliente (o mesmo prompt em qualquer visualização).
  const toggleCompleted = (checked: boolean) => {
    execute(
      () =>
        saveStatus(
          checked ? "COMPLETED" : "PENDING",
          `Erro ao atualizar ${noun}`
        ),
      {
        successMessage: (outcome) =>
          outcome.queued
            ? queuedMessage
            : checked
              ? `${capitalized} concluíd${doneSuffix}`
              : `${capitalized} reabert${doneSuffix}`,
        onSuccess: (outcome) => {
          // Guardado no aparelho: recarregar a semana falharia sem sinal, e o
          // card já mostra a resposta guardada. A fila recarrega ao enviar.
          if (!outcome.queued) syncVisit();
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
    if (status === "COMPLETED") {
      if (!queued) onChanged();
      return;
    }
    execute(() => saveStatus("COMPLETED", `Erro ao concluir ${noun}`), {
      successMessage: (outcome) =>
        outcome.queued ? queuedMessage : `${capitalized} concluíd${doneSuffix}`,
      onSuccess: (outcome) => {
        if (!outcome.queued) syncVisit();
      },
    });
  };

  // "Novo pedido" desta visita: abre direto a página de novo pedido já no
  // vínculo da visita (vendedor → cliente → fábrica), com o pedido amarrado a
  // ela. Sem o vínculo inteiro, abre pelo cliente — escolhe-se o vínculo lá.
  // "Cancelar" volta para esta tela. Só existe quando há cliente vinculado.
  // A rota /clients/[id] é chaveada pelo id da carteira (company_client), não
  // pelo id global do cliente.
  const companyClientId = client?.companyClient?.id ?? null;
  const openClient = companyClientId
    ? () => router.push(`/clients/${companyClientId}/overview`)
    : undefined;
  const openOrder = client
    ? () =>
        router.push(
          newOrderUrl(
            link?.sellerId && link.factory
              ? {
                  visitItemId: item.id,
                  sellerId: link.sellerId,
                  clientId: client.id,
                  factoryId: link.factory.id,
                }
              : { clientId: client.id },
            pathname
          )
        )
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
                label: "Novo pedido",
                icon: ReceiptText,
                onClick: openOrder,
              },
            ]
          : []),
        ...(isRemote && status === "PENDING"
          ? [
              {
                label: "Ir visitar",
                icon: MapPin,
                onClick: () => setActive("promote"),
              },
            ]
          : []),
        // Só para visita presencial que aconteceu (ou está para acontecer): uma
        // ligação não toma o dia, e uma parada já remarcada não tem dia para
        // tomar. Some depois de marcada — repetir a ação não faria nada.
        ...(!isRemote &&
        !item.isWholeDay &&
        (status === "PENDING" || status === "COMPLETED")
          ? [
              {
                label: "Tomou o dia todo",
                icon: CalendarCheck,
                onClick: () => setActive("wholeDay"),
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
        onClient={openClient}
      />

      <EditVisitModal
        item={item}
        open={active === "edit"}
        onOpenChange={(o) => !o && close()}
        onDone={syncVisit}
        onCompleted={() => setActive("completed")}
      />

      <VisitStockModal
        itemId={item.id}
        clientName={clientName}
        open={active === "stock"}
        onOpenChange={(o) => !o && close()}
        onSaved={completeFromStock}
      />

      {isRemote && (
        <PromoteContactModal
          itemId={item.id}
          client={client}
          currentDate={dayDate}
          open={active === "promote"}
          onOpenChange={(o) => !o && close()}
          onDone={syncVisit}
        />
      )}

      <RescheduleVisitModal
        item={item}
        open={active === "reschedule"}
        onOpenChange={(o) => !o && close()}
        onDone={syncVisit}
      />

      <WholeDayModal
        itemId={item.id}
        clientName={clientName}
        isPending={status === "PENDING"}
        open={active === "wholeDay"}
        onOpenChange={(o) => !o && close()}
        onDone={syncVisit}
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
    status,
    isAwaitingSignal: Boolean(queued),
    openView: () => setActive("view"),
    promptAfterComplete: () => setActive("completed"),
    toggleCompleted,
    isToggling,
    menu,
    overlays,
  };
}
