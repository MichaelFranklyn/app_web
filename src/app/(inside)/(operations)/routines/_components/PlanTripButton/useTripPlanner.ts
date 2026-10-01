"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { PLAN_SELLER_TRIP_MUTATION, TRIP_REGION_OPTIONS_QUERY } from "./gql";
import {
  PlanSellerTripResponse,
  TripPeriod,
  TripPlan,
  TripRegionOptionsData,
} from "./interface";
import { buildPlanInput } from "./utils";

interface Args {
  open: boolean;
  sellerId: string | null;
  onClose: () => void;
  /** Depois de gravar: a rotina em tela e a lista de viagens recarregam. */
  onPlanned: () => void;
}

const EMPTY_PERIOD: TripPeriod = { from: null, to: null };

/**
 * O planejador da viagem em dois passos: escolher (cidades + período) e
 * conferir a prévia antes de gravar.
 *
 * A prévia é a mesma mutation com `dryRun` — o backend roda o plano inteiro sem
 * gravar —, então o que a pessoa confirma é exatamente o que entra na rotina.
 * Mexer em qualquer escolha depois da prévia a descarta: confirmar um plano que
 * não corresponde mais à tela seria pior que pedir um clique a mais.
 */
export function useTripPlanner({ open, sellerId, onClose, onPlanned }: Args) {
  const [selectedKeys, setSelectedKeysState] = useState<string[]>([]);
  const [period, setPeriodState] = useState<TripPeriod>(EMPTY_PERIOD);
  const [note, setNote] = useState("");
  const [plan, setPlan] = useState<TripPlan | null>(null);

  const [fetchOptions, { data, loading: optionsLoading }] =
    useLazyQuery<TripRegionOptionsData>(TRIP_REGION_OPTIONS_QUERY, {
      fetchPolicy: "cache-and-network",
    });
  const [planMutation] = useMutation<PlanSellerTripResponse>(
    PLAN_SELLER_TRIP_MUTATION
  );
  const preview = useAsyncAction();
  const save = useAsyncAction();

  // As cidades só interessam a quem abriu o planejador.
  useEffect(() => {
    if (open) void fetchOptions({ variables: { sellerId } });
  }, [open, sellerId, fetchOptions]);

  const options = data?.trip_region_options ?? [];

  const reset = () => {
    setSelectedKeysState([]);
    setPeriodState(EMPTY_PERIOD);
    setNote("");
    setPlan(null);
  };

  const setSelectedKeys = (keys: string[]) => {
    setSelectedKeysState(keys);
    setPlan(null);
  };
  const setPeriod = (next: TripPeriod) => {
    setPeriodState(next);
    setPlan(null);
  };

  const run = async (dryRun: boolean) => {
    const input = buildPlanInput(
      sellerId,
      selectedKeys,
      options,
      period,
      note,
      dryRun
    );
    if (!input) throw new Error("Escolha as cidades e as datas da viagem.");
    const { data: result } = await planMutation({ variables: { input } });
    const payload = result?.planSellerTrip;
    if (!payload?.status || !payload.data) {
      throw new Error(
        payload?.message ?? "Não foi possível planejar a viagem."
      );
    }
    return payload;
  };

  const requestPreview = () =>
    preview.execute(() => run(true), {
      onSuccess: (payload) => setPlan(payload.data),
    });

  const confirm = () =>
    save.execute(() => run(false), {
      successMessage: (payload) => payload.message,
      onSuccess: () => {
        reset();
        onClose();
        onPlanned();
      },
    });

  return {
    options,
    optionsLoading,
    selectedKeys,
    setSelectedKeys,
    period,
    setPeriod,
    note,
    setNote,
    plan,
    backToForm: () => setPlan(null),
    reset,
    isValid: Boolean(
      buildPlanInput(sellerId, selectedKeys, options, period, note, true)
    ),
    requestPreview,
    confirm,
    isPreviewing: preview.isLoading,
    isSaving: save.isLoading,
  };
}
