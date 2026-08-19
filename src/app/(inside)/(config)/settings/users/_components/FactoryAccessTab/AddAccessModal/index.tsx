"use client";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { factoryName } from "@/utils/company";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useRefetchQueriesClient } from "@/hooks/useInvalidateQueries";
import { useUserData } from "@/hooks/useUserData";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useMutation } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  COMPANY_FACTORIES_OPTIONS_QUERY,
  CREATE_SELLER_FACTORY_ACCESS_MUTATION,
  SELLER_ACCESSES_QUERY,
  SELLERS_OPTIONS_QUERY,
} from "./gql";
import { SellerFactoryAccess } from "../interface";
import { SELLER_FACTORY_ACCESS_LIST_QUERY } from "../gql";
import { SELLER_BASIS_OPTIONS } from "../utils";
import {
  CompanyFactoriesOptionsData,
  CreateAccessResponse,
  SellerAccessesData,
  SellersOptionsData,
} from "./interface";

// Catálogos pequenos carregados por inteiro: `useCompleteList` rebusca pelo
// total se um dia passarem da primeira página, em vez de truncar calado.
const LIST_INPUT = {};
const getSellers = (d: SellersOptionsData) => d.sellers_options;
const getFactories = (d: CompanyFactoriesOptionsData) =>
  d.company_factories_options;
const getAccesses = (d: SellerAccessesData) => d.seller_accesses;

