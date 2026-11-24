import { FormBuilderRef } from "@/components/FormBuilder";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { isConnectivityError } from "@/services/offlineQueue";
import { isOnLeaveSentinel } from "@/hooks/useLeaveGuard";
import { useRedirectTransition } from "@/hooks/useRedirectTransition";
import {
  ORDER_CACHE_FIELDS,
  ORDER_ITEM_EVIDENCE_CACHE_FIELDS,
} from "@/utils/cacheFields";
import { DELETE_ORDER_MUTATION } from "@/graphql/orders";
import { useMutation } from "@apollo/client/react";
import { useRef, useState } from "react";

import {
  CREATE_ORDER_MUTATION,
  CreateOrderInput,
  CreateOrderResponse,
} from "../_shared/orderCreate";
import {
  CREATE_ORDER_ITEMS_MUTATION,
  CreateOrderItemsResponse,
  createDraftItems,
  useOrderDraftItems,
} from "../../_shared/orderDraftItems";
import { usePaymentTermOptions } from "../../_shared/orderPaymentTerms";
import { useFreeFreightTarget } from "../../_shared/orderFreight";
import { useDraftBackup } from "./useDraftBackup";
import { useSuggestedPaymentTerm } from "./useSuggestedPaymentTerm";

/**
 * O que a página de novo pedido faz igual em qualquer origem (lista, cliente,
 * fábrica): guarda a fábrica e o cliente escolhidos, mantém o rascunho de
 * itens, as condições e o frete da fábrica, e grava — cria o pedido, depois
 * os itens num lote só (tudo ou nada), e entra no pedido criado.
 *
 * O "de quem é o pedido" (a cascata, ou o vínculo) fica com cada origem, que
 * recebe este núcleo e chama `setFactoryId`/`setClientId` conforme escolhe.
 */
interface Fixed {
  /** Fábrica já decidida pela origem (pedido aberto a partir da fábrica). */
  factoryId?: string;
  /** Cliente já decidido pela origem (pedido aberto a partir do cliente). */
  clientId?: string;
}

