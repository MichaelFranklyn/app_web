import { UserData } from "@/app/(auth)/login/interface";
import { getServerCookie } from "@/utils/cookies/serverCookie";

import { MANAGER_ROLES } from "../utils";
import FactoriesReportContent from "./content";

export const dynamic = "force-dynamic";

const Page = async () => {
  const userData = await getServerCookie<UserData>("userData");
  const canSelectSeller = MANAGER_ROLES.includes(userData?.role ?? "");

  return <FactoriesReportContent canSelectSeller={canSelectSeller} />;
};

export default Page;
