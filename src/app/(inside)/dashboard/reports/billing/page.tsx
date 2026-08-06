import { UserData } from "@/app/(auth)/login/interface";
import { getServerCookie } from "@/utils/cookies/serverCookie";

import { MANAGER_ROLES } from "../utils";
import BillingReportContent from "./content";

export const dynamic = "force-dynamic";

const Page = async () => {
  // Papel resolvido no servidor, do mesmo cookie `userData` do login: evita o
  // salto de hidratação que apareceria como o seletor de vendedor piscando.
  const userData = await getServerCookie<UserData>("userData");
  const canSelectSeller = MANAGER_ROLES.includes(userData?.role ?? "");

  return <BillingReportContent canSelectSeller={canSelectSeller} />;
};

export default Page;
