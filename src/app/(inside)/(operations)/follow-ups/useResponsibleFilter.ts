"use client";

import { FilterField } from "@/components/Filters";
import { FOLLOW_UP_PEOPLE_QUERY } from "@/graphql/followUps";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

interface PeopleData {
  follow_up_people: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
  };
}

/**
 * O filtro "quem vai fazer o contato", só para o gestor.
 *
 * `users` é @is_admin no backend: para o vendedor a consulta nem sai — daria
 * 403, e ele só vê os próprios contatos de qualquer jeito.
 */
export function useResponsibleFilter(canAssign: boolean): FilterField[] {
  const { data, error } = useQuery<PeopleData>(FOLLOW_UP_PEOPLE_QUERY, {
    variables: { input: { first: 200, order: { by: "name", dir: "asc" } } },
    skip: !canAssign,
  });
  useQueryErrorToast(error, "Não foi possível carregar as pessoas.");

  return useMemo(() => {
    if (!canAssign) return [];
    // Os desativados ficam escolhíveis (marcados): é assim que o gestor acha
    // o que a pessoa deixou em aberto ao sair.
    const options = (data?.follow_up_people?.edges ?? []).map(({ node }) => ({
      value: node.id,
      label: node.isActive ? node.name : `${node.name} (desativado)`,
    }));
    return [
      {
        type: "select",
        key: "responsible",
        label: "Quem vai fazer o contato",
        placeholder: "Todas as pessoas",
        options,
      },
    ];
  }, [canAssign, data]);
}
