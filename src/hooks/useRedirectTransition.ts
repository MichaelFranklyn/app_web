"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

/**
 * Redireciona para outra rota mantendo um estado "pendente" até a rota de
 * destino terminar de carregar.
 *
 * No App Router, uma navegação disparada dentro de `startTransition` mantém o
 * `isPending` verdadeiro enquanto o próximo segmento carrega. Usamos isso para
 * que o loading do botão de um modal só termine quando a tela seguinte já
 * estiver pronta — sem o flash de "concluído" com a próxima página em branco.
 *
 * O modal que dispara o redirect NÃO deve se fechar sozinho: a navegação
 * desmonta a página atual (e o modal junto) quando a rota nova entra. Fechar
 * antes encerraria o loading cedo demais.
 */
export function useRedirectTransition() {
  const router = useRouter();
  const [isRedirecting, startTransition] = useTransition();

  const redirect = useCallback(
    (url: string) => {
      startTransition(() => {
        router.push(url);
      });
    },
    [router]
  );

  return { redirect, isRedirecting };
}
