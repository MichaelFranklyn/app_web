import { useLazyQuery } from "@apollo/client/react";
import { useEffect } from "react";
import { FACTORY_CONTACTS_QUERY } from "../../gql";
import { FactoryContactsResponse } from "./interface";
import { emailContacts, pickFactoryContact } from "./utils";

/**
 * Os contatos da fábrica, já separados pelas duas portas de envio: o destino
 * do WhatsApp (um só, o principal com telefone válido) e a lista de quem tem
 * email (para escolher).
 *
 * A busca acontece só com o modal aberto: o telefone da fábrica não interessa
 * a quem está apenas olhando o pedido.
 */
export function useFactoryContacts(
  factoryId: string | undefined,
  open: boolean
) {
  const [fetchContacts, { data, loading }] =
    useLazyQuery<FactoryContactsResponse>(FACTORY_CONTACTS_QUERY);

  useEffect(() => {
    if (open && factoryId) fetchContacts({ variables: { factoryId } });
  }, [open, factoryId, fetchContacts]);

  const contacts = (data?.factoryContacts?.edges ?? [])
    .map((e) => e.node)
    .filter((c) => c.isActive);

  return {
    loading,
    whatsAppTarget: pickFactoryContact(contacts),
    emailTargets: emailContacts(contacts),
  };
}
