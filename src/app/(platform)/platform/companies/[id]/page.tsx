import { gqlFetch } from "@/services/graphql/gqlFetch";
import { DocumentNode } from "graphql";
import { notFound } from "next/navigation";
import TenantDetailContent from "./content";
import {
  PLATFORM_TENANT_QUERY,
  TENANT_ACTIVITY_QUERY,
  TENANT_ACTIVITY_SUMMARY_QUERY,
  TENANT_AUDIT_QUERY,
  TENANT_USERS_QUERY,
} from "./gql";
import {
  TenantActivityQueryData,
  TenantActivitySummaryQueryData,
  TenantAuditQueryData,
  TenantQueryData,
  TenantUsersQueryData,
} from "./interface";
import { ACTIVITY_LIMIT, AUDIT_LIMIT, USERS_LIMIT } from "./utils";

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchSeed<T>(
  query: DocumentNode,
  variables: Record<string, unknown>
): Promise<T | null> {
  try {
    const { data } = await gqlFetch<T>({ query, variables });
    return data;
  } catch {
    return null;
  }
}

const Page = async ({ params }: Props) => {
  const { id } = await params;

  // As variables precisam bater byte a byte com as do `useTenantDetail`,
  // senão o seed vira cache-miss e o waterfall de rede volta.
  const [tenant, users, audit, activity, activitySummary] = await Promise.all([
    fetchSeed<TenantQueryData>(PLATFORM_TENANT_QUERY, { id }),
    fetchSeed<TenantUsersQueryData>(TENANT_USERS_QUERY, {
      input: {
        first: USERS_LIMIT,
        after: null,
        filters: [{ field: "company_id", value: id }],
      },
    }),
    fetchSeed<TenantAuditQueryData>(TENANT_AUDIT_QUERY, {
      input: {
        first: AUDIT_LIMIT,
        after: null,
        filters: [{ field: "target_company_id", value: id }],
      },
    }),
    fetchSeed<TenantActivityQueryData>(TENANT_ACTIVITY_QUERY, {
      input: {
        first: ACTIVITY_LIMIT,
        after: null,
        filters: [{ field: "company_id", value: id }],
      },
    }),
    fetchSeed<TenantActivitySummaryQueryData>(TENANT_ACTIVITY_SUMMARY_QUERY, {
      companyId: id,
    }),
  ]);

  // Empresa inexistente é 404 de verdade, não uma ficha vazia. O SSR do tenant
  // devolve `null` tanto por erro de rede quanto por não encontrar; só o
  // segundo caso é distinguível aqui — a query volta com `data: null`.
  if (tenant && !tenant.platformTenant?.data) notFound();

  return (
    <TenantDetailContent
      id={id}
      seedTenant={tenant?.platformTenant?.data ? tenant : null}
      seedUsers={users?.tenant_users?.edges?.length ? users : null}
      seedAudit={audit?.tenant_audit?.edges?.length ? audit : null}
      seedActivity={activity?.tenant_activity?.edges?.length ? activity : null}
      seedActivitySummary={
        activitySummary?.platformActivitySummary?.data ? activitySummary : null
      }
    />
  );
};

export default Page;
