"use client";

import {
  CREATE_SUPPORT_CASE_MUTATION,
  UPDATE_SUPPORT_CASE_MUTATION,
} from "@/graphql/support";
import { FormStepSchema } from "@/components/FormBuilder";
import { SelectOption } from "@/components/Input";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useQuery } from "@apollo/client/react";
import { useMutation } from "@apollo/client/react";
import { clientDisplayName } from "@/utils/client";
import { factoryName } from "@/utils/company";
import { extractSelectValue, selectOption } from "@/utils/form";
import { formatDate, toIsoDate } from "@/utils/format/date";
import {
  SUPPORT_CATEGORY_LABEL,
  SUPPORT_PRIORITY_LABEL,
  SupportCategory,
  SupportPriority,
} from "@/utils/support";
import { useMemo, useState } from "react";

import {
  SUPPORT_CLIENT_FACTORIES_QUERY,
  SUPPORT_CLIENT_ORDERS_QUERY,
  SUPPORT_CLIENT_OPTIONS_QUERY,
} from "./gql";
import { parseAmount } from "./utils";
import {
  ClientFactoriesData,
  ClientOptionNode,
  ClientOptionsData,
  ClientOrdersData,
  CreateSupportCaseResponse,
  SupportCaseModalProps,
  UpdateSupportCaseResponse,
} from "./interface";

/** Quantos pedidos recentes entram no select — reclamação é sobre nota nova. */
const RECENT_ORDERS = 20;

const toOptions = <T>(
  items: T[],
  read: (item: T) => { value: string; label: string } | null
): SelectOption[] => {
  const seen = new Map<string, string>();
  items.forEach((item) => {
    const entry = read(item);
    if (entry && !seen.has(entry.value)) seen.set(entry.value, entry.label);
  });
  return [...seen.entries()].map(([value, label]) => ({ value, label }));
};

const enumOptions = <T extends string>(labels: Record<T, string>) =>
  (Object.entries(labels) as [T, string][]).map(([value, label]) => ({
    value,
    label,
  }));

const getFactories = (d: ClientFactoriesData) => d.support_client_factories;

