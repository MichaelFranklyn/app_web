"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
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
  /**
   * O dia já tem visita marcada à mão: o botão COMPLETA o dia em volta dela em
   * vez de gerar do zero. A mesma operação no backend; muda o que se promete.
   */
  complete?: boolean;
}

// Mesmo botão da tela do dia (routines/[date]): gera a rota de um único dia que
// ainda não tem rota planejada, direto da grade semanal — ou completa o dia que
// só tem visitas marcadas à mão.
export function GenerateDayButton({
  date,
  sellerId,
  onGenerated,
  complete = false,
}: Props) {
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
        successMessage: complete ? "Dia completado" : "Rota do dia gerada",
        onSuccess: onGenerated,
      }
    );

  return (
    <div className="flex flex-col gap-4">
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
        <Button.Title>
          {complete ? "Completar o dia" : "Gerar rota para este dia"}
        </Button.Title>
      </Button.Root>
      {complete && (
        <Title variant="micro" color="muted" className="text-center">
          As visitas que você marcou ficam. O sistema completa o dia com
          clientes perto delas.
        </Title>
      )}
    </div>
  );
}
