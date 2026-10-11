"use client";

import { FormStepSchema } from "@/components/FormBuilder";
import { SelectOption } from "@/components/Input";
import {
  CREATE_FOLLOW_UP_MUTATION,
  FOLLOW_UP_PEOPLE_QUERY,
  UPDATE_FOLLOW_UP_MUTATION,
} from "@/graphql/followUps";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useUserData } from "@/hooks/useUserData";
import { isAdminRole } from "@/utils/auth/roles";
import { FOLLOW_UP_CACHE_FIELDS } from "@/utils/cacheFields";
import { clientDisplayName } from "@/utils/client";
import { extractSelectValue, selectOption } from "@/utils/form";
import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import {
  FOLLOW_UP_CLIENT_OPTIONS_QUERY,
  FOLLOW_UP_CLIENT_ORDERS_QUERY,
} from "./gql";
import {
  ClientOptionNode,
  ClientOptionsData,
  ClientOrdersData,
  CreateFollowUpResponse,
  FollowUpModalProps,
  PeopleData,
  UpdateFollowUpResponse,
} from "./interface";
import {
  createInput,
  orderLabel,
  REASON_MAX_LENGTH,
  updateInput,
} from "./utils";

/** Quantos pedidos recentes entram no select. */
const RECENT_ORDERS = 20;

type Params = Omit<
  FollowUpModalProps,
  "clientName" | "orderLabel" | "returnLabel"
> & {
  orderLabel?: string;
};