/** "12/08/2026 · NF 1234 · Planalto" — o pedido como quem procura o reconhece. */
const orderLabel = (order: {
  orderDate: string;
  invoiceNumber: string | null;
  /** Ausente no pedido já vinculado ao caso: o rótulo sai sem o nome dela. */
  factory?: {
    nickname: string | null;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}): string =>
  [
    formatDate(order.orderDate),
    order.invoiceNumber ? `NF ${order.invoiceNumber}` : null,
    order.factory ? factoryName(order.factory) : null,
  ]
    .filter((part) => part && part !== "—")
    .join(" · ");

type Params = Pick<
  SupportCaseModalProps,
  "open" | "onOpenChange" | "supportCase" | "clientId" | "onSaved"
>;

export function useSupportCaseForm({
  open,
  onOpenChange,
  supportCase,
  clientId,
  onSaved,
}: Params) {
  const isEditing = Boolean(supportCase);
  // No modo edição o cliente é o do caso; na aba do cliente, o que a tela
  // fixou. Na fila do escritório não há nenhum dos dois: quem escolhe é a
  // pessoa, e a escolha precisa VOLTAR para cá — é dela que dependem as
  // opções de fábrica e de pedido, que são do cliente.
  const fixedClientId = supportCase?.clientId ?? clientId ?? null;
  const [pickedClientId, setPickedClientId] = useState<string | null>(null);
  const effectiveClientId = fixedClientId ?? pickedClientId;

  const clients = useAsyncSelectOptions<ClientOptionsData, ClientOptionNode>({
    query: SUPPORT_CLIENT_OPTIONS_QUERY,
    getConnection: (data) => data.support_clients,
    toOption: (node) => ({
      value: node.client?.id ?? node.id,
      label: clientDisplayName(node.client),
    }),
    searchField: "search",
    skip: !open || Boolean(fixedClientId),
  });

  const factoriesInput = useMemo(
    () => ({
      filters: [
        { field: "client_id", operator: "eq", value: effectiveClientId ?? "" },
      ],
    }),
    [effectiveClientId]
  );

  const factoriesQuery = useCompleteList<ClientFactoriesData>(
    SUPPORT_CLIENT_FACTORIES_QUERY,
    factoriesInput,
    getFactories,
    { skip: !open || !effectiveClientId }
  );

  const ordersQuery = useQuery<ClientOrdersData>(SUPPORT_CLIENT_ORDERS_QUERY, {
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
    skip: !open || !effectiveClientId,
  });

  const factoryOptions = useMemo(
    () =>
      toOptions(
        factoriesQuery.data?.support_client_factories.edges.map(
          (e) => e.node
        ) ?? [],
        (node) => ({ value: node.factoryId, label: factoryName(node.factory) })
      ),
    [factoriesQuery.data]
  );

  const orderOptions = useMemo(
    () =>
      toOptions(
        ordersQuery.data?.support_client_orders.edges.map((e) => e.node) ?? [],
        (node) => ({ value: node.id, label: orderLabel(node) })
      ),
    [ordersQuery.data]
  );

  const steps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "case",
        sections: [
          {
            id: "what",
            fields: [
              // O cliente só é perguntado quando a tela não o fixou. Ele vem
              // primeiro porque é dele que dependem fábrica e pedido.
              ...(fixedClientId
                ? []
                : [
                    {
                      name: "clientId",
                      type: "select-single" as const,
                      label: "Cliente",
                      required: true,
                      placeholder: "Buscar cliente",
                      options: clients.options,
                      onSearch: clients.onSearch,
                      loading: clients.loading,
                      // A escolha volta para o hook: fábrica e pedido são
                      // deste cliente, e sem isto os dois selects ficariam
                      // eternamente vazios na fila do escritório.
                      onChange: (value: unknown) =>
                        setPickedClientId(extractSelectValue(value) || null),
                    },
                  ]),
              {
                name: "title",
                type: "text",
                label: "O que aconteceu",
                required: true,
                placeholder: "Ex: Chegaram 3 caixas quebradas",
                hint: "Uma frase curta. Os detalhes vão no campo abaixo.",
                grid: { mobile: 12 },
              },
              {
                name: "category",
                type: "select-single",
                label: "Tipo de problema",
                required: true,
                options: enumOptions<SupportCategory>(SUPPORT_CATEGORY_LABEL),
                grid: { mobile: 12, desktop: 6 },
              },
              {
                name: "priority",
                type: "select-single",
                label: "Urgência",
                required: true,
                options: enumOptions<SupportPriority>(SUPPORT_PRIORITY_LABEL),
                grid: { mobile: 12, desktop: 6 },
              },
              {
                name: "factoryId",
                type: "select-single",
                label: "Fábrica envolvida",
                placeholder: !effectiveClientId
                  ? "Escolha o cliente primeiro"
                  : factoryOptions.length === 0
                    ? "Nenhuma fábrica vinculada"
                    : "Escolher a fábrica",
                hint: "Pode deixar em branco e preencher quando descobrir.",
                options: factoryOptions,
                grid: { mobile: 12, desktop: 6 },
              },
              {
                name: "orderId",
                type: "select-single",
                label: "Pedido relacionado",
                placeholder: !effectiveClientId
                  ? "Escolha o cliente primeiro"
                  : orderOptions.length === 0
                    ? "Nenhum pedido recente"
                    : "Escolher o pedido",
                hint: "Os 20 pedidos mais recentes deste cliente.",
                options: orderOptions,
                grid: { mobile: 12, desktop: 6 },
              },
              {
                name: "reportedAt",
                type: "date",
                label: "Quando o cliente avisou",
                hint: "Em branco = hoje.",
                grid: { mobile: 12, desktop: 6 },
              },
              {
                name: "amount",
                type: "currency",
                label: "Valor envolvido",
                hint: "Só se houver: mercadoria devolvida, boleto contestado.",
                grid: { mobile: 12, desktop: 6 },
              },
              {
                name: "description",
                type: "textarea",
                label: "Detalhes",
                rows: 4,
                placeholder:
                  "O que o cliente contou, com o máximo de detalhe que você tem.",
                grid: { mobile: 12 },
              },
            ],
          },
        ],
      },
    ],
    [
      fixedClientId,
      effectiveClientId,
      clients.options,
      clients.onSearch,
      clients.loading,
      factoryOptions,
      orderOptions,
    ]
  );

  // Select do FormBuilder só exibe o par `{ value, label }`: uma string solta
  // deixa o formulário com o valor certo por dentro e o campo VAZIO na tela
  // (ver `selectOption`) — foi o que aconteceu com "tipo" e "urgência".
  const initialValues = useMemo<Record<string, unknown>>(() => {
    if (!supportCase) {
      return {
        category: selectOption("OTHER", SUPPORT_CATEGORY_LABEL.OTHER),
        priority: selectOption("NORMAL", SUPPORT_PRIORITY_LABEL.NORMAL),
      };
    }
    return {
      title: supportCase.title,
      description: supportCase.description ?? "",
      category: selectOption(
        supportCase.category,
        SUPPORT_CATEGORY_LABEL[supportCase.category]
      ),
      priority: selectOption(
        supportCase.priority,
        SUPPORT_PRIORITY_LABEL[supportCase.priority]
      ),
      factoryId: selectOption(
        supportCase.factory?.id,
        supportCase.factory ? factoryName(supportCase.factory) : null
      ),
      orderId: selectOption(
        supportCase.order?.id,
        supportCase.order ? orderLabel(supportCase.order) : null
      ),
      reportedAt: supportCase.reportedAt,
      amount: supportCase.amount ?? "",
    };
  }, [supportCase]);

  const [createCase] = useMutation<CreateSupportCaseResponse>(
    CREATE_SUPPORT_CASE_MUTATION
  );
  const [updateCase] = useMutation<UpdateSupportCaseResponse>(
    UPDATE_SUPPORT_CASE_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const submit = (data: Record<string, unknown>) =>
    execute(
      async () => {
        // Selects devolvem `{ value, label }`; o backend quer o id/nome do
        // enum. Mandar o objeto cru estourava a mutation inteira.
        const input = {
          title: String(data.title ?? "").trim(),
          description: String(data.description ?? "").trim() || null,
          category: extractSelectValue(data.category) || "OTHER",
          priority: extractSelectValue(data.priority) || "NORMAL",
          factoryId: extractSelectValue(data.factoryId) || null,
          orderId: extractSelectValue(data.orderId) || null,
          amount: parseAmount(data.amount),
          // `toIsoDate` porque o campo de data do FormBuilder não devolve ISO:
          // cortar a string do jeito errado tira um dia da data.
          reportedAt: data.reportedAt ? toIsoDate(data.reportedAt) : null,
        };

        if (supportCase) {
          const res = await updateCase({
            variables: { id: supportCase.id, input },
          });
          const payload = res.data?.updateClientSupportCase;
          if (!payload?.status) {
            throw new Error(payload?.message ?? "Erro ao salvar o atendimento");
          }
          return payload;
        }

        const res = await createCase({
          variables: {
            input: {
              ...input,
              clientId: effectiveClientId ?? extractSelectValue(data.clientId),
            },
          },
        });
        const payload = res.data?.createClientSupportCase;
        if (!payload?.status) {
          throw new Error(
            payload?.message ?? "Erro ao registrar o atendimento"
          );
        }
        return payload;
      },
      {
        successMessage: isEditing
          ? "Atendimento atualizado"
          : "Atendimento registrado",
        onSuccess: () => {
          onOpenChange(false);
          onSaved?.();
        },
      }
    );

  return { steps, initialValues, isEditing, isLoading, submit };
}
