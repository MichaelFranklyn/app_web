"use client";

import { useToast } from "@/components/Toast";
import { useEffect, useRef } from "react";

/**
 * Dispara um toast de erro quando uma query GraphQL de segundo plano falha —
 * usado para buscas que alimentam selects/opções em modais, onde um estado de
 * erro em tela cheia não cabe, mas a falha silenciosa (dropdown vazio sem
 * explicação) confunde o usuário.
 *
 * Só notifica na transição para erro (não repete a cada render) e reseta quando
 * a query volta a ter sucesso, permitindo avisar de novo numa falha futura.
 */
export function useQueryErrorToast(
  error: unknown,
  message = "Não foi possível carregar algumas opções. Tente novamente."
) {
  const { toast } = useToast();
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (error && !notifiedRef.current) {
      notifiedRef.current = true;
      toast({
        title: "Erro ao carregar",
        description: message,
        variant: "error",
      });
    }
    if (!error) {
      notifiedRef.current = false;
    }
  }, [error, message, toast]);
}
