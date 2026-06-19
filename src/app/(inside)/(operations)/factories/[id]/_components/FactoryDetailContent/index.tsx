import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { executeServerQueries } from "@/services/graphql/getDataServer";
import { Factory } from "lucide-react";
import { ReactNode } from "react";
import { revalidateFactoryDetail } from "../../actions";
import { COMPANY_FACTORY_DETAIL_QUERY } from "../../gql";
import { CompanyFactoryDetail } from "../../interface";
import { FactoryDetailShell } from "../FactoryDetailShell";

interface QueryResult {
  company_factory_detail: CompanyFactoryDetail | null;
}

interface Props {
  id: string;
  children: ReactNode;
}

export async function FactoryDetailContent({ id, children }: Props) {
  const { company_factory_detail: cf } =
    await executeServerQueries<QueryResult>({
      company_factory_detail: {
        query: COMPANY_FACTORY_DETAIL_QUERY,
        variables: { id },
        cache: { tags: [`company_factory:${id}`] },
      },
    });

  if (!cf) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-32 py-[28px]">
        <EmptyState.Root className="max-w-105">
          <EmptyState.Icon>
            <Factory size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Fábrica não encontrada</EmptyState.Title>
          <EmptyState.Description>
            A fábrica que você procura não existe ou não está vinculada à sua
            empresa.
          </EmptyState.Description>
        </EmptyState.Root>
      </div>
    );
  }

  const basePath = `/factories/${id}`;

  const onRefetch = async () => {
    "use server";
    await revalidateFactoryDetail(id);
  };

  return (
    <PageContent>
      <FactoryDetailShell
        companyFactory={cf}
        basePath={basePath}
        onRefetch={onRefetch}
      >
        {children}
      </FactoryDetailShell>
    </PageContent>
  );
}
