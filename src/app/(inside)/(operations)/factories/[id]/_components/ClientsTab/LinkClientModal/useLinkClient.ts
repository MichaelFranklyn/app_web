import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useAllPages } from "@/hooks/useAllPages";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import { useTakeoverConfirmation } from "@/hooks/useTakeoverConfirmation";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useUserData } from "@/hooks/useUserData";
import { extractSelectValue } from "@/utils/form";
import { useMutation } from "@apollo/client/react";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useMemo, useRef, useState } from "react";

import { PRICE_TIERS_FOR_LINK_QUERY, TiersData } from "../gql";
import { PRIORITY_OPTIONS } from "../utils";
import {
  COMPANY_CLIENTS_FOR_LINK_QUERY,
  CREATE_SELLER_CLIENT_FACTORY_MUTATION,
  EXISTING_LINKS_QUERY,
  SELLERS_WITH_ACCESS_QUERY,
} from "./gql";
import {
  CompanyClientNode,
  CompanyClientsData,
  CreateResponse,
  ExistingLinkNode,
  ExistingLinksData,
  SellerAccessNode,
  SellersAccessData,
} from "./interface";

// Referências estáveis: entram em dependências dos hooks de busca/paginação.
const getCompanyClients = (d: CompanyClientsData) => d.companyClients;
const selectAccesses = (d: SellersAccessData) => d.sellerFactoryAccessList;
const selectExistingLinks = (d: ExistingLinksData) => d.sellerClientFactoryList;
const CLIENT_ORDER = { by: "created_at", dir: "desc" } as const;

export interface LinkClientModalProps {
  factoryId: string;
  companyFactoryId: string;
}

const getTiers = (d: TiersData) => d.priceTiers;

