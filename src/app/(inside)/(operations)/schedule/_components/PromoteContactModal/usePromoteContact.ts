"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { getTodayIso } from "@/utils/format/date";
import { useEffect, useState } from "react";
import { PROMOTE_CONTACT_MUTATION, VISIT_PROMOTION_PREVIEW_QUERY } from "./gql";
import { DisplacedStrategy, PromotionPreviewQueryData } from "./interface";

interface PromoteResponse {
  promoteContactToVisit?: { status: boolean; message: string };
}

interface Args {
  itemId: string;
  /** Dia em que o contato está hoje — o padrão da viagem. */
  currentDate: string | null;
  open: boolean;
  onDone: () => void;
}

export function usePromoteContact({ itemId, currentDate, open, onDone }: Args) {
  // Data da viagem. Vazio = o dia em que o contato já está; trocar aqui refaz a
  // conta contra o dia escolhido (um dia vazio muda tudo: a viagem deixa de
  // expulsar ninguém).
  const [targetDate, setTargetDate] = useState<string>("");

  const { data, previousData, loading, error } =
    useQuery<PromotionPreviewQueryData>(VISIT_PROMOTION_PREVIEW_QUERY, {
      variables: { itemId, targetDate: targetDate || null },
      // A conta depende do dia inteiro (paradas, distâncias, scores), que muda
      // enquanto o vendedor trabalha — não vale mostrar cache velho de uma
      // decisão que remaneja a semana.
      fetchPolicy: "network-only",
      skip: !open,
    });

  // Trocar o dia muda as variáveis e o Apollo zera `data`: sem o
  // `previousData`, o modal inteiro (aviso, vizinhos, botão) sumia entre um dia
  // e outro e voltava — piscando a cada clique no calendário.
  const preview =
    data?.visitPromotionPreview ?? previousData?.visitPromotionPreview ?? null;
  const [strategy, setStrategy] = useState<DisplacedStrategy>("TO_REMOTE");
  const [confirmed, setConfirmed] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  // Cada abertura recomeça a decisão: reaproveitar a confirmação anterior faria
  // o vendedor marcar uma viagem sem ler o aviso desta.
  useEffect(() => {
    if (!open) {
      setConfirmed(false);
      setSelected([]);
      setStrategy("TO_REMOTE");
      setTargetDate("");
    }
  }, [open]);

  // Trocar o dia refaz a conta: a confirmação anterior era sobre outro dia.
  useEffect(() => {
    setConfirmed(false);
  }, [targetDate]);

  const [promote] = useMutation<PromoteResponse>(PROMOTE_CONTACT_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const toggleCandidate = (linkId: string) =>
    setSelected((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );

  // O aviso existe quando a viagem não convive com o dia — seja porque toma o
  // dia inteiro, seja porque não cabe nem sozinha.
  const needsConfirm = !!preview && !preview.fitsWithExisting;
  // Dia no passado nem chega ao backend: o calendário aceita clicar, a regra é
  // que não deixa marcar.
  const isPastDate = !!targetDate && targetDate < getTodayIso();
  const canSubmit = !!preview && !isPastDate && (!needsConfirm || confirmed);

  const submit = () =>
    execute(
      async () => {
        const res = await promote({
          variables: {
            input: {
              itemId,
              confirmWholeDay: confirmed,
              displacedStrategy: strategy,
              includeLinkIds: selected,
              ...(targetDate ? { targetDate } : {}),
            },
          },
        });
        const payload = res.data?.promoteContactToVisit;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao marcar a visita");
        }
        return payload;
      },
      {
        successMessage:
          selected.length > 0
            ? `Visita marcada com mais ${selected.length} da região`
            : "Visita marcada",
        onSuccess: onDone,
      }
    );

  return {
    preview,
    targetDate,
    setTargetDate,
    currentDate,
    // `loading` só na primeira carga: ao trocar o dia, manter a tela montada
    // evita o modal piscar a cada clique no calendário.
    loading: loading && !preview,
    isRefreshing: loading && !!preview,
    error,
    strategy,
    setStrategy,
    confirmed,
    setConfirmed,
    selected,
    toggleCandidate,
    needsConfirm,
    canSubmit,
    isSubmitting: isLoading,
    submit,
  };
}
