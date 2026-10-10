"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { useQuery } from "@apollo/client/react";
import { CalendarPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { getNextWeekMondayIso, isWeekendToday } from "../../utils";
import { GenerateWeekButton } from "../GenerateWeekButton";
import { NEXT_WEEK_SCHEDULE_QUERY } from "./gql";

interface NextWeekScheduleData {
  next_week_schedules?: {
    edges: { node: { id: string; status: string } }[];
  };
}

interface Props {
  /** Vendedor escolhido pelo gestor; nulo = o próprio vendedor logado. */
  sellerId: string | null;
  /** Gestor que ainda não escolheu vendedor: não há de quem perguntar. */
  isSellerPending: boolean;
  /** Leva a tela para a semana que vem (depois de gerar, ou para conferir). */
  onShowNextWeek: (weekStartIso: string) => void;
}

/**
 * No sábado e no domingo, o convite para planejar a semana que vem.
 *
 * O sistema monta a rotina sozinho no domingo ao meio-dia; este aviso é para
 * quem quer se adiantar. Ele aparece na semana ATUAL, que é onde a tela abre —
 * sem ele o botão de gerar só seria achado por quem avançasse a semana.
 */
export function NextWeekPrompt({
  sellerId,
  isSellerPending,
  onShowNextWeek,
}: Props) {
  // Lido após o mount: o dia da semana do servidor (UTC) pode não ser o do
  // aparelho, e o aviso piscaria na hidratação.
  const [isWeekend, setIsWeekend] = useState(false);
  useEffect(() => setIsWeekend(isWeekendToday()), []);

  const nextWeek = getNextWeekMondayIso();
  const filters = [
    { field: "week_start", operator: "eq", value: nextWeek },
    ...(sellerId
      ? [{ field: "seller_id", operator: "eq", value: sellerId }]
      : []),
  ];
  const { data, loading, error } = useQuery<NextWeekScheduleData>(
    NEXT_WEEK_SCHEDULE_QUERY,
    {
      variables: { input: { first: 1, filters } },
      skip: !isWeekend || isSellerPending,
      // A rotina pode ter nascido fora daqui (o job de domingo, outra aba).
      fetchPolicy: "cache-and-network",
    }
  );

  if (!isWeekend || isSellerPending || error || (loading && !data)) return null;

  const hasSchedule = Boolean(data?.next_week_schedules?.edges?.length);

  return (
    <Alert.Root variant="info">
      <Alert.Icon icon={CalendarPlus} />
      <Alert.Content>
        <Alert.Title>
          {hasSchedule
            ? "A rotina da semana que vem já está pronta"
            : "A semana que vem já pode ser planejada"}
        </Alert.Title>
        <Alert.Description>
          {hasSchedule
            ? "Confira as visitas antes de a semana começar."
            : "O sistema monta a rotina sozinho no domingo ao meio-dia. Se quiser se adiantar, gere agora."}
        </Alert.Description>
      </Alert.Content>
      <Alert.Actions>
        {hasSchedule ? (
          <Button.Root
            appearance="tinted"
            color="amber"
            size="sm"
            noUppercase
            onClick={() => onShowNextWeek(nextWeek)}
          >
            <Button.Title>Ver semana que vem</Button.Title>
          </Button.Root>
        ) : (
          <GenerateWeekButton
            weekStart={nextWeek}
            sellerId={sellerId}
            onGenerated={() => onShowNextWeek(nextWeek)}
          />
        )}
      </Alert.Actions>
    </Alert.Root>
  );
}
