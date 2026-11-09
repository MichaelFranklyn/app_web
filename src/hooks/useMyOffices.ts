"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import {
  DECLINE_INVITATION_MUTATION,
  MY_COMPANIES_QUERY,
  MyCompaniesData,
  MyOffice,
} from "@/utils/auth/offices";
import { postSession } from "@/utils/auth/session";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

/** Para onde a pessoa vai depois de entrar num escritório. */
const OFFICE_HOME = "/dashboard";

/**
 * Os escritórios da pessoa logada e as ações sobre eles: entrar (trocar a
 * sessão), aceitar convite e recusar convite.
 *
 * Usado pela tela de escolha (depois do login) e pelo seletor da topbar.
 */
export function useMyOffices({ skip = false }: { skip?: boolean } = {}) {
  const { data, loading, error, refetch } = useQuery<MyCompaniesData>(
    MY_COMPANIES_QUERY,
    // Sempre da rede: convite novo chega a qualquer momento, e a lista é curta.
    { skip, fetchPolicy: "cache-and-network" }
  );
  const [declineMutation] = useMutation<{
    declineInvitation: { status: boolean; message: string };
  }>(DECLINE_INVITATION_MUTATION);

  const { execute } = useAsyncAction();
  // Qual escritório está entrando agora, para o loading ficar só no botão dele.
  const [enteringId, setEnteringId] = useState<string | null>(null);

  const offices = data?.myCompanies?.data ?? [];
  const activeOffices = offices.filter((o) => !o.isInvitationPending);
  const invitations = offices.filter((o) => o.isInvitationPending);

  /** Entra no escritório: troca a sessão (ou aceita o convite e já entra). */
  const enter = async (office: MyOffice) => {
    setEnteringId(office.companyId);
    const result = await execute(
      () =>
        postSession(
          {
            action: office.isInvitationPending
              ? "acceptInvitation"
              : "switchCompany",
            input: { companyId: office.companyId },
          },
          "Não foi possível entrar neste escritório."
        ),
      {
        successMessage: office.isInvitationPending
          ? `Convite aceito. Bem-vindo a ${office.companyName}.`
          : undefined,
      }
    );
    if (!result) {
      setEnteringId(null);
      return;
    }
    // Recarga INTEIRA, e não `router.push`: a sessão mudou de escritório, e o
    // cache do Apollo ainda guarda os clientes, pedidos e o plano do outro.
    // O `enteringId` fica de pé de propósito: o botão segue em loading até a
    // página nova carregar.
    window.location.replace(OFFICE_HOME);
  };

  /** Recusa o convite: o vínculo com aquele escritório é apagado. */
  const decline = async (office: MyOffice) => {
    const response = await declineMutation({
      variables: { companyId: office.companyId },
    });
    const payload = response.data?.declineInvitation;
    if (!payload?.status) {
      throw new Error(
        payload?.message ?? "Não foi possível recusar o convite."
      );
    }
    await refetch();
  };

  return {
    offices,
    activeOffices,
    invitations,
    loading: loading && !data,
    error,
    refetch,
    enter,
    enteringId,
    decline,
  };
}
