"use client";

import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { useQuery } from "@apollo/client/react";
import { CompanyHeader } from "./_components/CompanyHeader";
import { CompanyProfileCard } from "./_components/CompanyProfileCard";
import { MY_COMPANY_QUERY } from "./gql";
import { MyCompanyQueryData } from "./interface";

export default function CompanyContent() {
  const { data, loading, error, refetch } =
    useQuery<MyCompanyQueryData>(MY_COMPANY_QUERY);

  const company = data?.my_company?.data ?? null;

  if (loading && !company) {
    return (
      <PageContent>
        <Loading.Skeleton className="h-[420px]" />
      </PageContent>
    );
  }

  if (error || !company) {
    return (
      <PageContent>
        <QueryError
          onRetry={() => refetch()}
          retrying={loading}
          title="Não foi possível carregar os dados da empresa"
        />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <CompanyHeader company={company} />
      <CompanyProfileCard company={company} onSaved={() => refetch()} />
    </PageContent>
  );
}
