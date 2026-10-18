import type { VisitContactType } from "@/utils/visit";
import { useCallback, useEffect, useState } from "react";

import { PriorityClient, StopChoice, WeekSelection } from "./interface";

/** Uma parada sugerida pelo "Sugerir pra mim". */
interface SuggestionStop {
  clientId: string;
  contactType: VisitContactType;
  date: string;
}

const firstChoice = (client: PriorityClient): StopChoice => ({
  contactType: client.suggestedContactType,
  date: null,
});

/**
 * O que o vendedor escolheu para a semana: quem, como (visita ou contato) e,
 * se quiser, em que dia.
 *
 * Marcar um cliente já traz o toque que o sistema sugere — o vendedor só troca
 * quando discorda. `resetKey` muda com o vendedor e a semana: a escolha era de
 * outra agenda e não pode vazar para esta.
 */
export function useWeekSelection(resetKey: string) {
  const [selection, setSelection] = useState<WeekSelection>({});
  useEffect(() => setSelection({}), [resetKey]);

  const toggle = useCallback((client: PriorityClient) => {
    setSelection((current) => {
      const next = { ...current };
      if (next[client.clientId]) delete next[client.clientId];
      else next[client.clientId] = firstChoice(client);
      return next;
    });
  }, []);

  const toggleMany = useCallback((clients: PriorityClient[], on: boolean) => {
    setSelection((current) => {
      const next = { ...current };
      for (const client of clients) {
        if (!on) delete next[client.clientId];
        else next[client.clientId] ??= firstChoice(client);
      }
      return next;
    });
  }, []);

  const update = useCallback((clientId: string, patch: Partial<StopChoice>) => {
    setSelection((current) =>
      current[clientId]
        ? { ...current, [clientId]: { ...current[clientId], ...patch } }
        : current
    );
  }, []);

  /** Soma a sugestão à escolha: o que a pessoa já marcou fica como está. */
  const applySuggestion = useCallback((stops: SuggestionStop[]) => {
    setSelection((current) => {
      const next = { ...current };
      for (const stop of stops) {
        next[stop.clientId] ??= {
          contactType: stop.contactType,
          date: stop.date,
        };
      }
      return next;
    });
  }, []);

  return {
    selection,
    toggle,
    toggleMany,
    applySuggestion,
    setContactType: (clientId: string, contactType: VisitContactType) =>
      update(clientId, { contactType }),
    setDate: (clientId: string, date: string | null) =>
      update(clientId, { date }),
    clearSelection: useCallback(() => setSelection({}), []),
  };
}
