import { negativeOrderHint } from "@/components/ClientFactoryNegative";
import { FormStepSchema } from "@/components/FormBuilder";
import { extractSelectValue } from "@/utils/form";
import { useQuery } from "@apollo/client/react";
import { useMemo, useState } from "react";

import {
  normalizeInput,
  ORDER_SELLER_FACTORIES_QUERY,
  ORDER_SELLERS_OPTIONS_QUERY,
  useOrderClientOptions,
} from "../_shared/orderCreate";
import {
  coverageHint,
  useCoverageSuggestion,
} from "../../_shared/orderCoverage";
import {
  FIELD_GRID,
  coverageField,
  deliveryField,
  freightField,
  notesField,
  orderDateField,
  orderKindField,
  paymentTermField,
  singleSection,
} from "./fields";
import { NewOrderDetails } from "./interface";
import { NewOrderCore } from "./useNewOrderCore";

interface SellersOptionsData {
  order_sellers_options: { edges: { node: { id: string; name: string } }[] };
}

interface SellerFactoriesData {
  sellerFactoryAccessList: {
    edges: {
      node: {
        factoryId: string;
        factory: {
          id: string;
          nomeFantasia: string | null;
          razaoSocial: string;
        } | null;
      };
    }[];
  };
}

// Vendedores e fábricas por empresa cabem numa página só (dezenas).
const LIST_INPUT = { first: 200 };

export interface SellerChoice {
  /**
   * Gestor (owner/admin/su) escolhe de quem é o pedido. O vendedor não: a query
   * `sellers` é admin-only no backend (403 para ele), e o `createOrder` já
   * força o vendedor do token.
   */
  canSelectSeller: boolean;
  /** Perfil de vendedor de quem está usando a tela — o dono do pedido quando não há escolha. */
  ownSellerId: string | null;
}

/**
 * Novo pedido aberto da lista /orders: nada vem decidido, e o dono do pedido
 * sai da cascata vendedor → fábrica → cliente.
 */
export function useCascadeDetails(
  core: NewOrderCore,
  { canSelectSeller, ownSellerId }: SellerChoice
): NewOrderDetails {
  const { formRef, factoryId, clientId, paymentTermOptions } = core;
  // Sem escolha de vendedor, a cascata já começa no próprio perfil e a
  // fábrica abre destravada.
  const [sellerId, setSellerId] = useState(
    canSelectSeller ? "" : (ownSellerId ?? "")
  );

  const { data: sellersData } = useQuery<SellersOptionsData>(
    ORDER_SELLERS_OPTIONS_QUERY,
    {
      variables: { input: LIST_INPUT },
      skip: !canSelectSeller,
      // Vendedor se cadastra noutra tela.
      fetchPolicy: "cache-and-network",
    }
  );

  const { data: factoriesData } = useQuery<SellerFactoriesData>(
    ORDER_SELLER_FACTORIES_QUERY,
    {
      variables: {
        input: {
          ...LIST_INPUT,
          filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
        },
      },
      skip: !sellerId,
    }
  );

  // Carteira do vendedor naquela fábrica: a única lista que pode passar de uma
  // página, por isso busca no servidor (ver o hook).
  const clients = useOrderClientOptions(true, sellerId, factoryId);

  const sellerOptions = useMemo(
    () =>
      sellersData?.order_sellers_options?.edges?.map(({ node }) => ({
        label: node.name,
        value: node.id,
      })) ?? [],
    [sellersData]
  );

  const factoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    factoriesData?.sellerFactoryAccessList?.edges?.forEach(({ node }) => {
      if (node.factory) {
        map.set(
          node.factoryId,
          node.factory.nomeFantasia ?? node.factory.razaoSocial
        );
      }
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [factoriesData]);

  const cadenceByClient = clients.cadenceByClient;
  // Motivo da negativação do cliente escolhido nesta fábrica, quando há. É o
  // que a dica do campo mostra — e o mesmo que o backend responderia na recusa,
  // só que antes de o vendedor digitar o pedido inteiro.
  const negativeReason = clients.negativeByClient.get(clientId);
  const isClientNegative = clients.negativeByClient.has(clientId);

  useCoverageSuggestion(formRef, cadenceByClient.get(clientId));

  const formSteps: FormStepSchema[] = useMemo(
    () =>
      singleSection([
        orderKindField,
        // Só gestor escolhe o vendedor (ver `canSelectSeller`).
        ...(canSelectSeller
          ? [
              {
                name: "sellerId",
                grid: FIELD_GRID,
                type: "select-single" as const,
                label: "Vendedor",
                placeholder: "Selecione o vendedor",
                required: true,
                options: sellerOptions,
                onChange: (
                  value: unknown,
                  setValue: (n: string, v: unknown) => void
                ) => {
                  setSellerId(extractSelectValue(value));
                  core.setFactoryId("");
                  core.setClientId("");
                  setValue("factoryId", "");
                  setValue("clientId", "");
                  setValue("paymentTermId", "");
                },
              },
            ]
          : []),
        {
          name: "factoryId",
          grid: FIELD_GRID,
          type: "select-single",
          label: "Fábrica",
          placeholder: sellerId
            ? "Selecione a fábrica"
            : "Selecione o vendedor primeiro",
          // Sem vendedor escolhido não há fábrica para listar (as opções saem
          // do acesso DELE); com o vendedor implícito, já abre livre.
          required: true,
          disabled: !sellerId,
          options: factoryOptions,
          onChange: (value, setValue) => {
            core.setFactoryId(extractSelectValue(value));
            core.setClientId("");
            setValue("clientId", "");
            // Condições de pagamento são da fábrica: trocar de fábrica
            // invalida a escolhida.
            setValue("paymentTermId", "");
          },
        },
        {
          name: "clientId",
          grid: FIELD_GRID,
          type: "select-single",
          label: "Cliente",
          placeholder: factoryId
            ? "Selecione o cliente"
            : "Selecione a fábrica primeiro",
          required: true,
          disabled: !factoryId,
          options: clients.options,
          // `onSearch` vem `undefined` quando a carteira coube inteira na
          // primeira página: aí o select filtra em memória, sem latência.
          onSearch: clients.onSearch,
          loading: clients.loading,
          onChange: (value) => core.setClientId(extractSelectValue(value)),
          hint: isClientNegative
            ? negativeOrderHint(negativeReason)
            : undefined,
        },
        orderDateField,
        paymentTermField({
          options: paymentTermOptions,
          pendingPlaceholder: factoryId ? null : "Selecione a fábrica primeiro",
          onChange: core.setPaymentTermId,
        }),
        freightField(core.setFreightType),
        deliveryField,
        coverageField(coverageHint(cadenceByClient.get(clientId))),
        notesField,
      ]),
    // `core` muda a cada render; o que ele contribui para os campos (fábrica,
    // cliente, condições) já está listado abaixo, e os setters que ele passa
    // só mexem em estado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      canSelectSeller,
      sellerOptions,
      factoryOptions,
      clients.options,
      clients.onSearch,
      clients.loading,
      sellerId,
      factoryId,
      paymentTermOptions,
      // A dica do campo de cobertura muda com o cliente escolhido: ela diz de
      // onde veio o número sugerido, e é isso que faz o vendedor corrigi-lo.
      cadenceByClient,
      clientId,
      // A dica da negativação é do cliente escolhido: sem estas duas, o campo
      // ficaria com o aviso do cliente anterior.
      isClientNegative,
      negativeReason,
    ]
  );

  return {
    formSteps,
    toInput: (data) => normalizeInput(data, sellerId),
  };
}
