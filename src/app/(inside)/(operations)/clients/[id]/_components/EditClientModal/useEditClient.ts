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
 * Edição do que a empresa controla no cliente: o apelido (como vocês o
 * chamam) e a classificação (rede e segmento).
 *
 * Razão social e nome fantasia vêm da Receita e ficam desabilitados — aparecem
 * só para quem edita ter certeza de que está no cliente certo. Nome oficial
 * mudou? "Situação do cliente" → "atualizar pela Receita". E a situação na
 * carteira (encerrar, reativar) saiu daqui: tirar da carteira pede o motivo e
 * cancela visitas, e uma caixa de marcar escondia tudo isso.
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
                hint: "Dado vindo da Receita Federal. Mudou? Use “Situação do cliente” → “atualizar pela Receita”.",
              },
              {
                name: "nickname",
                type: "text",
                label: "Como vocês chamam o cliente (opcional)",
                placeholder: "Ex: Mercadinho do Zé",
                maxLength: 255,
                hint: "Aparece no lugar do nome oficial nas telas da sua empresa. Deixe em branco para usar o nome da Receita.",
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
      nickname: companyClient?.nickname ?? "",
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

    // Em branco = sem apelido (volta o nome oficial). O backend recebe a
    // string vazia e grava nulo.
    const nickname = String(data.nickname ?? "").trim();
    // Select limpo devolve "": vira null, que o backend lê como "saiu da rede"
    // (é o único campo em que null explícito não significa "não enviado").
    const networkId = extractSelectValue(data.networkId) || null;
    const segmentId = extractSelectValue(data.segmentId) || null;

    const unchanged =
      nickname === (companyClient.nickname ?? "") &&
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
        nickname: nickname || null,
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
            input: { nickname, networkId, segmentId },
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
          // `clients` junto: a lista filtra por rede e por segmento e mostra
          // o apelido, que é o que este formulário edita.
          await invalidateClient(["client", "clients"]);
        },
        onError: () => onRollback(),
      }
    );
  };

  return { steps, initialData, handleSubmit, isLoading, open };
}
