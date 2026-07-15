import { UserData } from "@/app/(auth)/login/interface";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import React from "react";
import { SettingsShell } from "./_components/SettingsShell";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Catálogos da empresa é gestão (mutations @is_admin no backend) — vendedor
  // só vê a própria configuração de rotina. Papel lido no SERVER (cookie
  // userData) para a aba nem piscar; a rota /settings/catalog também tem guard.
  const userData = await getServerCookie<UserData>("userData");
  const isSeller = userData?.role === "SELLER";

  return <SettingsShell isSeller={isSeller}>{children}</SettingsShell>;
}
