"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { getCurrentWeekMondayIso, getTodayIso } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { getNextWeekMondayIso } from "../../../utils";
import { PriorityClient, WeekChoice, WeekSelection } from "../../interface";
import { buildPlanWeekInput, defaultWorkDays, weekStartFor } from "../../utils";
import { PLAN_WEEK_MUTATION } from "./gql";
import { PlanWeekResponse, WeekPlan } from "./interface";

/** O dia de 4 visitas (2 por turno, a jornada de 24/08/2026) e duas ligações:
 * o ponto de partida, que o vendedor troca à vontade. */
const DEFAULT_VISITS = 4;
const DEFAULT_CALLS = 2;

/**
 * Em que semana a configuração abre. A sugerida (a da lista ou a da Agenda) —
 * salvo quando ela já não tem dia de trabalho pela frente (sábado, domingo,
 * sexta à tarde): aí abre na que vem, que é a que a pessoa vai organizar.
 */
const choiceFor = (weekStart: string, todayIso: string): WeekChoice => {
  if (defaultWorkDays(weekStart, todayIso).length === 0) return "next";
  if (weekStart === getCurrentWeekMondayIso()) return "current";
  if (weekStart === getNextWeekMondayIso()) return "next";
  return "other";
};

interface Args {
  open: boolean;
  sellerId: string | null;
  /** A semana que a configuração abre sugerindo (a da lista, ou a da Agenda). */
  initialWeekStart: string;
  selection: WeekSelection;
  clients: PriorityClient[];
  onPlanned: (weekStart: string) => void;
}

/**
 * A configuração completa da semana e os dois passos dela: CONFIGURAR (qual
 * semana, que dias, quantas visitas e ligações por dia, completar ou não com
 * sugestões) e CONFERIR (a semana organizada, antes de gravar). As duas usam a
 * mesma mutation — a prévia é `dryRun` —, então o que a pessoa confirma é o
 * que entra na agenda.
 */
export function useWeekSetup({
  open,
  sellerId,
  initialWeekStart,
  selection,
  clients,
  onPlanned,
}: Args) {
  const todayIso = getTodayIso();
  const hasSelection = Object.keys(selection).length > 0;

  const [step, setStep] = useState<"setup" | "preview">("setup");
  const [weekChoice, setWeekChoice] = useState<WeekChoice>(() =>
    choiceFor(initialWeekStart, todayIso)
  );
  const [otherWeekStart, setOtherWeekStart] = useState(initialWeekStart);
  const [visitsPerDay, setVisitsPerDay] = useState(DEFAULT_VISITS);
  const [callsPerDay, setCallsPerDay] = useState(DEFAULT_CALLS);
  // Sem ninguém escolhido, completar é o único jeito de organizar a semana.
  const [fillWithSuggestions, setFill] = useState(!hasSelection);
  const [plan, setPlan] = useState<WeekPlan | null>(null);

  const weekStart = weekStartFor(weekChoice, otherWeekStart);
  const [days, setDays] = useState<string[]>(() =>
    defaultWorkDays(weekStart, todayIso)
  );

  useEffect(() => {
    if (!open) return;
    setStep("setup");
    setPlan(null);
    setWeekChoice(choiceFor(initialWeekStart, todayIso));
    setOtherWeekStart(initialWeekStart);
    setFill(!hasSelection);
    // Reabrir volta ao ponto de partida; o que muda com a escolha fica.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Trocar a semana troca os dias oferecidos.
  useEffect(() => {
    setDays(defaultWorkDays(weekStart, todayIso));
  }, [weekStart, todayIso]);

  const setup = useMemo(
    () => ({ weekStart, days, visitsPerDay, callsPerDay, fillWithSuggestions }),
    [weekStart, days, visitsPerDay, callsPerDay, fillWithSuggestions]
  );

  const [mutate] = useMutation<PlanWeekResponse>(PLAN_WEEK_MUTATION);
  const preview = useAsyncAction();
  const save = useAsyncAction();

  const run = async (dryRun: boolean) => {
    const input = buildPlanWeekInput(
      sellerId,
      setup,
      selection,
      clients,
      todayIso,
      dryRun
    );
    const { data } = await mutate({ variables: { input } });
    const payload = data?.planWeek;
    if (!payload?.status || !payload.data) {
      throw new Error(payload?.message ?? "Não foi possível montar a semana.");
    }
    return payload;
  };

  const organize = () =>
    preview.execute(() => run(true), {
      onSuccess: (payload) => {
        setPlan(payload.data);
        setStep("preview");
      },
    });

  const confirm = () =>
    save.execute(() => run(false), {
      successMessage: (payload) => payload.message,
      onSuccess: () => onPlanned(weekStart),
    });

  const toggleDay = (iso: string) =>
    setDays((current) =>
      current.includes(iso)
        ? current.filter((d) => d !== iso)
        : [...current, iso].sort()
    );

  return {
    step,
    backToSetup: () => setStep("setup"),
    weekChoice,
    setWeekChoice,
    otherWeekStart,
    setOtherWeekStart,
    weekStart,
    days,
    toggleDay,
    visitsPerDay,
    setVisitsPerDay,
    callsPerDay,
    setCallsPerDay,
    fillWithSuggestions,
    setFill,
    hasSelection,
    todayIso,
    plan,
    organize,
    confirm,
    isOrganizing: preview.isLoading,
    isSaving: save.isLoading,
    isValid:
      days.length > 0 &&
      (hasSelection || fillWithSuggestions) &&
      (!fillWithSuggestions || visitsPerDay + callsPerDay > 0),
  };
}
