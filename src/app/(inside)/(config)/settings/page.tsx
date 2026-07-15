import { getDecodedTokenServer } from "@/utils/auth/jwt";
import { isAdminRole } from "@/utils/auth/roleGuard";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  // Aba default por papel: gestor cai nos catálogos; vendedor só tem rotina.
  const payload = await getDecodedTokenServer();
  redirect(
    isAdminRole(payload?.role) ? "/settings/catalog" : "/settings/routine"
  );
}