export function useNewOrderCore(fixed: Fixed = {}) {
  const formRef = useRef<FormBuilderRef>(null);
  // Sai para o pedido criado: invalidar (evict) deixa as listas prontas para a
  // volta, e marca o campo para o seed do SSR não ressuscitar a lista antiga.
  const invalidateClient = useInvalidateQueriesClient();
  const { redirect, isRedirecting } = useRedirectTransition();
  const { toast } = useToast();

  const [factoryId, setFactoryIdState] = useState(fixed.factoryId ?? "");
  // O cliente também é estado (não só campo do form) porque os itens usam o
  // nível acordado com ele para sugerir o preço.
  const [clientId, setClientId] = useState(fixed.clientId ?? "");
  // Condição e frete também: os avisos de piso aparecem junto dos itens, que
  // estão na mesma tela — não dá para esperar o formulário ser enviado.
  const [paymentTermId, setPaymentTermId] = useState("");
  const [freightType, setFreightType] = useState("");

  const draft = useOrderDraftItems(true, factoryId, clientId);
  // Os itens também ficam no aparelho até o pedido ser criado: sem sinal, o
  // pedido não é criado (nem guardado para depois), mas o trabalho não se perde.
  const backup = useDraftBackup(draft, factoryId, clientId);
  const {
    options: paymentTermOptions,
    minimumOf,
    suggestedId: suggestedPaymentTermId,
  } = usePaymentTermOptions(true, factoryId || null, draft.linkedTierId);
  useSuggestedPaymentTerm({
    formRef,
    clientId,
    factoryId,
    suggestedId: suggestedPaymentTermId,
    options: paymentTermOptions,
    paymentTermId,
    setPaymentTermId,
  });
  const paymentMinimum = minimumOf(paymentTermId || null);
  // Piso de frete grátis da modalidade escolhida — incentivo, nunca bloqueio.
  const freeFreight = useFreeFreightTarget(
    true,
    factoryId || null,
    freightType || null
  );

  // Os itens são produtos DA fábrica, e a condição de pagamento também é dela:
  // trocar de fábrica invalida os dois. (O `reset` do rascunho só mexe em
  // setters, então chamá-lo de um closure antigo é seguro.)
  const setFactoryId = (id: string) => {
    if (id === factoryId) return;
    draft.reset();
    setPaymentTermId("");
    setFactoryIdState(id);
  };

  const [createOrder] = useMutation<CreateOrderResponse>(CREATE_ORDER_MUTATION);
  const [createOrderItems] = useMutation<CreateOrderItemsResponse>(
    CREATE_ORDER_ITEMS_MUTATION
  );
  // Só para desfazer o pedido vazio quando o lote de itens é recusado.
  const [deleteOrder] = useMutation<{ deleteOrder: { status: boolean } }>(
    DELETE_ORDER_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // Cria o pedido e, em seguida, os itens do rascunho.
  const create = async (input: CreateOrderInput) => {
    // Pedido sem item não existe: o "Criar pedido" pede a lista antes.
    if (draft.items.length === 0) {
      toast({
        variant: "error",
        title: "Adicione ao menos um item",
        description: draft.hasPendingItem
          ? "O produto escolhido ainda não está na lista: toque em “Adicionar item”."
          : "Escolha o produto e a quantidade e toque em “Adicionar item”.",
      });
      return;
    }
    await execute(
      async () => {
        const res = await createOrder({ variables: { input } }).catch(
          (error: unknown) => {
            // Sem sinal o toast cru seria "Failed to fetch". O pedido NÃO vai
            // para a fila (preço e piso seriam gravados sem conferência), mas
            // a tela e a cópia no aparelho seguram o que foi digitado.
            if (isConnectivityError(error)) {
              throw new Error(
                "Sem sinal: o pedido não foi criado. O que você preencheu continua aqui e guardado no aparelho — toque em “Criar pedido” quando o sinal voltar."
              );
            }
            throw error;
          }
        );
        if (!res.data?.createOrder?.status || !res.data.createOrder.data) {
          throw new Error(
            res.data?.createOrder?.message ?? "Erro ao criar pedido"
          );
        }
        const order = res.data.createOrder.data;

        // Itens são gravados após o pedido existir (o backend não os aceita no
        // CreateOrderInput), num lote que é tudo ou nada. Recusado o lote, o
        // pedido ficaria vazio: apagamos e o vendedor segue aqui, com o
        // rascunho intacto e a mensagem dizendo qual item travou.
        try {
          await createDraftItems(createOrderItems, order.id, draft.items);
        } catch (error) {
          const removed = await deleteOrder({ variables: { id: order.id } })
            .then((r) => Boolean(r.data?.deleteOrder?.status))
            .catch(() => false);
          if (!removed) {
            // Raro (sem sinal no meio do caminho): o pedido existe, sem itens.
            // Dizer isso evita que o vendedor crie um segundo pedido igual.
            throw new Error(
              "Os itens não foram gravados e o pedido ficou criado sem itens. Abra-o na lista de pedidos para completar ou excluir."
            );
          }
          if (isConnectivityError(error)) {
            throw new Error(
              "Sem sinal: o pedido não foi criado. O que você preencheu continua aqui e guardado no aparelho — toque em “Criar pedido” quando o sinal voltar."
            );
          }
          throw error;
        }
        return { order };
      },
      {
        successMessage: "Pedido criado com sucesso",
        onSuccess: async ({ order }) => {
          backup.clear();
          // Item gravado é a prova de que a visita aconteceu: o backend fecha
          // a visita pendente do cliente no primeiro item. Sem itens, só o
          // pedido mudou.
          await invalidateClient(
            draft.items.length > 0
              ? ORDER_ITEM_EVIDENCE_CACHE_FIELDS
              : ORDER_CACHE_FIELDS
          );
          // O botão segue em loading até o pedido novo carregar: é a
          // navegação que tira esta página de cena.
          // Com itens, a página pôs uma sentinela no histórico (guarda de
          // saída): o pedido criado toma o lugar dela, e o "Voltar" do pedido
          // cai na tela de antes, como sem a guarda.
          if (isOnLeaveSentinel()) {
            redirect(`/orders/${order.id}`, { replace: true });
          } else {
            redirect(`/orders/${order.id}`);
          }
        },
      }
    );
  };

  // "Criar pedido" valida o formulário (yup); só com ele válido a origem
  // monta o input e chama `create`.
  const submit = () => formRef.current?.submitForm();

  return {
    formRef,
    factoryId,
    setFactoryId,
    clientId,
    setClientId,
    paymentTermOptions,
    setPaymentTermId,
    setFreightType,
    draft,
    backup,
    paymentMinimum,
    freeFreight,
    create,
    submit,
    // Inclui o redirect: o botão "Criar pedido" só sai do loading quando o
    // pedido recém-criado já carregou.
    isLoading: isLoading || isRedirecting,
  };
}

export type NewOrderCore = ReturnType<typeof useNewOrderCore>;
