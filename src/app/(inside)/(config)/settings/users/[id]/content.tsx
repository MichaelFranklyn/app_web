"use client";

import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { useQuery } from "@apollo/client/react";
import { UserX } from "lucide-react";
import {
  ClientsSection,
  FactoriesSection,
  RoutineSection,
  USER_DETAIL_QUERY,
  UserDetailQueryResponse,
  UserProfileHeader,
  UserProfileSkeleton,
} from "../../../_shared/userProfile";
import { ProfileCards } from "./_components/ProfileCards";
import { UserDetailActions } from "./_components/UserDetailActions";

interface Props {
  userId: string;
}

export default function UserProfileContent({ userId }: Props) {
  const { data, loading, error, refetch } = useQuery<UserDetailQueryResponse>(
    USER_DETAIL_QUERY,
    { variables: { id: userId } }
  );

  const user = data?.user_detail?.data;

  if (loading && !user) {
    // Visão do gestor: tem o rastro "Pessoas › nome" acima do cabeçalho.
    return <UserProfileSkeleton hasBreadcrumb />;
  }

  if (error && !user) {
    return (
      <PageContent>
        <QueryError onRetry={() => refetch()} retrying={loading} />
      </PageContent>
    );
  }

  if (!user) {
    return (
      <PageContent>
        <EmptyState.Root className="max-w-[420px]">
          <EmptyState.Icon>
            <UserX size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Perfil não encontrado</EmptyState.Title>
          <EmptyState.Description>
            A pessoa que você procura não existe mais ou foi removida da
            empresa.
          </EmptyState.Description>
        </EmptyState.Root>
      </PageContent>
    );
  }

  const seller = user.seller;

  return (
    <PageContent>
      <UserProfileHeader
        user={user}
        isSelf={false}
        actions={<UserDetailActions user={user} onRefetch={refetch} />}
      />

      {/* Uma página só, sem abas: cadastro, rotina, fábricas e carteira em
          sequência. Cada bloco tem o seu próprio cabeçalho, então quem abre o
          perfil enxerga a pessoa inteira rolando a tela. */}
      <div className="flex flex-col gap-24" data-tour="user-profile-sections">
        <ProfileCards user={user} onRefetch={refetch} />

        {seller && <RoutineSection seller={seller} onRefetch={refetch} />}
        {seller && <FactoriesSection sellerId={seller.id} />}
        {seller && <ClientsSection sellerId={seller.id} />}
      </div>
    </PageContent>
  );
}
