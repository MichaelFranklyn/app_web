"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { maskPhoneBR } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { Users } from "lucide-react";
import { useMemo } from "react";
import { AddContactModal } from "./_components/AddContactModal";
import { DeleteContactModal } from "./_components/DeleteContactModal";
import { EditContactModal } from "./_components/EditContactModal";
import { CLIENT_CONTACTS_QUERY } from "./gql";
import {
  ClientContact,
  ClientContactsQueryResponse,
  ContactCardProps,
} from "./interface";

export function ContactCard({ clientId }: ContactCardProps) {
  const { data, loading } = useQuery<ClientContactsQueryResponse>(
    CLIENT_CONTACTS_QUERY,
    {
      variables: { clientId, input: { first: 50 } },
      skip: !clientId,
    }
  );

  const initialContacts = useMemo<ClientContact[]>(
    () => data?.clientContacts?.edges.map((e) => e.node) ?? [],
    [data]
  );

  const optimistic = useOptimisticList<ClientContact>({
    initialData: initialContacts,
  });
  const contacts = optimistic.items;

  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title
          size="sm"
          weight="semibold"
          className="inline-flex items-center gap-6"
        >
          Contatos
          <HelpTooltip
            label="Sobre os contatos"
            content="Pessoas de contato deste cliente (comprador, financeiro etc.). Marque um como principal para destacá-lo."
          />
        </Card.Header.Title>
        <Card.Header.Actions>
          <AddContactModal
            clientId={clientId}
            onAddOptimistic={optimistic.addOptimistic}
          />
        </Card.Header.Actions>
      </Card.Header>
      <Card.Body padding="compact">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loading.Spinner size="sm" />
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState.Root flat>
            <EmptyState.Icon>
              <Users size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhum contato cadastrado</EmptyState.Title>
            <EmptyState.Description>
              Adicione um contato para registrar telefone, e-mail e cargo deste
              cliente.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          contacts.map((contact, idx) => (
            <div
              key={contact.id}
              className={
                idx < contacts.length - 1
                  ? "border-b border-(--border) py-8"
                  : "py-8"
              }
            >
              <div className="flex items-start justify-between gap-8">
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex items-center gap-6">
                    <Title
                      variant="body-sm"
                      weight="semibold"
                      className="truncate"
                    >
                      {contact.name}
                    </Title>
                    {contact.isPrimary && (
                      <Badge.Root color="amber" appearance="tinted">
                        <Badge.Text>Principal</Badge.Text>
                      </Badge.Root>
                    )}
                  </div>
                  {contact.role && (
                    <Title variant="micro" color="muted">
                      {contact.role}
                    </Title>
                  )}
                  {contact.phone && (
                    <Title variant="body-xs" color="secondary">
                      {maskPhoneBR(contact.phone)}
                    </Title>
                  )}
                  {contact.email && (
                    <Title
                      variant="body-xs"
                      color="secondary"
                      className="truncate"
                    >
                      {contact.email}
                    </Title>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <EditContactModal
                    clientId={clientId}
                    contact={contact}
                    onUpdateOptimistic={optimistic.updateOptimistic}
                    onCommit={optimistic.commit}
                    onRollback={optimistic.rollback}
                  />
                  <DeleteContactModal
                    clientId={clientId}
                    contactId={contact.id}
                    contactName={contact.name}
                    onRemoveOptimistic={optimistic.removeOptimistic}
                    onCommit={optimistic.commit}
                    onRollback={optimistic.rollback}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </Card.Body>
    </Card.Root>
  );
}
