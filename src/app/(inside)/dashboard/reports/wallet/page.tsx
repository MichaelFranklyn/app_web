import { UserData } from "@/app/(auth)/login/interface";
import { getServerCookie } from "@/utils/cookies/serverCookie";

import { MANAGER_ROLES } from "../utils";
import WalletReportContent from "./content";

export const dynamic = "force-dynamic";

const Page = async () => {
  const userData = await getServerCookie<UserData>("userData");
  const canSelectSeller = MANAGER_ROLES.includes(userData?.role ?? "");

  return <WalletReportContent canSelectSeller={canSelectSeller} />;
};

export default Page;
