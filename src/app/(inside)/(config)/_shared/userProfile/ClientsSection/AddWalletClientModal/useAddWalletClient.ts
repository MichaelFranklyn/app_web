import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useClientFactoryAssignment } from "@/hooks/useClientFactoryAssignment";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useUserData } from "@/hooks/useUserData";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { clientName, factoryName } from "@/utils/company";
import { extractSelectValue } from "@/utils/form";
import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import {
  COMPANY_CLIENTS_QUERY,
  COMPANY_FACTORIES_QUERY,
  CompanyClientsData,
  CompanyFactoriesData,
  CREATE_SELLER_CLIENT_FACTORY_MUTATION,
  CreateSCFResponse,
  ExistingLinksData,
  PRICE_TIERS_QUERY,
  PriceTiersData,
  SELLER_CLIENT_FACTORIES_QUERY,
  SELLER_FACTORY_ACCESSES_QUERY,
  SellerAccessesData,
  WalletClientNode,
} from "./gql";

export interface AddWalletClientProps {
  sellerId: string;
  /** Re-sincroniza a carteira após o vínculo. */
  onAdded: () => void;
}

// Catálogos pequenos carregados por inteiro (ver useCompleteList); a carteira
// de clientes é a única que busca no servidor.
const EMPTY_INPUT = {};
const getAccesses = (d: SellerAccessesData) => d.sellerFactoryAccessList;
const getCompanyFactories = (d: CompanyFactoriesData) => d.companyFactories;
const getLinks = (d: ExistingLinksData) => d.sellerClientFactoryList;
const getTiers = (d: PriceTiersData) => d.priceTiers;
const getCompanyClients = (d: CompanyClientsData) => d.companyClients;
const toClientOption = (node: WalletClientNode) => ({
  value: node.client?.id ?? node.id,
  label: clientName(node.client),
});

