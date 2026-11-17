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
  ProfileSection,
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
        {seller && (
          <FeatureGate feature="ROUTINES">
            <ProfileSection
              title="Sua rotina"
              description="Como o sistema monta a sua agenda de visitas."
              columns={1}
            >
              <RoutineSection seller={seller} onRefetch={refetch} />
              <FixedSchedulesSection sellerId={seller.id} />
            </ProfileSection>
          </FeatureGate>
        )}

        {/* Sem ações: a comissão e o acesso são combinados por quem gerencia. */}
        {seller && (
          <ProfileSection
            title="Fábricas e clientes"
            description="Com quais fábricas você trabalha e quais clientes atende."
            columns={1}
          >
            <FactoriesSection
              sellerId={seller.id}
              sellerName={seller.name}
              sellerIsActive={seller.isActive}
            />
            <ClientsSection sellerId={seller.id} />
          </ProfileSection>
        )}
      </div>
    </PageContent>
  );
}
