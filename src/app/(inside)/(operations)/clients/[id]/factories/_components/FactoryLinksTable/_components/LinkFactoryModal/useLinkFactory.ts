import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
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

  const handleSubmit = async (data: Record<string, unknown>) => {
    // Vendedor: o form não tem campo "Vendedor", então injeta o próprio perfil.
    const normalized = normalizeLinkFactoryInput(
      data,
      clientId,
      isSeller && sellerId ? sellerId : undefined
    );

    await execute(
      async () => {
        const res = await linkFactory({
          variables: { input: normalized },
        });

        if (!res.data?.createSellerClientFactory?.status) {
          throw new Error(
            res.data?.createSellerClientFactory?.message ?? "Erro ao vincular"
          );
        }

        return res.data.createSellerClientFactory.data;
      },
      {
        successMessage: "Vínculo criado com sucesso",
        onSuccess: () => {
          setOpen(false);
          setSelectedSellerId(null);
          setSelectedFactoryId(null);
          formRef.current?.resetForm();
          onSuccess?.();
        },
      }
    );
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setSelectedSellerId(null);
      setSelectedFactoryId(null);
    }
  };

  return {
    open,
    handleOpenChange,
    formRef,
    formSteps,
    handleSubmit,
    isLoading,
  };
}