export function AddAccessModal({
  onAddOptimistic,
}: {
  /** Insere a linha na tabela na hora, como o modal de criar pessoa faz. */
  onAddOptimistic: (access: SellerFactoryAccess) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const formRef = useRef<FormBuilderRef>(null);
  // A lista ESTÁ visível: refetch (mantém os dados na tela) em vez de evict, que
  // some com a tabela e recarrega. Além disso o evict por `fieldName` não pegava:
  // o cache guarda o campo REAL (`sellerFactoryAccessList`), não o alias
  // (`seller_factory_access_list`) que a query usa.
  const refetchClient = useRefetchQueriesClient();
  const { userData } = useUserData();

  const { data: sellersData, error: sellersError } =
    useCompleteList<SellersOptionsData>(
      SELLERS_OPTIONS_QUERY,
      LIST_INPUT,
      getSellers,
      { skip: !open }
    );

  const { data: factoriesData, error: factoriesError } =
    useCompleteList<CompanyFactoriesOptionsData>(
      COMPANY_FACTORIES_OPTIONS_QUERY,
      LIST_INPUT,
      getFactories,
      { skip: !open }
    );

  const { data: accessesData, error: accessesError } =
    useCompleteList<SellerAccessesData>(
      SELLER_ACCESSES_QUERY,
      LIST_INPUT,
      getAccesses,
      { skip: !open }
    );

  // Apenas vendedores ativos
  const sellerOptions = useMemo(
    () =>
      sellersData?.sellers_options?.edges
        ?.filter(({ node }) => node.isActive)
        .map(({ node }) => ({ label: node.name, value: node.id })) ?? [],
    [sellersData]
  );

  // Factories já vinculadas (ativas ou inativas) ao vendedor selecionado
  const linkedFactoryIds = useMemo(() => {
    if (!selectedSellerId || !accessesData) return new Set<string>();
    return new Set(
      accessesData.seller_accesses.edges
        .filter(({ node }) => node.sellerId === selectedSellerId)
        .map(({ node }) => node.factoryId)
    );
  }, [selectedSellerId, accessesData]);

  const factoryOptions = useMemo(
    () =>
      factoriesData?.company_factories_options?.edges
        ?.filter(
          ({ node }) =>
            node.factory !== null && !linkedFactoryIds.has(node.factoryId)
        )
        .map(({ node }) => ({
          label: factoryName(node.factory),
          value: node.factoryId,
        })) ?? [],
    [factoriesData, linkedFactoryIds]
  );

  const formSteps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "access",
        sections: [
          {
            id: "link",
            title: "Vínculo",
            fields: [
              {
                name: "seller",
                type: "select-single",
                label: "Vendedor",
                placeholder: "Selecione o vendedor",
                options: sellerOptions,
                required: true,
                onChange: (value, setValue) => {
                  const selected = value as { value: string } | null;
                  setSelectedSellerId(selected?.value ?? null);
                  setValue("factory", null);
                },
              },
              {
                name: "factory",
                type: "select-single",
                label: "Fábrica",
                placeholder: selectedSellerId
                  ? factoryOptions.length === 0
                    ? "Nenhuma fábrica disponível"
                    : "Selecione a fábrica"
                  : "Selecione um vendedor primeiro",
                options: factoryOptions,
                required: true,
              },
            ],
          },
          {
            id: "commission",
            title: "Comissão do vendedor",
            description:
              "Opcional. Em branco, o vendedor fica com a comissão inteira, na mesma base da fábrica.",
            fields: [
              {
                name: "sellerShare",
                type: "number",
                label: "Quanto da comissão fica com o vendedor (%)",
                placeholder: "Ex: 50",
                hint: "Percentual DA COMISSÃO da fábrica, não do valor do pedido.",
              },
              {
                name: "sellerBasis",
                type: "select-single",
                label: "Quando o escritório repassa",
                options: SELLER_BASIS_OPTIONS,
                placeholder: "Igual à fábrica",
              },
            ],
          },
        ],
      },
    ],
    [sellerOptions, factoryOptions, selectedSellerId]
  );

  const [createAccess] = useMutation<CreateAccessResponse>(
    CREATE_SELLER_FACTORY_ACCESS_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const seller = data.seller as { value: string; label: string } | null;
    const factory = data.factory as { value: string; label: string } | null;
    const sellerId = seller?.value;
    const factoryId = factory?.value;
    const rawShare = data.sellerShare;
    const sellerCommissionShare =
      rawShare === "" || rawShare === null || rawShare === undefined
        ? null
        : Number(rawShare);
    const sellerCommissionBasis =
      (data.sellerBasis as { value: string } | null)?.value || null;

    await execute(
      async () => {
        const res = await createAccess({
          variables: {
            input: {
              sellerId,
              factoryId,
              sellerCommissionShare,
              sellerCommissionBasis,
            },
          },
        });

        if (!res.data?.createSellerFactoryAccess?.status) {
          throw new Error(
            res.data?.createSellerFactoryAccess?.message ??
              "Erro ao criar vínculo"
          );
        }

        return res.data.createSellerFactoryAccess;
      },
      {
        successMessage: "Vínculo criado com sucesso",
        onSuccess: async (created) => {
          setOpen(false);
          setSelectedSellerId(null);
          formRef.current?.resetForm();

          // A linha entra com o que a tela já sabe: os rótulos do próprio
          // formulário e quem está concedendo é quem está logado. O refetch em
          // seguida substitui pelo registro do servidor.
          if (created?.data && sellerId && factoryId) {
            onAddOptimistic({
              id: created.data.id,
              isActive: created.data.isActive,
              createdAt: created.data.createdAt,
              sellerCommissionShare,
              sellerCommissionBasis,
              seller: {
                id: sellerId,
                name: seller?.label ?? "",
                isActive: true,
              },
              factory: {
                id: factoryId,
                nomeFantasia: factory?.label ?? null,
                razaoSocial: factory?.label ?? "",
              },
              grantedByUser: userData
                ? { id: userData.userId, name: userData.userName }
                : null,
            });
          }

          refetchClient([SELLER_FACTORY_ACCESS_LIST_QUERY]);
        },
      }
    );
  };

  useQueryErrorToast(
    sellersError ?? factoriesError ?? accessesError,
    "Não foi possível carregar as opções. Tente novamente."
  );

  return (
    <Modal.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSelectedSellerId(null);
      }}
    >
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="sm">
          <Button.Icon icon={Plus} />
          <Button.Title>Novo Vínculo</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Vincular vendedor à fábrica"
          description="Apenas vendedores ativos são exibidos. Fábricas já vinculadas ao vendedor selecionado são ocultadas."
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={formSteps}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close asChild>
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
            >
              <Button.Title>Cancelar</Button.Title>
            </Button.Root>
          </Modal.Close>
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Criar vínculo</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
