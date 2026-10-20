"use client";

import { SelectOption } from "@/components/Input";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { AGENDA_SCHEDULE_CACHE_FIELDS } from "@/utils/cacheFields";
import { factoryName } from "@/utils/company";
import { toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import {
  CLIENT_LINKS_FOR_VISIT_QUERY,
  SCHEDULE_MANUAL_VISIT_MUTATION,
} from "./gql";
import {
  ClientLinksQueryResponse,
  ScheduleManualVisitResponse,
  ScheduleVisitModalProps,
  VisitContactType,
} from "./interface";
import { useAgendaOwner } from "./useAgendaOwner";
import { useClientChoices } from "./useClientChoices";

/** Escolha automática da fábrica: quem manda é o score, no backend. */
export const AUTO_FACTORY = "__auto__";

const getLinks = (d: ClientLinksQueryResponse) => d.sellerClientFactoryList;

type Params = Omit<
  ScheduleVisitModalProps,
  "clientName" | "orderLabel" | "returnLabel"
>;

/**
 * Marcar uma parada na agenda: de quem, qual cliente, qual dia, e o combinado.
 *
 * Visita e ligação são a mesma parada com tipos diferentes (19/10/2026): este
 * é o único formulário de marcar — da agenda, da ficha do cliente, do pedido,
 * das pendências e das oportunidades.
 */
export function useScheduleVisit({
  open,
  onOpenChange,
  clientId,
  sellerId,
  owner: fixedOwner,
  defaultDate,
  contactType: fixedContactType,
  orderId: fixedOrderId,
  returnItemId,
  onScheduled,
}: Params) {
  const [pickedOwnerId, setPickedOwnerId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    clientId ?? null
  );
  const [date, setDate] = useState<Date | null>(null);
  const [contactType, setContactType] = useState<VisitContactType>(
    fixedContactType ?? "IN_PERSON"
  );
  const [factoryId, setFactoryId] = useState<string>(AUTO_FACTORY);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const isClientFixed = Boolean(clientId);

  useEffect(() => {
    if (!open) return;
    setPickedOwnerId(null);
    setSelectedClientId(clientId ?? null);
    setDate(defaultDate ? new Date(`${defaultDate}T12:00:00`) : null);
    setContactType(fixedContactType ?? "IN_PERSON");
    setFactoryId(AUTO_FACTORY);
    setOrderId(null);
    setReason(null);
    setNotes("");
  }, [open, clientId, defaultDate, fixedContactType]);

  const linksInput = useMemo(
    () => ({
      filters: [
        { field: "client_id", operator: "eq", value: selectedClientId ?? "" },
      ],
    }),
    [selectedClientId]
  );
  const linksQuery = useCompleteList<ClientLinksQueryResponse>(
    CLIENT_LINKS_FOR_VISIT_QUERY,
    linksInput,
    getLinks,
    { skip: !open || !selectedClientId }
  );
  const links = useMemo(
    () =>
      linksQuery.data?.sellerClientFactoryList?.edges?.map((e) => e.node) ?? [],
    [linksQuery.data]
  );

  const agenda = useAgendaOwner({
    open,
    fixedOwner: fixedOwner ?? null,
    fixedSellerId: sellerId ?? null,
    pickedId: pickedOwnerId,
    clientSellerIds:
      isClientFixed && linksQuery.data
        ? [...new Set(links.map((l) => l.sellerId))]
        : null,
  });
  const ownerSellerId = agenda.owner?.sellerId ?? null;
  // Quem não vende só recebe ligação.
  const effectiveType: VisitContactType = agenda.callsOnly
    ? "REMOTE"
    : contactType;

  const choices = useClientChoices({
    open,
    isClientFixed,
    sellerId: ownerSellerId,
    hasOwner: Boolean(agenda.owner),
    clientId: selectedClientId,
    isOrderFixed: Boolean(fixedOrderId),
  });

  const factoryOptions = useMemo<SelectOption[]>(
    () => [
      { value: AUTO_FACTORY, label: "Escolher pelo sistema (mais urgente)" },
      ...links
        .filter((l) => l.sellerId === ownerSellerId)
        .map((l) => ({
          value: l.factoryId,
          label: factoryName(l.factory) || "Fábrica",
        })),
    ],
    [links, ownerSellerId]
  );

  /** Trocar a agenda troca a carteira: o cliente e o pedido escolhidos saem. */
  const pickOwner = (id: string | null) => {
    setPickedOwnerId(id);
    if (!isClientFixed) {
      setSelectedClientId(null);
      setOrderId(null);
    }
    setFactoryId(AUTO_FACTORY);
  };

  const [scheduleVisit] = useMutation<ScheduleManualVisitResponse>(
    SCHEDULE_MANUAL_VISIT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const submit = () =>
    execute(
      async () => {
        const res = await scheduleVisit({
          variables: {
            input: {
              clientId: selectedClientId,
              date: toIsoDate(date),
              contactType: effectiveType,
              sellerId: ownerSellerId,
              ownerUserId: agenda.canChoose
                ? (agenda.owner?.id ?? null)
                : (fixedOwner?.id ?? null),
              factoryId: factoryId === AUTO_FACTORY ? null : factoryId,
              reason: reason?.trim() || null,
              orderId: fixedOrderId ?? orderId,
              returnItemId: returnItemId ?? null,
              notes: notes.trim() || null,
            },
          },
        });
        const payload = res.data?.scheduleManualVisit;
        if (!payload?.status)
          throw new Error(payload?.message ?? "Erro ao marcar");
        return payload;
      },
      {
        successMessage:
          effectiveType === "REMOTE" ? "Ligação marcada" : "Visita marcada",
        onSuccess: () => {
          onOpenChange(false);
          onScheduled?.();
          // Entra na agenda, na ficha do cliente e — dispensando o "sem
          // contato" — na central de pendências.
          void invalidateClient(AGENDA_SCHEDULE_CACHE_FIELDS);
        },
      }
    );

  useQueryErrorToast(
    linksQuery.error ?? choices.clientsError,
    "Não foi possível carregar os clientes."
  );

  return {
    agenda,
    pickOwner,
    isClientFixed,
    selectedClientId,
    setSelectedClientId,
    ...choices,
    date,
    setDate,
    contactType: effectiveType,
    setContactType,
    factoryId,
    setFactoryId,
    factoryOptions,
    orderId,
    setOrderId,
    reason,
    setReason,
    notes,
    setNotes,
    isValid: Boolean(selectedClientId && date && agenda.owner),
    isLoading,
    submit,
  };
}
