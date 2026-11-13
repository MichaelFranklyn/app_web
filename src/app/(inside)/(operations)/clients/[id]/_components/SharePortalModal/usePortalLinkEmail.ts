"use client";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useMutation } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import {
  PORTAL_LINK_CONTACTS_QUERY,
  SEND_CLIENT_PORTAL_LINK_EMAIL_MUTATION,
} from "./gql";
import {
  PortalContact,
  PortalContactsResponse,
  SendClientPortalLinkEmailResponse,
} from "./interface";

const EMPTY_INPUT = {};
const getContacts = (d: PortalContactsResponse) => d.clientContacts;

/**
 * Quem tem email entre os contatos do cliente (o principal primeiro), e o envio
 * do link já emitido para um deles.
 *
 * O envio manda a URL que está na tela, não pede outra: emitir de novo
 * derrubaria o link que talvez já tenha ido pelo WhatsApp. O backend confere
 * que ela ainda é o link vivo deste cliente antes de mandar.
 *
 * A lista só é buscada quando há link para mandar (`enabled`).
 */
export const usePortalLinkEmail = (
  companyClientId: string,
  clientId: string,
  enabled: boolean
) => {
  const { execute, isLoading: isSending } = useAsyncAction();
  const { data, loading } = useCompleteList<PortalContactsResponse>(
    PORTAL_LINK_CONTACTS_QUERY,
    EMPTY_INPUT,
    getContacts,
    {
      skip: !enabled || !clientId,
      extraVariables: { clientId },
      // O contato se cadastra na ficha, outra tela: revalida ao abrir.
      fetchPolicy: "cache-and-network",
    }
  );
  const [sendEmail] = useMutation<SendClientPortalLinkEmailResponse>(
    SEND_CLIENT_PORTAL_LINK_EMAIL_MUTATION
  );

  const targets = useMemo<PortalContact[]>(
    () =>
      (data?.clientContacts?.edges ?? [])
        .map((e) => e.node)
        .filter((c) => c.isActive && !!c.email?.trim())
        .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)),
    [data]
  );

  const send = useCallback(
    async (contactId: string, url: string) => {
      await execute(
        async () => {
          const res = await sendEmail({
            variables: { companyClientId, input: { contactId, url } },
          });
          const payload = res.data?.sendClientPortalLinkEmail;
          if (!payload?.status) {
            throw new Error(payload?.message ?? "Erro ao enviar o email");
          }
          return payload.message;
        },
        {
          successMessage: (message: string) => message,
        }
      );
    },
    [companyClientId, execute, sendEmail]
  );

  return { targets, loading, isSending, send };
};
