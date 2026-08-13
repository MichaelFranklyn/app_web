"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { postSession } from "@/utils/auth/session";
import { useState } from "react";

/**
 * Entrar como um usuário, para suporte.
 *
 * Vive no PAI porque as duas fichas do console — a da empresa e a da pessoa —
 * disparam a mesma ação.
 *
 * Recarrega a página de verdade em vez de navegar: a sessão trocou por
 * inteiro, e um `router.push` manteria o cache do Apollo cheio de dados do
 * console dentro de uma sessão que agora é de outra empresa.
 */
export function useImpersonate() {
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const { execute } = useAsyncAction();

  const impersonate = async (userId: string) => {
    setImpersonating(userId);
    await execute(
      () =>
        postSession(
          { action: "impersonate", input: { userId } },
          "Não foi possível iniciar a sessão."
        ),
      {
        onSuccess() {
          window.location.replace("/dashboard");
        },
        onError() {
          setImpersonating(null);
        },
      }
    );
  };

  return { impersonate, impersonating };
}