export function useLinkClient({
  factoryId,
  companyFactoryId,
}: LinkClientModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  // O formulário sai de cena enquanto a confirmação está na tela (nunca os dois
  // juntos) e volta com o que estava preenchido se o usuário desistir.
  const {
    draft,
    confirmOpen,
    requestConfirmation,
    cancelConfirmation,
    reset: resetConfirmation,
  } = useTakeoverConfirmation({ setFormOpen: setOpen });
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();
  const { isSeller } = useUserData();

  const byFactory = useMemo(
    () =>
      open
        ? {
            first: 200,
            filters: [
              { field: "factory_id", operator: "eq", value: factoryId },
            ],
          }
        : null,
    [open, factoryId]
  );

  // A carteira de uma empresa passa de 100 clientes e cresce sempre: a busca vai
  // ao servidor (o backend traduz `search` em JOIN com `clients`, onde mora o
  // nome). Se a carteira couber inteira na primeira página, o hook devolve
  // `onSearch: undefined` e o select filtra em memória, como antes.
  const clientScope = useMemo(
    () => [{ field: "is_active", operator: "eq", value: "true" }],
    []
  );

  const {
    nodes: clientNodes,
    loading: loadingClients,
    onSearch: onClientSearch,
  } = useAsyncSelectOptions<CompanyClientsData, CompanyClientNode>({
    query: COMPANY_CLIENTS_FOR_LINK_QUERY,
    getConnection: getCompanyClients,
    toOption: (node) => ({
      value: node.client?.id ?? node.id,
      label: node.client?.nomeFantasia || node.client?.razaoSocial || "Cliente",
    }),
    searchField: "search",
    baseFilters: clientScope,
    order: CLIENT_ORDER,
    first: 50,
    skip: !open,
  });

  // Acesso e vínculo não têm coluna de texto para buscar: aqui a saída é
  // percorrer TODAS as páginas, em vez de torcer para caber numa só.
  const { nodes: accessNodes } = useAllPages<
    SellerAccessNode,
    SellersAccessData
  >(SELLERS_WITH_ACCESS_QUERY, byFactory, selectAccesses);

  // Níveis são poucos por fábrica, mas o teto fixo é o mesmo padrão que já
  // escondeu catálogo: o hook traz a lista inteira e rebusca pelo total se um
  // dia ela passar da primeira página.
  const tiersInput = useMemo(
    () => ({
      filters: [
        {
          field: "company_factory_id",
          operator: "eq",
          value: companyFactoryId,
        },
      ],
    }),
    [companyFactoryId]
  );

  const { data: tiersData, error: tiersError } = useCompleteList<TiersData>(
    PRICE_TIERS_FOR_LINK_QUERY,
    tiersInput,
    getTiers,
    { skip: !open }
  );

  const { nodes: existingLinks } = useAllPages<
    ExistingLinkNode,
    ExistingLinksData
  >(EXISTING_LINKS_QUERY, byFactory, selectExistingLinks);

  /** Quem atende cada cliente nesta fábrica hoje (um vendedor por cliente). */
  const assignmentByClient = useMemo(() => {
    const map = new Map<string, { sellerId: string; sellerName: string }>();
    for (const node of existingLinks) {
      map.set(node.clientId, {
        sellerId: node.sellerId,
        sellerName: node.seller?.name ?? "outro vendedor",
      });
    }
    return map;
  }, [existingLinks]);

  // Cliente já vinculado continua na lista, com o nome de quem atende: o
  // vendedor pode ter saído da empresa ou deixado de atender esta fábrica, e
  // esconder o cliente deixava a troca impossível pela tela.
  const clientOptions = useMemo(
    () =>
      clientNodes
        .filter((node) => node.isActive && node.client)
        .map((node) => {
          const name = node.client!.nomeFantasia || node.client!.razaoSocial;
          const current = assignmentByClient.get(node.client!.id);
          return {
            label: current
              ? `${name} — atendido por ${current.sellerName}`
              : name,
            value: node.client!.id,
          };
        }),
    [clientNodes, assignmentByClient]
  );

  const sellerOptions = useMemo(
    () =>
      accessNodes
        .filter((node) => node.isActive && node.seller)
        .map((node) => ({
          label: node.seller!.name,
          value: node.seller!.id,
        })),
    [accessNodes]
  );

  const tierOptions = useMemo(
    () =>
      tiersData?.priceTiers?.edges?.map(({ node }) => ({
        label: node.name,
        value: node.id,
      })) ?? [],
    [tiersData]
  );

  const formSteps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "link",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "clientId",
                type: "select-single",
                label: "Cliente",
                // Com busca no servidor, lista vazia é "nada casa com o termo",
                // não "a carteira está vazia".
                placeholder: onClientSearch
                  ? "Busque pelo nome do cliente"
                  : clientOptions.length === 0
                    ? "Nenhum cliente disponível na carteira"
                    : "Selecione o cliente",
                required: true,
                options: clientOptions,
                onSearch: onClientSearch,
                loading: loadingClients,
                onChange: (value: unknown) => {
                  const selected = value as { value: string } | null;
                  setSelectedClientId(selected?.value ?? null);
                },
              },
              {
                name: "sellerId",
                type: "select-single",
                label: "Vendedor",
                placeholder:
                  sellerOptions.length === 0
                    ? "Nenhum vendedor com acesso a esta fábrica"
                    : "Selecione o vendedor",
                required: true,
                options: sellerOptions,
                onChange: (value: unknown) => {
                  const selected = value as { value: string } | null;
                  setSelectedSellerId(selected?.value ?? null);
                },
              },
              {
                name: "priceTierId",
                type: "select-single",
                label: "Nível da tabela de preço",
                placeholder:
                  tierOptions.length === 0
                    ? "Fábrica sem níveis cadastrados"
                    : "Selecione o nível do cliente",
                required: true,
                options: tierOptions,
                hint: "Nível de preço acordado com este cliente. A importação de pedidos usa este nível como referência para conferir o preço.",
              },
              {
                name: "priority",
                type: "select-single",
                label: "Prioridade",
                placeholder: "Selecione a prioridade",
                options: PRIORITY_OPTIONS,
              },
            ],
          },
        ],
      },
    ],
    [clientOptions, onClientSearch, loadingClients, sellerOptions, tierOptions]
  );

  const [linkClient] = useMutation<CreateResponse>(
    CREATE_SELLER_CLIENT_FACTORY_MUTATION
  );

  // O cliente escolhido já é de OUTRO vendedor nesta fábrica: salvar transfere
  // o atendimento, e isso é confirmado antes.
  const currentAssignment = selectedClientId
    ? (assignmentByClient.get(selectedClientId) ?? null)
    : null;
  const isTakeover = Boolean(
    currentAssignment &&
    selectedSellerId &&
    currentAssignment.sellerId !== selectedSellerId
  );
  // Tomar a carteira de um colega é decisão de gestor (o backend também barra).
  const canTransfer = !isSeller;

  /** Chamada crua da mutation: LANÇA no erro (quem chama decide o feedback). */
  const runLink = async (
    data: Record<string, unknown>,
    transferFromCurrentSeller: boolean
  ) => {
    const clientId = extractSelectValue(data.clientId);
    const sellerId = extractSelectValue(data.sellerId);
    const priceTierId = extractSelectValue(data.priceTierId);
    const priority = extractSelectValue(data.priority);
    if (!clientId || !sellerId || !priceTierId) return null;

    const input: Record<string, unknown> = {
      clientId,
      sellerId,
      factoryId,
      priceTierId,
      transferFromCurrentSeller,
      ...(priority ? { priority } : {}),
    };

    const res = await linkClient({ variables: { input } });
    if (!res.data?.createSellerClientFactory?.status) {
      throw new Error(
        res.data?.createSellerClientFactory?.message ??
          "Erro ao vincular cliente"
      );
    }
    return res.data.createSellerClientFactory.data;
  };

  const finishLink = async () => {
    resetConfirmation();
    setSelectedClientId(null);
    setSelectedSellerId(null);
    setOpen(false);
    formRef.current?.resetForm();
    await invalidateClient(["sellerClientFactoryList"]);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (isTakeover) {
      if (!canTransfer) return;
      requestConfirmation(data);
      return;
    }
    await execute(() => runLink(data, false), {
      successMessage: "Cliente vinculado com sucesso",
      onSuccess: finishLink,
    });
  };

  /**
   * Confirmou a transferência: reenvia o mesmo formulário autorizando a troca.
   * Sem `execute` aqui — o loading e o toast são do ConfirmModal, e envolver os
   * dois engoliria o erro, fechando a confirmação como se tivesse dado certo.
   */
  const confirmTransfer = async () => {
    if (!draft) return;
    await runLink(draft, true);
    await finishLink();
  };

  useQueryErrorToast(
    tiersError,
    "Não foi possível carregar as opções. Tente novamente."
  );

  return {
    open,
    setOpen: (v: boolean) => {
      setOpen(v);
      if (!v) {
        setSelectedClientId(null);
        setSelectedSellerId(null);
        resetConfirmation();
      }
    },
    formRef,
    formSteps,
    handleSubmit,
    isLoading,
    /** O cliente escolhido já é atendido por outro vendedor nesta fábrica. */
    isTakeover,
    canTransfer,
    currentSellerName: currentAssignment?.sellerName ?? null,
    newSellerName:
      sellerOptions.find((opt) => opt.value === selectedSellerId)?.label ??
      null,
    /** Confirmação da transferência aberta (o formulário está fechado). */
    confirmOpen,
    closeConfirm: cancelConfirmation,
    confirmTransfer,
    /** Rascunho devolvido ao formulário quando ele reabre após um cancelamento. */
    initialData: draft ?? undefined,
  };
}
