"use client";

import { reportError } from "@/utils/errorReporting/report";
import { useEffect } from "react";

/**
 * Escuta o erro que escapou de tudo — o do evento (`onerror`) e a promessa
 * rejeitada sem `catch` — e relata à API (`reportError`). O erro que um
 * `error.tsx` pega NÃO passa por aqui: o React o segura, e o próprio boundary
 * relata (`useReportRouteError`).
 *
 * Fica no layout raiz porque o erro acontece em qualquer tela, inclusive no
 * login e no portal. Não renderiza nada e só faz algo em produção.
 */
export function ErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) =>
      reportError(event.error ?? event.message, "onerror");
    const onRejection = (event: PromiseRejectionEvent) =>
      reportError(event.reason, "unhandledrejection");

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
