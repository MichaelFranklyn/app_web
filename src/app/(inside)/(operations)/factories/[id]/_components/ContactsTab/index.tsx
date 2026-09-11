"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { maskPhoneBR } from "@/utils/format/masks";
import { Contact } from "lucide-react";
import { useMemo } from "react";

import { AddContactModal } from "./_components/AddContactModal";
import { DeleteContactModal } from "./_components/DeleteContactModal";
import { EditContactModal } from "./_components/EditContactModal";
import { FACTORY_CONTACTS_QUERY } from "./gql";
import { FactoryContact, FactoryContactsQueryResponse } from "./interface";

// Sem teto fixo: o `useCompleteList` rebusca pelo total se a fábrica tiver mais
// contatos do que coube na primeira página, em vez de esconder o último.
const EMPTY_INPUT = {};
const getContacts = (d: FactoryContactsQueryResponse) => d.factoryContacts;

interface Props {
  factoryId: string;
}

export function ContactsTab({ factoryId }: Props) {
  const { data, loading, error, refetch } =
    useCompleteList<FactoryContactsQueryResponse>(
      FACTORY_CONTACTS_QUERY,
      EMPTY_INPUT,
      getContacts,
      { skip: !factoryId, extraVariables: { factoryId } }
    );

  const initialContacts = useMemo<FactoryContact[]>(
    () => data?.factoryContacts?.edges.map((e) => e.node) ?? [],
    [data]
  );

  const optimistic = useOptimisticList<FactoryContact>({
    initialData: initialContacts,
  });
  const contacts = optimistic.items;

  return (
    <Table.Root data-tour="factory-contacts-table">
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Contatos da fábrica
          <HelpTooltip
            label="Para que servem os contatos?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Contatos da fábrica
                </Title>
                <Title variant="body-sm">
                  Quem atende do lado da fábrica: representante, televendas,
                  financeiro. É daqui que sai o número usado em{" "}
                  <b>Enviar à fábrica</b>, no pedido.
                </Title>
                <Title variant="body-sm" color="muted">
                  Marque um como <b>principal</b> para ele ser o escolhido no
                  envio. Sem nenhum marcado, o pedido vai para o primeiro
                  contato que tiver telefone.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <AddContactModal
            factoryId={factoryId}
            onAddOptimistic={optimistic.addOptimistic}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Contato</Table.Head>
            <Table.Head>Telefone</Table.Head>
            <Table.Head>E-mail</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && contacts.length === 0 ? (
            <Table.Skeleton columns={4} rows={3} />
          ) : error && contacts.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : contacts.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Contact size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum contato cadastrado</EmptyState.Title>
                  <EmptyState.Description>
                    Cadastre quem atende nesta fábrica. Sem um contato com
                    telefone, o pedido não tem para onde ser enviado no
                    WhatsApp.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            contacts.map((contact) => (
              <Table.Row key={contact.id}>
                <Table.Cell>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-6">
                      <Table.CellText variant="strong">
                        {contact.name}
                      </Table.CellText>
                      {contact.isPrimary && (
                        <Badge.Root color="amber" appearance="tinted">
                          <Badge.Text>Principal</Badge.Text>
                        </Badge.Root>
                      )}
                    </div>
                    {contact.role && (
                      <Table.CellText variant="dim">
                        {contact.role}
                      </Table.CellText>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {contact.phone ? maskPhoneBR(contact.phone) : "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {contact.email ?? "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell flex className="justify-end">
                  <EditContactModal
                    contact={contact}
                    onUpdateOptimistic={optimistic.updateOptimistic}
                    onCommit={optimistic.commit}
                    onRollback={optimistic.rollback}
                  />
                  <DeleteContactModal
                    contactId={contact.id}
                    contactName={contact.name}
                    onRemoveOptimistic={optimistic.removeOptimistic}
                    onCommit={optimistic.commit}
                    onRollback={optimistic.rollback}
                  />
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
