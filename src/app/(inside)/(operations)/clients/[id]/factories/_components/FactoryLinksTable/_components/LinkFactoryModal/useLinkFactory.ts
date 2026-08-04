import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useClientFactoryAssignment } from "@/hooks/useClientFactoryAssignment";
import { useUserData } from "@/hooks/useUserData";
import { useMutation } from "@apollo/client/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { CreateSellerClientFactoryResponse } from "../../../../interface";
import { CREATE_SELLER_CLIENT_FACTORY_MUTATION } from "./gql";
import { PRIORITY_OPTIONS } from "../../utils";
import { LinkFactoryModalProps } from "./interface";
import { useLinkFactoryOptions } from "./useLinkFactoryOptions";
import { normalizeLinkFactoryInput } from "./utils";

export function useLinkFactory({
  clientId,
  onSuccess,
  autoOpen,
}: LinkFactoryModalProps) {
  const { isSeller, sellerId } = useUserData();
  const [open, setOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(
    null
  );
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  // Vendedor vincula só a si mesmo: o campo "Vendedor" some e o próprio perfil
  // já fica selecionado, liberando as fábricas com o acesso dele.
  useEffect(() => {
    if (open && isSeller && sellerId) setSelectedSellerId(sellerId);
  }, [open, isSeller, sellerId]);

  const { sellerOptions, factoryOptions, tierOptions } = useLinkFactoryOptions({
    open,
    clientId,
    selectedSellerId,
    selectedFactoryId,
    isSeller,
  });

  const formSteps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "link",
        sections: [
          {
            id: "assignment",
            title: "Vínculo do cliente",
            fields: [
              // Gestor escolhe o vendedor; para o vendedor logado o campo some
              // (ele só vincula a si mesmo — o backend também força isso).
              ...(isSeller
                ? []
                : [
                    {
                      name: "sellerId",
                      type: "select-single" as const,
                      label: "Vendedor",
                      placeholder: "Selecione um vendedor",
                      required: true,
                      options: sellerOptions,
                      onChange: (
                        value: unknown,
                        setValue: (n: string, v: unknown) => void
                      ) => {
                        const selected = value as { value: string } | null;
                        setSelectedSellerId(selected?.value ?? null);
                        setValue("factoryId", null);
                      },
                    },
                  ]),
              {
                name: "factoryId",
                type: "select-single",
                label: "Fábrica",
                placeholder: selectedSellerId
                  ? factoryOptions.length === 0
                    ? "Vendedor sem fábricas disponíveis"
                    : "Selecione uma fábrica"
                  : "Selecione um vendedor primeiro",
                required: true,
                options: factoryOptions,
                onChange: (value, setValue) => {
                  const selected = value as { value: string } | null;
                  setSelectedFactoryId(selected?.value ?? null);
                  setValue("priceTierId", null);
                },
              },
              {
                name: "priceTierId",
                type: "select-single",
                label: "Nível da tabela de preço",
                placeholder: !selectedFactoryId
                  ? "Selecione uma fábrica primeiro"
                  : tierOptions.length === 0
                    ? "Fábrica sem níveis cadastrados"
                    : "Selecione o nível do cliente",
                required: true,
                options: tierOptions,
                hint: "Nível de preço acordado para este cliente nesta fábrica. A importação de pedidos usa este nível como referência para conferir o preço.",
              },
              {
                name: "priority",
                type: "select-single",
                label: "Prioridade",
                placeholder: "Selecione a prioridade",
                options: PRIORITY_OPTIONS,
              },
              {
                name: "visitFrequencyDays",
                type: "number",
                label: "Frequência de visita (dias)",
                placeholder: "Ex: 7",
              },
            ],
          },
        ],
      },
    ],
    [
      sellerOptions,
      factoryOptions,
      selectedSellerId,
      selectedFactoryId,
      tierOptions,
      isSeller,
    ]
  );

  const [linkFactory] = useMutation<CreateSellerClientFactoryResponse>(
    CREATE_SELLER_CLIENT_FACTORY_MUTATION
  );

  // Cada cliente tem UM vendedor por fábrica. Se a fábrica escolhida já é de um
  // colega, salvar não cria um segundo vínculo: transfere o atendimento — e isso
  // precisa ser dito antes, não virar um erro no fim do formulário.
  const effectiveSellerId = isSeller && sellerId ? sellerId : selectedSellerId;
  const { currentSellerName, isTakeover } = useClientFactoryAssignment({
    clientId,
    factoryId: selectedFactoryId,
    sellerId: effectiveSellerId,
    enabled: open,
  });

  // Dados do formulário guardados enquanto o usuário confirma a transferência.
  const [pendingTransfer, setPendingTransfer] = useState<Record<
    string,
    unknown
  > | null>(null);

  const newSellerName =
    sellerOptions.find((opt) => opt.value === effectiveSellerId)?.label ?? null;

  /** Chamada crua da mutation: LANÇA no erro (quem chama decide o feedback). */
  const runLink = async (
    data: Record<string, unknown>,
    transferFromCurrentSeller: boolean
  ) => {
    // Vendedor: o form não tem campo "Vendedor", então injeta o próprio perfil.
    const normalized = normalizeLinkFactoryInput(
      data,
      clientId,
      isSeller && sellerId ? sellerId : undefined
    );

    const res = await linkFactory({
      variables: { input: { ...normalized, transferFromCurrentSeller } },
    });

    if (!res.data?.createSellerClientFactory?.status) {
      throw new Error(
        res.data?.createSellerClientFactory?.message ?? "Erro ao vincular"
      );
    }

    return res.data.createSellerClientFactory.data;
  };

  const finishLink = () => {
    setPendingTransfer(null);
    setOpen(false);
    setSelectedSellerId(null);
    setSelectedFactoryId(null);
    formRef.current?.resetForm();
    onSuccess?.();
  };

  // Tomar a carteira de um colega é decisão de gestor (o backend também barra).
  const canTransfer = !isSeller;

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (isTakeover) {
      if (!canTransfer) return;
      setPendingTransfer(data);
      return;
    }
    await execute(() => runLink(data, false), {
      successMessage: "Vínculo criado com sucesso",
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
    finishLink();
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setSelectedSellerId(null);
      setSelectedFactoryId(null);
      setPendingTransfer(null);
    }
  };

  return {
    open,
    handleOpenChange,
    formRef,
    formSteps,
    handleSubmit,
    isLoading,
    /** A fábrica escolhida já é atendida por outro vendedor. */
    isTakeover,
    canTransfer,
    currentSellerName,
    newSellerName,
    /** Confirmação da transferência aberta (usuário mandou salvar). */
    confirmOpen: pendingTransfer !== null,
    closeConfirm: () => setPendingTransfer(null),
    confirmTransfer,
  };
}
