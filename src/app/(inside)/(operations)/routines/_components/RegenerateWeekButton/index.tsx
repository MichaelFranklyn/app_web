"use client";

import { Button } from "@/components/Button";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { GENERATE_WEEKLY_SCHEDULE_MUTATION } from "../../gql";
import { weekPhrase } from "../../utils";
import { TripPlannerModal } from "../PlanTripButton/TripPlannerModal";
import { RegenerateReasonModal } from "./RegenerateReasonModal";
import { RegenerateReason } from "./utils";

interface GenerateWeeklyScheduleResponse {
  generateWeeklySchedule?: {
    status: boolean;
    message: string;
    data?: { id: string } | null;
  };
}

interface Props {
  weekStart: string;
  sellerId?: string | null;
  /** Vendedor de fato em tela — a carteira de onde saem as cidades da viagem. */
  tripSellerId?: string | null;
  /** Rotina já confirmada não pode ser refeita — o backend recusa. */
  isConfirmed: boolean;
  onRegenerated: () => void;
  /** Depois de planejar a viagem: a semana e a lista de viagens recarregam. */
  onTripPlanned?: () => void;
}

/**
 * Refaz a rotina da semana que JÁ existe — depois de perguntar o motivo.
 *
 * A mesma mutation do botão de gerar (`generateWeeklySchedule`) substitui o
 * rascunho da semana: apaga as visitas pendentes dos dias que ainda vêm e monta
 * tudo de novo com os scores e o estoque de hoje. Visitas concluídas e dias que
 * já passaram ficam como estão.
 *
 * Quem responde "vou atender uma região" NÃO refaz: sai deste modal e cai no
 * planejador de viagem (um modal depois do outro, nunca um sobre o outro). Os
 * demais motivos vão gravados junto com a rotina refeita.
 */
export function RegenerateWeekButton({
  weekStart,
  sellerId,
  tripSellerId,
  isConfirmed,
  onRegenerated,
  onTripPlanned,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTripOpen, setIsTripOpen] = useState(false);
  const [reason, setReason] = useState<RegenerateReason | null>(null);
  const [note, setNote] = useState("");
  const [generateWeeklySchedule] = useMutation<GenerateWeeklyScheduleResponse>(
    GENERATE_WEEKLY_SCHEDULE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const weekLabel = weekPhrase(weekStart);

  const handleOpenChange = (next: boolean) => {
    setIsOpen(next);
    if (!next) {
      setReason(null);
      setNote("");
    }
  };

  const handleSubmit = () => {
    if (reason === "TRIP") {
      handleOpenChange(false);
      setIsTripOpen(true);
      return;
    }
    execute(
      async () => {
        const res = await generateWeeklySchedule({
          variables: {
            input: {
              weekStart,
              sellerId,
              reason,
              reasonNote: note.trim() || null,
            },
          },
        });
        const payload = res.data?.generateWeeklySchedule;
        if (!payload?.status) {
          throw new Error(
            payload?.message ?? "Erro ao refazer a rotina da semana"
          );
        }
        return payload;
      },
      {
        successMessage: `Rotina ${weekLabel} refeita`,
        onSuccess: () => {
          onRegenerated();
          handleOpenChange(false);
        },
      }
    );
  };

  return (
    <>
      <Button.Root
        appearance="outline"
        color="neutral"
        size="sm"
        noUppercase
        disabled={isConfirmed}
        title={
          isConfirmed
            ? "Rotina confirmada não pode ser refeita — edite as visitas ou volte a rotina para rascunho."
            : `Monta a rotina ${weekLabel} de novo, com os scores de hoje`
        }
        onClick={() => setIsOpen(true)}
      >
        <Button.Icon icon={RefreshCw} />
        <Button.Title>Refazer rotina</Button.Title>
      </Button.Root>

      <RegenerateReasonModal
        open={isOpen}
        onOpenChange={handleOpenChange}
        weekLabel={weekLabel}
        reason={reason}
        note={note}
        isLoading={isLoading}
        onReasonChange={setReason}
        onNoteChange={setNote}
        onSubmit={handleSubmit}
      />

      <TripPlannerModal
        open={isTripOpen}
        onOpenChange={setIsTripOpen}
        sellerId={tripSellerId ?? sellerId ?? null}
        onPlanned={() => onTripPlanned?.()}
      />
    </>
  );
}
