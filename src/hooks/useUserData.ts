"use client";

import { UserData } from "@/app/(auth)/login/interface";
import { getCookie } from "@/utils/cookies/clientCookie";
import { useEffect, useState } from "react";

/**
 * Dados do usuário logado (cookie `userData` gravado no login) para uso em
 * client components — papel, nome e perfil de vendedor vinculado.
 *
 * Lido em useEffect para evitar mismatch de hidratação: no primeiro render
 * `userData` é null; UI condicionada a papel deve tratar esse estado (em
 * geral, esconder a ação até saber o papel).
 *
 * Isto é só UX — a autorização real é o backend (@is_admin/escopos por token).
 */
export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    setUserData(getCookie<UserData>("userData"));
  }, []);

  return {
    userData,
    isSeller: userData?.role === "SELLER",
    /** Perfil de vendedor vinculado (existe também para owner/admin que vendem). */
    sellerId: userData?.sellerId ?? null,
  };
}
