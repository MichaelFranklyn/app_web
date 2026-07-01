"use client";

import { Button } from "@/components/Button";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { CalendarPlus } from "lucide-react";
import { GENERATE_DAY_ROUTE_MUTATION } from "../../gql";

interface GenerateDayRouteResponse {
  generateDayRoute?: {
    status: boolean;
    message: string;
    data?: { id: string } | null;
  };
}

interface Props {
  date: string;
  sellerId?: string | null;
  onGenerated: () => void;
}

// Mesmo botão da tela do dia (routines/[date]): gera a rota de um único dia que
// ainda não tem rota planejada, direto da grade semanal.
export function GenerateDayButton({ date, sellerId, onGenerated }: Props) {
  const [generateDayRoute] = useMutation<GenerateDayRouteResponse>(
    GENERATE_DAY_ROUTE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleGenerate = () =>
    execute(
      async () => {
        const res = await generateDayRoute({
          variables: { input: { date, sellerId } },
        });
        const payload = res.data?.generateDayRoute;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao gerar a rota do dia");
        }
        return payload;
      },
      {
        successMessage: "Rota do dia gerada",
        onSuccess: onGenerated,
      }
    );

  return (
    <Button.Root
      appearance="tinted"
      color="amber"
      size="sm"
      fullWidth
      noUppercase
      loading={isLoading}
      onClick={handleGenerate}
    >
      <Button.Icon icon={CalendarPlus} />
      <Button.Title>Gerar rota para este dia</Button.Title>
    </Button.Root>
  );
}
