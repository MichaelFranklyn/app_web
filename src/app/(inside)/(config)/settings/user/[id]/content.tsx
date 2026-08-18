"use client";

import { EmptyState } from "@/components/EmptyState";
import { FeatureGate } from "@/components/FeatureGate";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { useQuery } from "@apollo/client/react";
import { UserX } from "lucide-react";
import {
  ClientsSection,
  FactoriesSection,
  FixedSchedulesSection,
  RoutineSection,
  USER_DETAIL_QUERY,
  UserDetailQueryResponse,
  UserProfileHeader,
  UserProfileSkeleton,
} from "../../../_shared/userProfile";
import { MyProfileCards } from "./_components/MyProfileCards";

interface Props {
  userId: string;
  canEnableSeller: boolean;
}

export default function MyProfileContent({ userId, canEnableSeller }: Props) {
  const { data, loading, error, refetch } = useQuery<UserDetailQueryResponse>(
    USER_DETAIL_QUERY,
    { variables: { id: userId } }
  );

  const user = data?.user_detail?.data;

  if (loading && !user) {
    return <UserProfileSkeleton />;
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
            Não conseguimos carregar os seus dados. Saia e entre de novo no
            sistema; se continuar assim, fale com o gestor da sua empresa.
          </EmptyState.Description>
        </EmptyState.Root>
      </PageContent>
    );
  }

  const seller = user.seller;

  return (
    <PageContent>
      {/* Sem ações de gestão: ninguém se desativa ou muda o próprio papel. */}
      <UserProfileHeader user={user} isSelf />

      {/* Uma página só, sem abas — igual à visão do gestor: seus dados, sua
          rotina, suas fábricas e sua carteira, em sequência. */}
      <div className="flex flex-col gap-24" data-tour="user-profile-sections">
        <MyProfileCards
          user={user}
          canEnableSeller={canEnableSeller}
          onRefetch={refetch}
        />

        {/* Configuração de rotina e rotas fixas alimentam o motor de
            visita: sem o recurso no plano, não há rotina para configurar. */}
        <FeatureGate feature="ROUTINES">
          {seller && <RoutineSection seller={seller} onRefetch={refetch} />}
          {seller && <FixedSchedulesSection sellerId={seller.id} />}
        </FeatureGate>
        {seller && <FactoriesSection sellerId={seller.id} />}
        {seller && <ClientsSection sellerId={seller.id} />}
      </div>
    </PageContent>
  );
}
