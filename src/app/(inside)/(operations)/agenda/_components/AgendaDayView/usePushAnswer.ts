"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PushAnswer } from "../../useVisitActions";

/** O que o aviso põe na URL — e que sai dela depois de lido. */
const PUSH_PARAMS = ["visit", "answer", "kind"];

export interface PendingPushAnswer {
  visitId: string;
  answer: PushAnswer;
}

/**
 * O botão tocado no aviso do celular, como o service worker o põe na URL:
 * `?visit=<id>&answer=done|missed`. Qualquer outra coisa é ignorada.
 */
export function readPushAnswer(params: {
  get(name: string): string | null;
}): PendingPushAnswer | null {
  const visitId = params.get("visit");
  const answer = params.get("answer");
  if (!visitId || (answer !== "done" && answer !== "missed")) return null;
  return { visitId, answer };
}

/**
 * A resposta dada no aviso do celular, entregue UMA vez à visita certa
 * (TASK-006). Os parâmetros saem da URL na hora — recarregar a página não
 * responde de novo —, e a resposta fica guardada até a visita aparecer na tela
 * (a rota pode chegar depois do primeiro desenho). O cartão executa ao montar;
 * logo depois, o efeito daqui a descarta.
 */
export function usePushAnswer(itemIds: string[]): PendingPushAnswer | null {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState<PendingPushAnswer | null>(() =>
    readPushAnswer(searchParams)
  );

  useEffect(() => {
    if (!searchParams.get("answer") && !searchParams.get("visit")) return;
    // A URL do navegador, não a reescrita: o aviso abre `/agenda/<dia>`, que o
    // Next serve como `/agenda?view=day&date=<dia>` — limpar a partir da
    // reescrita trocaria o endereço que a pessoa vê.
    const url = new URL(window.location.href);
    for (const key of PUSH_PARAMS) url.searchParams.delete(key);
    // History API, como o resto da agenda: sem volta ao servidor.
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, [searchParams]);

  const isShown = pending !== null && itemIds.includes(pending.visitId);
  // Os efeitos dos filhos rodam antes: quando isto roda, o cartão já respondeu.
  useEffect(() => {
    if (isShown) setPending(null);
  }, [isShown]);

  return isShown ? pending : null;
}
