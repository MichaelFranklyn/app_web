"use client";

import { useMutation } from "@apollo/client/react";
import { useMemo } from "react";

import { FormStepSchema } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { extractSelectValue } from "@/utils/form";

import { useClassificationOptions } from "../../../useClassificationOptions";
import { ClientDetail } from "../../interface";
import { UPDATE_COMPANY_CLIENT_MUTATION } from "./gql";
import { UpdateCompanyClientResponse } from "./interface";

interface Params {
  client: ClientDetail;
  open: boolean;
  onClose: () => void;
  onUpdateOptimistic: (updates: Partial<ClientDetail>) => void;
  onCommit: () => void;
  onRollback: () => void;
}

/**
 * Edição do que a empresa controla no cliente: situação na carteira e
 * classificação (rede e segmento).
 *
 * Razão social e nome fantasia vêm da Receita e ficam desabilitados — aparecem
 * só para quem edita ter certeza de que está no cliente certo.
 */
export function useEditClient({
  client,
  open,
  onClose,
  onUpdateOptimistic,
  onCommit,
  onRollback,
}: Params) {
  const invalidateClient = useInvalidateQueriesClient();
  const [updateCompanyClient] = useMutation<UpdateCompanyClientResponse>(
    UPDATE_COMPANY_CLIENT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const { networkOptions, segmentOptions, loading } =
    useClassificationOptions();

  const companyClient = client.companyClient;

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "client",
        sections: [
          {
            id: "identity",
            title: "Identificação",
            fields: [
              {
                name: "razaoSocial",
                type: "text",
                label: "Razão social",
                disabled: true,
                hint: "Dado vindo da Receita Federal — não pode ser alterado.",
              },
              {
                name: "nomeFantasia",
                type: "text",
                label: "Nome fantasia",
                disabled: true,
                hint: "Dado vindo da Receita Federal — não pode ser alterado.",
              },
              {
                name: "isActive",
                type: "switch",
                label: "Situação na carteira",
                options: [{ value: "true", label: "Cliente ativo" }],
              },
            ],
          },
          {
            id: "classification",
            title: "Classificação",
            fields: [
              {
                name: "networkId",
                type: "select-single",
                label: "Rede (opcional)",
                placeholder:
                  networkOptions.length === 0
                    ? "Nenhuma rede cadastrada"
                    : "Selecione a rede deste cliente",
                options: networkOptions,
                loading,
                disabled: networkOptions.length === 0,
                hint: "Lojas do mesmo grupo. Cadastre as redes em Clientes → Redes.",
              },
              {
                name: "segmentId",
                type: "select-single",
                label: "Segmento (opcional)",
                placeholder:
                  segmentOptions.length === 0
                    ? "Nenhum segmento cadastrado"
                    : "Selecione o ramo de atividade",
                options: segmentOptions,
                loading,
                disabled: segmentOptions.length === 0,
                hint: "Ramo de atividade. Cadastre os segmentos em Configurações → Catálogos.",
              },
            ],
          },
        ],
      },
    ],
    [networkOptions, segmentOptions, loading]
  );

  const initialData = useMemo(
    () => ({
      razaoSocial: client.razaoSocial,
      nomeFantasia: client.nomeFantasia ?? "",
      isActive: companyClient?.isActive ? ["true"] : [],
      networkId: companyClient?.network
        ? {
            value: companyClient.network.id,
            label: companyClient.network.name,
          }
        : null,
      segmentId: companyClient?.segment
        ? {
            value: companyClient.segment.id,
            label: companyClient.segment.name,
          }
        : null,
    }),
    [client, companyClient]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!companyClient) {
      onClose();
      return;
    }

    const isActive =
      Array.isArray(data.isActive) && data.isActive.includes("true");
    // Select limpo devolve "": vira null, que o backend lê como "saiu da rede"
    // (é o único campo em que null explícito não significa "não enviado").
    const networkId = extractSelectValue(data.networkId) || null;
    const segmentId = extractSelectValue(data.segmentId) || null;

    const unchanged =
      isActive === companyClient.isActive &&
      networkId === (companyClient.networkId ?? null) &&
      segmentId === (companyClient.segmentId ?? null);
    if (unchanged) {
      onClose();
      return;
    }

    const network = networkOptions.find((o) => o.value === networkId);
    const segment = segmentOptions.find((o) => o.value === segmentId);

    onClose();
    onUpdateOptimistic({
      companyClient: {
        ...companyClient,
        isActive,
        networkId,
        segmentId,
        network: network ? { id: network.value, name: network.label } : null,
        segment: segment ? { id: segment.value, name: segment.label } : null,
      },
    });

    await execute(
      async () => {
        const res = await updateCompanyClient({
          variables: {
            id: companyClient.id,
            input: { isActive, networkId, segmentId },
          },
        });
        if (!res.data?.updateCompanyClient?.status) {
          throw new Error(
            res.data?.updateCompanyClient?.message ??
              "Erro ao atualizar cliente"
          );
        }
        return res.data.updateCompanyClient.data;
      },
      {
        successMessage: "Cliente atualizado com sucesso",
        onSuccess: async () => {
          onCommit();
          await invalidateClient(["client"]);
        },
        onError: () => onRollback(),
      }
    );
  };

  return { steps, initialData, handleSubmit, isLoading, open };
}
