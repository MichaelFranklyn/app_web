import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useUserData } from "@/hooks/useUserData";
import { extractSelectValue } from "@/utils/form";
import { useMutation, useQuery } from "@apollo/client/react";
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
  CompanyClientsData,
  CreateResponse,
  ExistingLinksData,
  SellersAccessData,
} from "./interface";

export interface LinkClientModalProps {
  factoryId: string;
  companyFactoryId: string;
}

export function useLinkClient({
  factoryId,
  companyFactoryId,
}: LinkClientModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  // Dados do formulário guardados enquanto o usuário confirma a transferência.
  const [pendingTransfer, setPendingTransfer] = useState<Record<
    string,
    unknown
  > | null>(null);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const { execute, isLoading } = useAsyncAction();
  const { isSeller } = useUserData();

  const byFactory = {
    first: 200,
    filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
  };

  const { data: clientsData, error: clientsError } =
    useQuery<CompanyClientsData>(COMPANY_CLIENTS_FOR_LINK_QUERY, {
      variables: { input: { first: 200 } },
      skip: !open,
    });

  const { data: sellersData, error: sellersError } =
    useQuery<SellersAccessData>(SELLERS_WITH_ACCESS_QUERY, {
      variables: { input: byFactory },
      skip: !open,
    });

  const { data: tiersData, error: tiersError } = useQuery<TiersData>(
    PRICE_TIERS_FOR_LINK_QUERY,
    {
      variables: {
        input: {
          first: 200,
          filters: [
            {
              field: "company_factory_id",
              operator: "eq",
              value: companyFactoryId,
            },
          ],
        },
      },
      skip: !open,
    }
  );

  const { data: existingData, error: existingError } =
    useQuery<ExistingLinksData>(EXISTING_LINKS_QUERY, {
      variables: { input: byFactory },
      skip: !open,
    });

  /** Quem atende cada cliente nesta fábrica hoje (um vendedor por cliente). */
  const assignmentByClient = useMemo(() => {
    const map = new Map<string, { sellerId: string; sellerName: string }>();
    for (const { node } of existingData?.sellerClientFactoryList?.edges ?? []) {
      map.set(node.clientId, {
        sellerId: node.sellerId,
        sellerName: node.seller?.name ?? "outro vendedor",
      });
    }
    return map;
  }, [existingData]);

  // Cliente já vinculado continua na lista, com o nome de quem atende: o
  // vendedor pode ter saído da empresa ou deixado de atender esta fábrica, e
  // esconder o cliente deixava a troca impossível pela tela.
  const clientOptions = useMemo(
    () =>
      clientsData?.companyClients?.edges
        ?.filter(({ node }) => node.isActive && node.client)
        .map(({ node }) => {
          const name = node.client!.nomeFantasia || node.client!.razaoSocial;
          const current = assignmentByClient.get(node.client!.id);
          return {
            label: current
              ? `${name} — atendido por ${current.sellerName}`
              : name,
            value: node.client!.id,
          };
        }) ?? [],
    [clientsData, assignmentByClient]
  );

  const sellerOptions = useMemo(
    () =>
      sellersData?.sellerFactoryAccessList?.edges
        ?.filter(({ node }) => node.isActive && node.seller)
        .map(({ node }) => ({
          label: node.seller!.name,
          value: node.seller!.id,
        })) ?? [],
    [sellersData]
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
                placeholder:
                  clientOptions.length === 0
                    ? "Nenhum cliente disponível na carteira"
                    : "Selecione o cliente",
                required: true,
                options: clientOptions,
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
    [clientOptions, sellerOptions, tierOptions]
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
    setPendingTransfer(null);
    setSelectedClientId(null);
    setSelectedSellerId(null);
    setOpen(false);
    formRef.current?.resetForm();
    await invalidateClient(["factory_client_links", "sellerClientFactoryList"]);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (isTakeover) {
      if (!canTransfer) return;
      setPendingTransfer(data);
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
    if (!pendingTransfer) return;
    await runLink(pendingTransfer, true);
    await finishLink();
  };

  useQueryErrorToast(
    clientsError ?? sellersError ?? tiersError ?? existingError,
    "Não foi possível carregar as opções. Tente novamente."
  );

  return {
    open,
    setOpen: (v: boolean) => {
      setOpen(v);
      if (!v) {
        setSelectedClientId(null);
        setSelectedSellerId(null);
        setPendingTransfer(null);
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
    /** Confirmação da transferência aberta (usuário mandou salvar). */
    confirmOpen: pendingTransfer !== null,
    closeConfirm: () => setPendingTransfer(null),
    confirmTransfer,
  };
}
