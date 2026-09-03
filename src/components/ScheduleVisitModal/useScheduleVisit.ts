"use client";

import { SelectOption } from "@/components/Input";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { clientDisplayName } from "@/utils/client";
import { factoryName } from "@/utils/company";
import { toIsoDate } from "@/utils/format/date";
import { CombinedGraphQLErrors } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import {
  CLIENT_LINKS_FOR_VISIT_QUERY,
  SCHEDULE_MANUAL_VISIT_MUTATION,
  WALLET_CLIENTS_FOR_VISIT_QUERY,
} from "./gql";
import {
  ClientLinksQueryResponse,
  ScheduleManualVisitResponse,
  ScheduleVisitModalProps,
  VisitContactType,
  WalletClientsQueryResponse,
} from "./interface";

/** Escolha automática da fábrica: quem manda é o score, no backend. */
export const AUTO_FACTORY = "__auto__";

const getLinks = (d: ClientLinksQueryResponse) => d.sellerClientFactoryList;
const getWallet = (d: WalletClientsQueryResponse) => d.sellerClientFactoryList;

/** O backend distingue "dia cheio" dos outros conflitos pelo `error_type`. */
const isDayFull = (error: unknown): boolean =>
  CombinedGraphQLErrors.is(error) &&
  error.errors.some(
    (e) => (e.extensions as { error_type?: string })?.error_type === "DAY_FULL"
  );

const errorMessage = (error: unknown, fallback: string): string => {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors[0]?.message?.trim() || fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
};

type Params = Pick<
  ScheduleVisitModalProps,
  | "open"
  | "onOpenChange"
  | "clientId"
  | "sellerId"
  | "defaultDate"
  | "onScheduled"
>;

export function useScheduleVisit({
  open,
  onOpenChange,
  clientId,
  sellerId,
  defaultDate,
  onScheduled,
}: Params) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    clientId ?? null
  );
  const [date, setDate] = useState<Date | null>(null);
  const [contactType, setContactType] = useState<VisitContactType>("IN_PERSON");
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(
    sellerId ?? null
  );
  const [factoryId, setFactoryId] = useState<string>(AUTO_FACTORY);
  const [notes, setNotes] = useState("");
  // O dia cheio não é um beco: o backend recusa dizendo o teto, e quem está com
  // o cliente no telefone confirma. A mensagem dele é que aparece na tela.
  const [dayFullMessage, setDayFullMessage] = useState<string | null>(null);

  const isClientFixed = Boolean(clientId);

  useEffect(() => {
    if (!open) return;
    setSelectedClientId(clientId ?? null);
    setSelectedSellerId(sellerId ?? null);
    setDate(defaultDate ? new Date(`${defaultDate}T12:00:00`) : null);
    setContactType("IN_PERSON");
    setFactoryId(AUTO_FACTORY);
    setNotes("");
    setDayFullMessage(null);
  }, [open, clientId, sellerId, defaultDate]);

  // Trocar de dia ou de tipo refaz a pergunta: o aviso falava do teto do outro.
  useEffect(() => {
    setDayFullMessage(null);
  }, [date, contactType, selectedClientId]);

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

  const walletInput = useMemo(
    () => ({
      filters: [{ field: "seller_id", operator: "eq", value: sellerId ?? "" }],
    }),
    [sellerId]
  );

  const walletQuery = useCompleteList<WalletClientsQueryResponse>(
    WALLET_CLIENTS_FOR_VISIT_QUERY,
    walletInput,
    getWallet,
    { skip: !open || isClientFixed || !sellerId }
  );

  const links = useMemo(
    () =>
      linksQuery.data?.sellerClientFactoryList.edges.map((e) => e.node) ?? [],
    [linksQuery.data]
  );

  /** Vínculos do vendedor escolhido — as fábricas que ele atende no cliente. */
  const ownedLinks = useMemo(
    () =>
      selectedSellerId
        ? links.filter((l) => l.sellerId === selectedSellerId)
        : links,
    [links, selectedSellerId]
  );

  const sellerOptions = useMemo<SelectOption[]>(() => {
    const seen = new Map<string, string>();
    links.forEach((l) => {
      if (l.seller && !seen.has(l.seller.id))
        seen.set(l.seller.id, l.seller.name);
    });
    return [...seen.entries()].map(([value, label]) => ({ value, label }));
  }, [links]);

  const factoryOptions = useMemo<SelectOption[]>(
    () => [
      { value: AUTO_FACTORY, label: "Escolher pelo sistema (mais urgente)" },
      ...ownedLinks.map((l) => ({
        value: l.factoryId,
        label: factoryName(l.factory) || "Fábrica",
      })),
    ],
    [ownedLinks]
  );

  const clientOptions = useMemo<SelectOption[]>(() => {
    const nodes = walletQuery.data?.sellerClientFactoryList.edges.map(
      (e) => e.node
    );
    const seen = new Map<string, string>();
    (nodes ?? []).forEach((n) => {
      if (n.client && !seen.has(n.client.id)) {
        seen.set(n.client.id, clientDisplayName(n.client));
      }
    });
    return [...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [walletQuery.data]);

  // Só pergunta o vendedor quando há mais de um atendendo o cliente: com um
  // único possível, o select é uma pergunta de resposta obrigatória e única.
  const needsSellerChoice = isClientFixed && sellerOptions.length > 1;
  const effectiveSellerId =
    selectedSellerId ??
    (sellerOptions.length === 1 ? sellerOptions[0].value : null);

  const [scheduleVisit] = useMutation<ScheduleManualVisitResponse>(
    SCHEDULE_MANUAL_VISIT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const isValid = Boolean(selectedClientId && date);

  const submit = (allowOverCapacity: boolean) =>
    execute(
      async () => {
        const res = await scheduleVisit({
          variables: {
            input: {
              clientId: selectedClientId,
              date: toIsoDate(date),
              sellerId: effectiveSellerId,
              factoryId: factoryId === AUTO_FACTORY ? null : factoryId,
              contactType,
              notes: notes.trim() || null,
              allowOverCapacity,
            },
          },
        });
        const payload = res.data?.scheduleManualVisit;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao marcar a visita");
        }
        return payload;
      },
      {
        successMessage:
          contactType === "REMOTE" ? "Contato marcado" : "Visita marcada",
        onSuccess: () => {
          onOpenChange(false);
          onScheduled?.();
        },
        onError: (error) => {
          // Guardado ANTES do toast do hook: é este texto que vira o aviso com
          // o botão "marcar mesmo assim".
          setDayFullMessage(
            isDayFull(error)
              ? errorMessage(error, "Este dia já está cheio.")
              : null
          );
        },
      }
    );

  useQueryErrorToast(
    linksQuery.error ?? walletQuery.error,
    "Não foi possível carregar os clientes."
  );

  return {
    selectedClientId,
    setSelectedClientId,
    clientOptions,
    clientsLoading: walletQuery.loading,
    isClientFixed,
    date,
    setDate,
    contactType,
    setContactType,
    sellerOptions,
    needsSellerChoice,
    selectedSellerId: effectiveSellerId,
    setSelectedSellerId,
    factoryId,
    setFactoryId,
    factoryOptions,
    notes,
    setNotes,
    dayFullMessage,
    isValid,
    isLoading,
    submit,
  };
}
