"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  SETUP_PATH,
  markShown,
  readShown,
  shouldRedirectToSetup,
} from "./utils";

/**
 * Abre a configuração inicial sozinha enquanto ela está incompleta: na
 * primeira tela de cada entrada no sistema (aba), a pessoa é levada ao passo a
 * passo. Dali em diante navega livre — o atalho fixo no topo do menu segue
 * lembrando o que falta.
 *
 * Não renderiza nada. Efeito pós-mount porque `sessionStorage` só existe no
 * navegador; o servidor não sabe se esta aba já foi levada.
 */
export function SetupRedirect({
  pending,
  pathname,
}: {
  pending: boolean;
  pathname: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!pending) return;
    const alreadyShown = readShown();
    // Marca mesmo quando já está na tela: quem ABRIU direto a configuração
    // também foi "levado" a ela nesta entrada.
    markShown();
    if (shouldRedirectToSetup({ pending, pathname, alreadyShown })) {
      router.replace(SETUP_PATH);
    }
    // Só na montagem e quando `pending` muda: rodar a cada navegação não
    // muda nada (a marca já está gravada) e só adiciona trabalho.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  return null;
}
