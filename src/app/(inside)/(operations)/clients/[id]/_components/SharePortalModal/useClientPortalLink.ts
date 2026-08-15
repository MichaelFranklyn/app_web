"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useCallback, useState } from "react";
import {
  CLIENT_PORTAL_LINK_QUERY,
  ISSUE_CLIENT_PORTAL_LINK_MUTATION,
  REVOKE_CLIENT_PORTAL_LINK_MUTATION,
} from "./gql";
import {
  ClientPortalLink,
  ClientPortalLinkQueryResponse,
  IssueClientPortalLinkResponse,
  RevokeClientPortalLinkResponse,
} from "./interface";

/**
 * Estado do link do portal de um cliente.
 *
 * A consulta é preguiçosa de propósito: quase nenhuma abertura da ficha do
 * cliente acaba em compartilhamento, e uma query a mais em toda visita à tela
 * pagaria por um botão que raramente é clicado.
 *
 * `issuedUrl` vive só aqui, na memória da aba. O backend guarda o hash e
 * devolve a URL uma única vez, na emissão — fechar o modal a perde, e é por
 * isso que a tela avisa antes.
 */
export const useClientPortalLink = (companyClientId: string) => {
  const [issuedUrl, setIssuedUrl] = useState<string | null>(null);
  const { execute, isLoading } = useAsyncAction();

  const [fetchLink, { data, loading: isFetching }] =
    useLazyQuery<ClientPortalLinkQueryResponse>(CLIENT_PORTAL_LINK_QUERY, {
      fetchPolicy: "network-only",
    });

  const [issueLink] = useMutation<IssueClientPortalLinkResponse>(
    ISSUE_CLIENT_PORTAL_LINK_MUTATION
  );
  const [revokeLink] = useMutation<RevokeClientPortalLinkResponse>(
    REVOKE_CLIENT_PORTAL_LINK_MUTATION
  );

  const load = useCallback(() => {
    setIssuedUrl(null);
    void fetchLink({ variables: { companyClientId } });
  }, [companyClientId, fetchLink]);

  const issue = useCallback(async () => {
    await execute(
      async () => {
        const res = await issueLink({ variables: { companyClientId } });
        const payload = res.data?.issueClientPortalLink;
        if (!payload?.status || !payload.data?.url) {
          throw new Error(payload?.message ?? "Erro ao gerar o link");
        }
        return payload.data as ClientPortalLink;
      },
      {
        successMessage: "Link gerado",
        onSuccess: (link) => {
          setIssuedUrl(link.url);
          void fetchLink({ variables: { companyClientId } });
        },
      }
    );
  }, [companyClientId, execute, fetchLink, issueLink]);

  const revoke = useCallback(async () => {
    await execute(
      async () => {
        const res = await revokeLink({ variables: { companyClientId } });
        const payload = res.data?.revokeClientPortalLink;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao cancelar o link");
        }
      },
      {
        successMessage: "Link cancelado",
        onSuccess: () => {
          setIssuedUrl(null);
          void fetchLink({ variables: { companyClientId } });
        },
      }
    );
  }, [companyClientId, execute, fetchLink, revokeLink]);

  return {
    activeLink: data?.clientPortalLink?.data ?? null,
    issuedUrl,
    isFetching,
    isLoading,
    load,
    issue,
    revoke,
  };
};
