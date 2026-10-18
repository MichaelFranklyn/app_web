"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";

import { PriorityClient, WeekSelection } from "../../interface";
import { buildPlanWeekInput } from "../../utils";
import { PLAN_WEEK_MUTATION } from "./gql";
import { PlanWeekResponse, WeekPlan } from "./interface";

interface Args {
  open: boolean;
  sellerId: string | null;
  weekStart: string;
  selection: WeekSelection;
  clients: PriorityClient[];
  workDates: string[];
  onPlanned: () => void;
}

/**
 * A prévia da semana e a gravação. A prévia refaz a cada troca de dias — o que
 * a pessoa confirma é sempre o que está na tela.
 */
export function usePlanPreview({
  open,
  sellerId,
  weekStart,
  selection,
  clients,
  workDates,
  onPlanned,
}: Args) {
  const [days, setDays] = useState<string[]>(workDates);
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [mutate] = useMutation<PlanWeekResponse>(PLAN_WEEK_MUTATION);
  const preview = useAsyncAction();
  const save = useAsyncAction();
  // Só a resposta da prévia mais recente vale: trocar os dias depressa não
  // pode deixar na tela o plano de uma escolha anterior.
  const lastRequest = useRef(0);

  useEffect(() => {
    if (open) setDays(workDates);
  }, [open, workDates]);

  const run = async (dryRun: boolean) => {
    const input = buildPlanWeekInput(
      sellerId,
      weekStart,
      selection,
      clients,
      days,
      dryRun
    );
    const { data } = await mutate({ variables: { input } });
    const payload = data?.planWeek;
    if (!payload?.status || !payload.data) {
      throw new Error(payload?.message ?? "Não foi possível montar a semana.");
    }
    return payload;
  };

  useEffect(() => {
    if (!open) return;
    const request = ++lastRequest.current;
    setPlan(null);
    void preview.execute(() => run(true), {
      onSuccess: (payload) => {
        if (request === lastRequest.current) setPlan(payload.data);
      },
    });
    // `run` lê o estado atual; a prévia só refaz quando abre ou os dias mudam.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, days]);

  const confirm = () =>
    save.execute(() => run(false), {
      successMessage: (payload) => payload.message,
      onSuccess: () => onPlanned(),
    });

  const toggleDay = (iso: string) =>
    setDays((current) =>
      current.includes(iso)
        ? current.filter((d) => d !== iso)
        : [...current, iso].sort()
    );

  return {
    days,
    toggleDay,
    plan,
    isPreviewing: preview.isLoading,
    isSaving: save.isLoading,
    confirm,
  };
}