export function useFollowUpForm({
  open,
  onOpenChange,
  followUp,
  clientId,
  orderId,
  orderLabel: fixedOrderLabel,
  returnItemId,
  defaultDueDate,
  onSaved,
}: Params) {
  const isEditing = Boolean(followUp);
  const { userData } = useUserData();
  // `users` é @is_admin no backend: o vendedor nem pergunta — a consulta daria
  // 403 e derrubaria o modal (e ele agenda sempre para si mesmo).
  const canAssign = isAdminRole(userData?.role);

  // O cliente vem da tela (aba do cliente, pedido, edição) ou da escolha da
  // pessoa — e a escolha precisa voltar para cá: os pedidos são DELE.
  const fixedClientId = followUp?.clientId ?? clientId ?? null;
  const [pickedClientId, setPickedClientId] = useState<string | null>(null);
  const effectiveClientId = fixedClientId ?? pickedClientId;
  const fixedOrderId = isEditing ? null : (orderId ?? null);

  const clients = useAsyncSelectOptions<ClientOptionsData, ClientOptionNode>({
    query: FOLLOW_UP_CLIENT_OPTIONS_QUERY,
    getConnection: (data) => data.follow_up_clients,
    toOption: (node) => ({
      value: node.client?.id ?? node.id,
      label: clientDisplayName(node.client),
    }),
    searchField: "search",
    skip: !open || Boolean(fixedClientId),
  });

  const ordersQuery = useQuery<ClientOrdersData>(
    FOLLOW_UP_CLIENT_ORDERS_QUERY,
    {
      variables: {
        input: {
          first: RECENT_ORDERS,
          order: { by: "order_date", dir: "desc" },
          filters: [
            {
              field: "client_id",
              operator: "eq",
              value: effectiveClientId ?? "",
            },
          ],
        },
      },
      skip: !open || !effectiveClientId || Boolean(fixedOrderId),
    }
  );

  const peopleQuery = useQuery<PeopleData>(FOLLOW_UP_PEOPLE_QUERY, {
    variables: { input: { first: 200, order: { by: "name", dir: "asc" } } },
    skip: !open || !canAssign,
  });

  const orderOptions = useMemo<SelectOption[]>(
    () =>
      (ordersQuery.data?.follow_up_orders?.edges ?? []).map(({ node }) => ({
        value: node.id,
        label: orderLabel(node),
      })),
    [ordersQuery.data]
  );

  const peopleOptions = useMemo<SelectOption[]>(
    () =>
      (peopleQuery.data?.follow_up_people?.edges ?? [])
        .filter(({ node }) => node.isActive)
        .map(({ node }) => ({ value: node.id, label: node.name })),
    [peopleQuery.data]
  );

  const steps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "follow-up",
        sections: [
          {
            id: "what",
            fields: [
              ...(fixedClientId
                ? []
                : [
                    {
                      name: "clientId",
                      type: "select-single" as const,
                      label: "Cliente",
                      required: true,
                      placeholder: "Ex: digite o nome do cliente",
                      options: clients.options,
                      onSearch: clients.onSearch,
                      loading: clients.loading,
                      onChange: (value: unknown) =>
                        setPickedClientId(extractSelectValue(value) || null),
                    },
                  ]),
              // O dia só se escolhe ao agendar. Mudar depois é "Reagendar",
              // que guarda a data antiga na linha do tempo.
              ...(isEditing
                ? []
                : [
                    {
                      name: "dueDate",
                      type: "date" as const,
                      label: "Dia do contato",
                      required: true,
                      hint: "No dia, o contato aparece nas Pendências e você recebe um lembrete de manhã.",
                      grid: { mobile: 12, desktop: 6 },
                    },
                  ]),
              ...(canAssign
                ? [
                    {
                      name: "responsibleUserId",
                      type: "select-single" as const,
                      label: "Quem vai fazer o contato",
                      placeholder: "Eu mesmo",
                      hint: isEditing
                        ? "Trocar a pessoa avisa a nova responsável."
                        : "Em branco = você. A pessoa escolhida é avisada.",
                      options: peopleOptions,
                      loading: peopleQuery.loading,
                      grid: { mobile: 12, desktop: 6 },
                    },
                  ]
                : []),
              {
                name: "reason",
                type: "text",
                label: "Motivo do contato",
                required: true,
                maxLength: REASON_MAX_LENGTH,
                placeholder: "Ex: Retornar sobre o orçamento de tintas",
                hint: "Uma frase. É o que aparece na lista e no lembrete.",
                grid: { mobile: 12 },
              },
              ...(fixedOrderId
                ? []
                : [
                    {
                      name: "orderId",
                      type: "select-single" as const,
                      label: "Pedido relacionado (opcional)",
                      placeholder: !effectiveClientId
                        ? "Escolha o cliente primeiro"
                        : orderOptions.length === 0
                          ? "Nenhum pedido recente"
                          : "Escolha o pedido, se houver",
                      hint: "Os 20 pedidos mais recentes deste cliente.",
                      options: orderOptions,
                      grid: { mobile: 12 },
                    },
                  ]),
              {
                name: "notes",
                type: "textarea",
                label: "Observações (opcional)",
                rows: 3,
                placeholder:
                  "Ex: Falar com a Dona Maria, que decide as compras. Ela prefere de manhã.",
                grid: { mobile: 12 },
              },
            ],
          },
        ],
      },
    ],
    [
      fixedClientId,
      isEditing,
      canAssign,
      clients.options,
      clients.onSearch,
      clients.loading,
      peopleOptions,
      peopleQuery.loading,
      fixedOrderId,
      effectiveClientId,
      orderOptions,
    ]
  );

  // Select do FormBuilder só exibe o par `{ value, label }` — ver `selectOption`.
  const initialValues = useMemo<Record<string, unknown>>(() => {
    if (!followUp) return defaultDueDate ? { dueDate: defaultDueDate } : {};
    return {
      reason: followUp.reason,
      notes: followUp.notes ?? "",
      orderId: selectOption(
        followUp.order?.id,
        followUp.order ? orderLabel(followUp.order) : null
      ),
      responsibleUserId: selectOption(
        followUp.responsible?.id,
        followUp.responsible?.name
      ),
    };
  }, [followUp, defaultDueDate]);

  const [createFollowUp] = useMutation<CreateFollowUpResponse>(
    CREATE_FOLLOW_UP_MUTATION
  );
  const [updateFollowUp] = useMutation<UpdateFollowUpResponse>(
    UPDATE_FOLLOW_UP_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const submit = (data: Record<string, unknown>) =>
    execute(
      async () => {
        const payload = followUp
          ? (
              await updateFollowUp({
                variables: {
                  id: followUp.id,
                  input: updateInput(data, canAssign),
                },
              })
            ).data?.updateClientFollowUp
          : (
              await createFollowUp({
                variables: {
                  input: createInput(data, {
                    clientId: fixedClientId,
                    orderId: fixedOrderId,
                    canAssign,
                    returnItemId,
                  }),
                },
              })
            ).data?.createClientFollowUp;
        if (!payload?.status || !payload.data) {
          throw new Error(payload?.message ?? "Erro ao salvar o contato");
        }
        return payload.data;
      },
      {
        successMessage: isEditing ? "Contato atualizado" : "Contato agendado",
        onSuccess: (saved) => {
          onOpenChange(false);
          onSaved?.(saved.id);
          // Entra na lista, nos contadores e — se for desta semana — na
          // central de pendências.
          void invalidateClient(FOLLOW_UP_CACHE_FIELDS);
        },
      }
    );

  return {
    steps,
    initialValues,
    isEditing,
    isLoading,
    submit,
    fixedOrderLabel,
  };
}
