"use client";
import { Emphasis } from "@/components/Emphasis";

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
import { ContactRankBadge } from "./_components/ContactRankBadge";
import { ContactRowActions } from "./_components/ContactRowActions";
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
                <Title variant="label" weight="semibold">
                  Contatos da fábrica
                </Title>
                <Title variant="body-sm">
                  Quem atende do lado da fábrica: representante, televendas,
                  financeiro. É daqui que sai o número usado em{" "}
                  <Emphasis>Enviar à fábrica</Emphasis>, no pedido.
                </Title>
                <Title variant="body-sm" color="muted">
                  Marque um como <Emphasis>principal</Emphasis> para ele ser o
                  escolhido no envio. Sem nenhum marcado, o pedido vai para o
                  primeiro contato que tiver telefone.
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

      {/* Abaixo do desktop cada linha vira cartão, em vez de a tabela rolar de lado. */}
      <Table.Table cards>
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
                <EmptyState.Root flat>
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
                <Table.Cell card="title">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-6">
                      <Table.CellText variant="strong">
                        {contact.name}
                      </Table.CellText>
                      {/* No cartão a tarja vai para a linha das ações (`aside`). */}
                      <ContactRankBadge
                        isPrimary={contact.isPrimary}
                        className="max-desktop:hidden"
                      />
                    </div>
                    {contact.role && (
                      <Table.CellText variant="dim">
                        {contact.role}
                      </Table.CellText>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell label="Telefone">
                  <Table.CellText variant="dim">
                    {contact.phone ? maskPhoneBR(contact.phone) : "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell label="E-mail">
                  <Table.CellText variant="dim">
                    {contact.email ?? "—"}
                  </Table.CellText>
                </Table.Cell>
                {/* No cartão a tarja abre a linha das ações, à esquerda do
                    "⋯" (`aside`). Dentro da célula de ações ela ficava à
                    direita: o modo cartão faz a célula ser bloco e o
                    `mr-auto` não tinha efeito (14/11/2026). No desktop a
                    tarja já está ao lado do nome. */}
                <Table.Cell card="aside" className="desktop:hidden">
                  <ContactRankBadge isPrimary={contact.isPrimary} />
                </Table.Cell>
                <Table.Cell card="actions" flex className="justify-end">
                  <ContactRowActions
                    edit={{
                      contact,
                      onUpdateOptimistic: optimistic.updateOptimistic,
                      onCommit: optimistic.commit,
                      onRollback: optimistic.rollback,
                    }}
                    remove={{
                      contactId: contact.id,
                      contactName: contact.name,
                      onRemoveOptimistic: optimistic.removeOptimistic,
                      onCommit: optimistic.commit,
                      onRollback: optimistic.rollback,
                    }}
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
