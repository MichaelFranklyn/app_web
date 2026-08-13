import { gqlFetch } from "@/services/graphql/gqlFetch";
import PlatformUsersContent from "./content";
import { PLATFORM_USERS_QUERY } from "./gql";
import { UsersQueryData } from "./interface";
import { ITEMS_PER_PAGE } from "./utils";

const Page = async () => {
  let initialData: UsersQueryData | null = null;

  try {
    const { data } = await gqlFetch<UsersQueryData>({
      query: PLATFORM_USERS_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
    });
    initialData = data?.platform_users?.edges?.length ? data : null;
  } catch {
    initialData = null;
  }

  return <PlatformUsersContent initialData={initialData} />;
};

export default Page;
