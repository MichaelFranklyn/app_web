"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useLazyQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { SUGGEST_WEEK_PLAN_QUERY } from "./gql";
import { SuggestedStop, SuggestWeekPlanData } from "./interface";

/** O que o modal abre sugerindo: o dia de 4 visitas (2 por turno, a jornada
 * de 24/08/2026) e duas ligações. O vendedor troca à vontade. */
const DEFAULT_VISITS = 4;
const DEFAULT_CALLS = 2;

interface Args {
  open: boolean;
  sellerId: string | null;
  weekStart: string;
  workDates: string[];
  onSuggested: (stops: SuggestedStop[]) => void;
}

/** As escolhas do "Sugerir pra mim" e a busca da sugestão. */
export function useSuggestWeek({
  open,
  sellerId,
  weekStart,
  workDates,
  onSuggested,
}: Args) {
  const [visitsPerDay, setVisitsPerDay] = useState(DEFAULT_VISITS);
  const [callsPerDay, setCallsPerDay] = useState(DEFAULT_CALLS);
  const [days, setDays] = useState<string[]>(workDates);
  const [fetchSuggestion] = useLazyQuery<SuggestWeekPlanData>(
    SUGGEST_WEEK_PLAN_QUERY,
    // O score anda: a sugestão é sempre a de agora.
    { fetchPolicy: "network-only" }
  );
  const { execute, isLoading } = useAsyncAction();

  useEffect(() => {
    if (open) setDays(workDates);
  }, [open, workDates]);

  const toggleDay = (iso: string) =>
    setDays((current) =>
      current.includes(iso)
        ? current.filter((d) => d !== iso)
        : [...current, iso].sort()
    );

  const suggest = () =>
    execute(
      async () => {
        const { data, error } = await fetchSuggestion({
          variables: {
            input: {
              ...(sellerId ? { sellerId } : {}),
              weekStart,
              visitsPerDay,
              callsPerDay,
              days,
            },
          },
        });
        if (error) throw error;
        const stops = data?.suggestWeekPlan?.stops;
        if (!stops) throw new Error("Não foi possível sugerir a semana.");
        return stops;
      },
      {
        successMessage: (stops) =>
          stops.length === 0
            ? "Não sobrou cliente para sugerir nesses dias."
            : `${stops.length} ${stops.length === 1 ? "cliente sugerido" : "clientes sugeridos"} — confira e mexa à vontade.`,
        onSuccess: (stops) => onSuggested(stops),
      }
    );

  return {
    visitsPerDay,
    setVisitsPerDay,
    callsPerDay,
    setCallsPerDay,
    days,
    toggleDay,
    suggest,
    isLoading,
    isValid: days.length > 0 && visitsPerDay + callsPerDay > 0,
  };
}
