"use client";

import { SelectOption } from "@/components/Input";
import { useUserData } from "@/hooks/useUserData";
import { isAdminRole } from "@/utils/auth/roles";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { SCHEDULE_PEOPLE_QUERY } from "./gql";
import { AgendaOwner, PeopleQueryResponse } from "./interface";

interface Params {
  open: boolean;
  /** Agenda fixada pela tela (a rotina aberta, a agenda do escritório). */
  fixedOwner: AgendaOwner | null;
  fixedSellerId: string | null;
  /** A escolha do gestor; nulo = ainda não mexeu. */
  pickedId: string | null;
  /** Vendedores que atendem o cliente fixado — só eles podem receber a visita. */
  clientSellerIds: string[] | null;
}

/**
 * De quem é a agenda que recebe a parada.
 *
 * Fixa quando a tela já diz (a rotina aberta); o vendedor logado marca sempre
 * na própria; o gestor escolhe — e a escolha vem antes do cliente, porque é
 * ela que recorta a lista de clientes (a carteira de quem vai fazer).
 */
export function useAgendaOwner({
  open,
  fixedOwner,
  fixedSellerId,
  pickedId,
  clientSellerIds,
}: Params) {
  const { userData } = useUserData();
  const isFixed = Boolean(fixedOwner || fixedSellerId);
  // `users` é @is_admin no backend: o vendedor nem pergunta (daria 403).
  const canChoose = isAdminRole(userData?.role) && !isFixed;

  const peopleQuery = useQuery<PeopleQueryResponse>(SCHEDULE_PEOPLE_QUERY, {
    variables: { input: { first: 200, order: { by: "name", dir: "asc" } } },
    skip: !open || !canChoose,
  });

  const people = useMemo<AgendaOwner[]>(() => {
    const active = (peopleQuery.data?.schedule_people?.edges ?? [])
      .map(({ node }) => node)
      .filter((node) => node.isActive)
      .map((node) => ({
        id: node.id,
        name: node.name,
        sellerId: node.seller?.id ?? null,
      }));
    // Com o cliente fixado, só quem o atende (ou quem não vende: o escritório
    // liga para qualquer cliente). Quem vende vem antes — é quem tem rota.
    const allowed = clientSellerIds
      ? active.filter(
          (p) => !p.sellerId || clientSellerIds.includes(p.sellerId)
        )
      : active;
    return [
      ...allowed.filter((p) => p.sellerId),
      ...allowed.filter((p) => !p.sellerId),
    ];
  }, [peopleQuery.data, clientSellerIds]);

  const options = useMemo<SelectOption[]>(
    () =>
      people.map((p) => ({
        value: p.id,
        label: p.sellerId ? p.name : `${p.name} (escritório)`,
      })),
    [people]
  );

  // Sem escolha: quem atende o cliente, se for um só; senão, quem marca.
  const fallbackId =
    clientSellerIds?.length === 1
      ? (people.find((p) => p.sellerId === clientSellerIds[0])?.id ?? null)
      : (userData?.userId ?? null);
  const chosen = canChoose
    ? (people.find((p) => p.id === (pickedId ?? fallbackId)) ?? null)
    : null;

  // Enquanto as pessoas carregam, o gestor ainda não tem agenda escolhida —
  // cair na dele esconderia a visita por um instante, se ele não vende.
  const owner: AgendaOwner | null = canChoose
    ? chosen
    : (fixedOwner ??
      (fixedSellerId ? { id: "", name: "", sellerId: fixedSellerId } : null) ??
      (userData
        ? {
            id: userData.userId,
            name: userData.userName,
            sellerId: userData.sellerId ?? null,
          }
        : null));

  return {
    owner,
    canChoose,
    options,
    loading: peopleQuery.loading,
    /** Quem não vende só recebe ligação: visita é deslocamento de rota. */
    callsOnly: Boolean(owner && !owner.sellerId),
  };
}
