"use client";

import { Button } from "@/components/Button";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { CalendarPlus } from "lucide-react";
import { GENERATE_WEEKLY_SCHEDULE_MUTATION } from "../../gql";

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
  onGenerated: () => void;
}

// Gera a rotina da semana inteira quando ela ainda não existe. O backend resolve
// o seller_id para o vendedor logado; gestores mandam o sellerId escolhido.
export function GenerateWeekButton({
  weekStart,
  sellerId,
  onGenerated,
}: Props) {
  const [generateWeeklySchedule] = useMutation<GenerateWeeklyScheduleResponse>(
    GENERATE_WEEKLY_SCHEDULE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleGenerate = () =>
    execute(
      async () => {
        const res = await generateWeeklySchedule({
          variables: { input: { weekStart, sellerId } },
        });
        const payload = res.data?.generateWeeklySchedule;
        if (!payload?.status) {
          throw new Error(
            payload?.message ?? "Erro ao gerar a rotina da semana"
          );
        }
        return payload;
      },
      {
        successMessage: "Rotina da semana gerada",
        onSuccess: onGenerated,
      }
    );

  return (
    <Button.Root
      appearance="solid"
      color="amber"
      size="sm"
      noUppercase
      loading={isLoading}
      onClick={handleGenerate}
    >
      <Button.Icon icon={CalendarPlus} />
      <Button.Title>Gerar rotina desta semana</Button.Title>
    </Button.Root>
  );
}