export function useAddWalletClient({
  sellerId,
  onAdded,
}: AddWalletClientProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);
  const [selectedFactoryId, setSelectedFactoryId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  // Dados do formulário guardados enquanto o usuário confirma a transferência.
  const [pendingTransfer, setPendingTransfer] = useState<Record<
    string,
    unknown
  > | null>(null);
  const { isSeller } = useUserData();

  const bySeller = useMemo(
    () => ({
      filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
    }),
    [sellerId]
  );

  const { data: accessesData, error: accessesError } =
    useCompleteList<SellerAccessesData>(
      SELLER_FACTORY_ACCESSES_QUERY,
      bySeller,
      getAccesses,
      { skip: !open }
    );

  // A carteira da empresa cresce sem teto: a busca vai ao servidor (o backend
  // traduz `search` em JOIN com `clients`, onde o nome mora). Cabendo tudo na
  // primeira página, o hook devolve `onSearch: undefined` e o select filtra em
  // memória, como antes.
  const {
    nodes: clientNodes,
    loading: loadingClients,
    onSearch: onClientSearch,
  } = useAsyncSelectOptions<CompanyClientsData, WalletClientNode>({
    query: COMPANY_CLIENTS_QUERY,
    getConnection: getCompanyClients,
    toOption: toClientOption,
    searchField: "search",
    first: 50,
    skip: !open,
  });

  const { data: companyFactoriesData, error: companyFactoriesError } =
    useCompleteList<CompanyFactoriesData>(
      COMPANY_FACTORIES_QUERY,
      EMPTY_INPUT,
      getCompanyFactories,
      { skip: !open }
    );

  const { data: linksData, error: linksError } =
    useCompleteList<ExistingLinksData>(
      SELLER_CLIENT_FACTORIES_QUERY,
      bySeller,
      getLinks,
      { skip: !open }
    );

  const companyFactoryId = useMemo(
    () =>
      companyFactoriesData?.companyFactories.edges.find(
        ({ node }) => node.factoryId === selectedFactoryId
      )?.node.id ?? null,
    [companyFactoriesData, selectedFactoryId]
  );

  const byCompanyFactory = useMemo(
    () => ({
      filters: [
        {
          field: "company_factory_id",
          operator: "eq",
          value: companyFactoryId ?? "",
        },
      ],
    }),
    [companyFactoryId]
  );

  const { data: tiersData, error: tiersError } =
    useCompleteList<PriceTiersData>(
      PRICE_TIERS_QUERY,
      byCompanyFactory,
      getTiers,
      { skip: !open || !companyFactoryId }
    );

  const factoryOptions = useMemo(
    () =>
      (accessesData?.sellerFactoryAccessList.edges ?? [])
        .filter(({ node }) => node.isActive && node.factory)
        .map(({ node }) => ({
          value: node.factoryId,
          label: factoryName(node.factory),
        })),
    [accessesData]
  );

  // Clientes já na carteira do vendedor para a fábrica escolhida — excluídos.
  const linkedClientIds = useMemo(
    () =>
      new Set(
        (linksData?.sellerClientFactoryList.edges ?? [])
          .filter(({ node }) => node.factoryId === selectedFactoryId)
          .map(({ node }) => node.clientId)
      ),
    [linksData, selectedFactoryId]
  );

  const clientOptions = useMemo(
    () =>
      clientNodes
        .filter(
          (node) =>
            node.isActive && node.client && !linkedClientIds.has(node.client.id)
        )
        .map((node) => ({
          value: node.client!.id,
          label: clientName(node.client),
        })),
    [clientNodes, linkedClientIds]
  );

  const tierOptions = useMemo(
    () =>
      tiersData?.priceTiers.edges.map(({ node }) => ({
        value: node.id,
        label: node.name,
      })) ?? [],
    [tiersData]
  );

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "link",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "factoryId",
                type: "select-single",
                label: "Fábrica",
                required: true,
                placeholder:
                  factoryOptions.length === 0
                    ? "Dê acesso a uma fábrica primeiro"
                    : "Selecione a fábrica",
                options: factoryOptions,
                onChange: (_value, setValue) => {
                  setSelectedFactoryId(extractSelectValue(_value));
                  setSelectedClientId("");
                  setValue("clientId", null);
                  setValue("priceTierId", null);
                },
              },
              {
                name: "clientId",
                type: "select-single",
                label: "Cliente",
                required: true,
                placeholder: !selectedFactoryId
                  ? "Selecione a fábrica primeiro"
                  : // Com busca no servidor, lista vazia é "nada casa com o
                    // termo", não "a carteira acabou".
                    onClientSearch
                    ? "Busque pelo nome do cliente"
                    : clientOptions.length === 0
                      ? "Nenhum cliente disponível para esta fábrica"
                      : "Selecione o cliente",
                options: clientOptions,
                onSearch: onClientSearch,
                loading: loadingClients,
                onChange: (_value) => {
                  setSelectedClientId(extractSelectValue(_value));
                },
              },
              {
                name: "priceTierId",
                type: "select-single",
                label: "Nível comercial",
                required: true,
                placeholder: !selectedFactoryId
                  ? "Selecione a fábrica primeiro"
                  : "Selecione o nível",
                options: tierOptions,
              },
            ],
          },
        ],
      },
    ],
    [
      factoryOptions,
      clientOptions,
      onClientSearch,
      loadingClients,
      tierOptions,
      selectedFactoryId,
    ]
  );

  const [createLink] = useMutation<CreateSCFResponse>(
    CREATE_SELLER_CLIENT_FACTORY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      formRef.current?.resetForm();
      setSelectedFactoryId("");
      setSelectedClientId("");
      setPendingTransfer(null);
    }
  };

  // O cliente escolhido pode já ser de OUTRO vendedor nesta fábrica: cada par
  // cliente+fábrica tem um responsável só, então salvar seria transferir.
  const { currentSellerName, isTakeover } = useClientFactoryAssignment({
    clientId: selectedClientId || null,
    factoryId: selectedFactoryId || null,
    sellerId,
    enabled: open,
  });
  // Tomar a carteira de um colega é decisão de gestor (o backend também barra).
  const canTransfer = !isSeller;

  /** Chamada crua da mutation: LANÇA no erro (quem chama decide o feedback). */
  const runLink = async (
    data: Record<string, unknown>,
    transferFromCurrentSeller: boolean
  ) => {
    const factoryId = extractSelectValue(data.factoryId);
    const clientId = extractSelectValue(data.clientId);
    const priceTierId = extractSelectValue(data.priceTierId);

    if (!factoryId || !clientId || !priceTierId) {
      throw new Error("Selecione a fábrica, o cliente e o nível.");
    }

    const res = await createLink({
      variables: {
        input: {
          sellerId,
          factoryId,
          clientId,
          priceTierId,
          transferFromCurrentSeller,
        },
      },
    });
    if (!res.data?.createSellerClientFactory?.status) {
      throw new Error(
        res.data?.createSellerClientFactory?.message ??
          "Erro ao adicionar cliente"
      );
    }
    return res.data.createSellerClientFactory;
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (isTakeover) {
      if (!canTransfer) return;
      setPendingTransfer(data);
      return;
    }
    await execute(() => runLink(data, false), {
      successMessage: "Cliente adicionado à carteira",
      onSuccess: () => {
        onAdded();
        handleClose(false);
      },
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
    onAdded();
    handleClose(false);
  };

  useQueryErrorToast(
    accessesError ?? companyFactoriesError ?? linksError ?? tiersError,
    "Não foi possível carregar as opções. Tente novamente."
  );

  return {
    open,
    handleClose,
    formRef,
    steps,
    handleSubmit,
    isLoading,
    /** O cliente escolhido já é atendido por outro vendedor nesta fábrica. */
    isTakeover,
    canTransfer,
    currentSellerName,
    /** Confirmação da transferência aberta (usuário mandou salvar). */
    confirmOpen: pendingTransfer !== null,
    closeConfirm: () => setPendingTransfer(null),
    confirmTransfer,
  };
}
