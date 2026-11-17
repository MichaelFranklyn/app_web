"use client";

import { type ErrorSource, reportError } from "@/utils/errorReporting/report";
import { useEffect } from "react";

/**
 * Relata o erro que um `error.tsx` pegou. O boundary segura o erro antes do
 * `window.onerror`, então sem isto a tela de "algo deu errado" aparece para o
 * usuário e ninguém fica sabendo.
 *
 * O `digest` é o do erro de renderização no servidor: no navegador a mensagem
 * vem genérica, e é por ele que se acha a pilha no log da Vercel.
 */
export function useReportRouteError(
  error: Error & { digest?: string },
  source: Extract<ErrorSource, "boundary" | "global-boundary"> = "boundary"
): void {
  useEffect(() => {
    reportError(error, source, error.digest);
  }, [error, source]);
}
