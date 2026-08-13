"use client";

import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useQuery } from "@apollo/client/react";
import { Info, UserPlus } from "lucide-react";
import { useState } from "react";
import { NewStaffModal } from "./_components/NewStaffModal";
import { StaffTable } from "./_components/StaffTable";
import { PLATFORM_STAFF_QUERY } from "./gql";
import { StaffQueryData, TeamContentProps } from "./interface";

/**
 * Quem tem acesso a todas as empresas.
 *
 * A tela existe para ser CONFERIDA de vez em quando, não só para criar contas:
 * é a única lista do sistema em que cada linha enxerga todos os clientes, e uma
 * conta esquecida aqui vale mais que qualquer senha vazada de tenant. Por isso
 * os desativados continuam visíveis e o último acesso fica na tabela.
 */
export default function PlatformTeamContent({ seed }: TeamContentProps) {
  useSeedQuery([{ query: PLATFORM_STAFF_QUERY, data: seed }]);
  const { data, loading, error, refetch } = useQuery<StaffQueryData>(
    PLATFORM_STAFF_QUERY,
    // A lista muda por ação de gente, não por tempo: `cache-and-network` mantém
    // a tela coerente depois de criar ou revogar sem esperar refetch manual.
    { fetchPolicy: "cache-and-network" }
  );
  const [creating, setCreating] = useState(false);

  const staff = data?.platformStaff?.data ?? [];

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow className="text-(--purple)">
              Console
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>Equipe da plataforma</PanelHeader.Title>
            <PanelHeader.Description>
              Quem enxerga todas as empresas. Contas de suporte são criadas e
              revogadas aqui.
            </PanelHeader.Description>

            <PanelHeader.Actions>
              <Button.Root
                appearance="solid"
                color="amber"
                onClick={() => setCreating(true)}
              >
                <Button.Icon icon={UserPlus} />
                <Button.Title>Nova conta de suporte</Button.Title>
              </Button.Root>
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <Alert.Root variant="info">
        <Alert.Icon icon={Info} />
        <Alert.Content>
          <Alert.Title>O que uma conta de suporte pode fazer</Alert.Title>
          <Alert.Description>
            Tudo o que você faz no console — inclusive suspender empresa, trocar
            plano e entrar como usuário de um cliente. O que ela{" "}
            <strong>não</strong> faz é mexer nesta lista: criar ou revogar
            contas da equipe é só seu. Contas de Super Admin continuam saindo
            apenas do comando no servidor.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      {error && staff.length === 0 ? (
        <QueryError onRetry={() => refetch()} />
      ) : loading && staff.length === 0 ? (
        <Loading.Skeleton className="h-[240px] w-full" />
      ) : (
        <StaffTable members={staff} onChanged={() => refetch()} />
      )}

      <NewStaffModal
        open={creating}
        onOpenChange={setCreating}
        onCreated={() => refetch()}
      />
    </PageContent>
  );
}
