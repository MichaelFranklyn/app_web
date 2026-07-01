"use client";

import { getCookie } from "@/utils/cookies/clientCookie";
import { useEffect, useState } from "react";

interface UserData {
  userId: string;
  userName: string;
  companyName: string;
  role: string;
}

// Role do usuário logado (SU | OWNER | ADMIN | SELLER), lido do cookie userData.
// Cookie só existe no client, então resolve no efeito (null no 1º render/SSR).
export const useUserRole = (): string | null => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userData = getCookie<UserData>("userData");
    setRole(userData?.role ?? null);
  }, []);

  return role;
};
