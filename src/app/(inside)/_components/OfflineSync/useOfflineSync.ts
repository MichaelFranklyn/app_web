"use client";

import { useToast } from "@/components/Toast";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import {
  FLUSH_REQUEST_EVENT,
  flushQueue,
  recordsLabel,
  STALE_AFTER_SEND,
} from "@/services/offlineQueue";
import { sondarServidor } from "@/utils/connectivity";
import { useApolloClient } from "@apollo/client/react";
import { useCallback, useEffect } from "react";

/** De quanto em quanto tempo se tenta de novo enquanto houver algo guardado. */
const RETRY_MS = 30_000;

/**
 * Envia o que ficou guardado no aparelho assim que o servidor responde.
 *
 * Gatilhos: abrir o app, o sistema avisar que a rede voltou (`online`), a
 * pessoa voltar para a aba e, na falta de tudo isso, a cada 30 segundos. O
 * `online` sozinho não basta — ele diz que há interface de rede, não que a
 * internet chega (ver `sondarServidor`). Por isso toda tentativa começa
 * sondando, e uma sondagem que falha custa 4 segundos, não os 10 da gravação.
 *
 * Só roda com algo na fila: sem registro guardado, nenhum timer existe.
 */
export function useOfflineSync(userId: string | null, pendingCount: number) {
  const client = useApolloClient();
  const invalidate = useInvalidateQueriesClient();
  const { toast } = useToast();

  const attempt = useCallback(async () => {
    if (!userId || !(await sondarServidor())) return;
    const { sent } = await flushQueue(client, userId);
    if (sent.length === 0) return;

    // O que chegou agora mudou visita, vínculo e score no servidor — as telas
    // que leram antes seguem com o dado de quando não havia sinal.
    await invalidate([
      ...new Set(sent.flatMap((e) => STALE_AFTER_SEND[e.kind])),
    ]);
    toast({
      variant: "success",
      title: "Sinal de volta",
      description: `${recordsLabel(sent.length)} ${
        sent.length === 1 ? "enviado" : "enviados"
      } para o sistema.`,
    });
  }, [client, invalidate, toast, userId]);

  useEffect(() => {
    if (!userId || pendingCount === 0) return;

    const run = () => void attempt();
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };

    run();
    const timer = window.setInterval(run, RETRY_MS);
    window.addEventListener("online", run);
    window.addEventListener(FLUSH_REQUEST_EVENT, run);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", run);
      window.removeEventListener(FLUSH_REQUEST_EVENT, run);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [attempt, pendingCount, userId]);
}
