import { UserData } from "@/app/(auth)/login/interface";
import { FOLLOW_UPS_QUERY } from "@/graphql/followUps";
import { executeServerQueries } from "@/services/graphql/getDataServer";
import { isAdminRole } from "@/utils/auth/roles";
import { getServerCookie } from "@/utils/cookies/serverCookie";

import FollowUpsContent from "./content";
import { FollowUpsData } from "./interface";
import { ITEMS_PER_PAGE } from "./utils";

/**
 * Os contatos agendados (follow-up). Sem guard de papel: o vendedor vê os
 * dele (o recorte é no resolver), o gestor vê a empresa e filtra por pessoa.
 */
const Page = async () => {
  const userData = await getServerCookie<UserData>("userData");

  // 1ª página no shape da própria query → semeia o cache do Apollo. Sem
  // filtro e sem ordem: as variables precisam bater byte a byte com as do
  // estado inicial do `useTableData` (o backend já ordena pelo dia).
  const data = await executeServerQueries<FollowUpsData>({
    follow_ups: {
      query: FOLLOW_UPS_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
      cache: { tags: ["client_follow_ups"] },
    },
  });

  return (
    <FollowUpsContent
      initialData={data}
      canAssign={isAdminRole(userData?.role)}
    />
  );
};

export default Page;
