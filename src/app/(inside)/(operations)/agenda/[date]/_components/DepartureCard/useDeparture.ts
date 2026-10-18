import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { UPDATE_DAY_DEPARTURE_MUTATION } from "../../gql";
import { buildDepartureAddress } from "./utils";
import { DepartureMode, UpdateDayDepartureResponse } from "./interface";

interface Params {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayId: string;
  departureType: string;
  onChanged: () => void;
}

export function useDeparture({
  open,
  onOpenChange,
  dayId,
  departureType,
  onChanged,
}: Params) {
  const [mode, setMode] = useState<DepartureMode>(
    departureType === "CUSTOM" ? "custom" : "home"
  );

  const [updateDay] = useMutation<UpdateDayDepartureResponse>(
    UPDATE_DAY_DEPARTURE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // Reseta o modo para o do dia sempre que o modal reabre.
  useEffect(() => {
    if (open) setMode(departureType === "CUSTOM" ? "custom" : "home");
  }, [open, departureType]);

  const save = (input: Record<string, unknown>, successMessage: string) =>
    execute(
      async () => {
        const res = await updateDay({ variables: { id: dayId, input } });
        const payload = res.data?.updateVisitScheduleDay;
        if (!payload?.status) {
          throw new Error(
            payload?.message ?? "Erro ao alterar o ponto de partida"
          );
        }
        return payload;
      },
      {
        successMessage,
        onSuccess: () => {
          onOpenChange(false);
          // O backend reordenou as paradas pela nova origem — recarrega a rota.
          onChanged();
        },
      }
    );

  // Casa do vendedor: só o tipo; o backend resolve o endereço de casa e recalcula.
  const applyHome = () =>
    save({ departureType: "HOME" }, "Partindo da casa do vendedor");

  // Endereço personalizado: monta o texto e envia; a Routes API geocodifica.
  const applyCustom = (data: Record<string, unknown>) => {
    const address = buildDepartureAddress(data);
    if (!address) return; // FormBuilder já exige rua e cidade (required).
    save(
      { departureType: "CUSTOM", departureAddress: address },
      "Ponto de partida atualizado"
    );
  };

  return { mode, setMode, isLoading, applyHome, applyCustom };
}
