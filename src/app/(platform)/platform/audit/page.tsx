import { gqlFetch } from "@/services/graphql/gqlFetch";
import PlatformAuditContent from "./content";
import { PLATFORM_AUDIT_QUERY } from "./gql";
import { AuditQueryData } from "./interface";
import { ITEMS_PER_PAGE } from "./utils";

const Page = async () => {
  let initialData: AuditQueryData | null = null;

  try {
    const { data } = await gqlFetch<AuditQueryData>({
      query: PLATFORM_AUDIT_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
    });
    initialData = data?.platform_audit?.edges?.length ? data : null;
  } catch {
    initialData = null;
  }

  return <PlatformAuditContent initialData={initialData} />;
};

export default Page;
