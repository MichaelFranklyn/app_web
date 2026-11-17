"use client";

import { UserData } from "@/app/(auth)/login/interface";
import { getCookie } from "@/utils/cookies/clientCookie";
import { useEffect, useState } from "react";

/**
 * Quem está logado olhando o site público, ou `null` para visitante.
 *
 * As páginas de `(marketing)` são estáticas e servidas do CDN: o servidor não
 * sabe quem está olhando, então isto é lido do cookie `userData` (legível pelo
 * navegador) no cliente.
 *
 * TRAP — devolve `null` no primeiro render, sempre, igual ao HTML do CDN; o
 * usuário só aparece depois de montar. Ler o cookie direto no render dava
 * mismatch de hidratação. Um `userData` velho (token vencido) é inofensivo:
 * quem usa isto só troca texto e links, e o `proxy` manda ao login se preciso.
 */
export function useSignedInUser(): UserData | null {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    setUser(getCookie<UserData>("userData"));
  }, []);

  return user;
}
