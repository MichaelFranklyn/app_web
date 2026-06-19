"use client";

import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { useQuery } from "@apollo/client/react";
import { UserX } from "lucide-react";
import { ME_QUERY } from "./gql";
import { MeQueryResponse } from "./interface";
import { PasswordCard } from "./_components/PasswordCard";
import { ProfileHeader } from "./_components/ProfileHeader";
import { ProfileInfoCard } from "./_components/ProfileInfoCard";

export default function ProfileContent() {
  const { data, loading, refetch } = useQuery<MeQueryResponse>(ME_QUERY);

  const me = data?.me?.data;

  if (loading && !me) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading.Spinner size="md" />
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-32 py-[28px]">
        <EmptyState.Root className="max-w-[420px]">
          <EmptyState.Icon>
            <UserX size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Perfil não encontrado</EmptyState.Title>
          <EmptyState.Description>
            Não foi possível carregar os dados do seu perfil. Recarregue a
            página e tente novamente.
          </EmptyState.Description>
        </EmptyState.Root>
      </div>
    );
  }

  return (
    <PageContent>
      <ProfileHeader profile={me} />

      <div className="flex gap-20">
        <div className="flex min-w-0 flex-1 flex-col gap-12">
          <ProfileInfoCard profile={me} onRefetch={refetch} />
          <PasswordCard />
        </div>
      </div>
    </PageContent>
  );
}
