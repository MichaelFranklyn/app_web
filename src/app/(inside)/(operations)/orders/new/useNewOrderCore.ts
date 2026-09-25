import { FormBuilderRef } from "@/components/FormBuilder";
import { useToast } from "@/components/Toast";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { isOnLeaveSentinel } from "@/hooks/useLeaveGuard";
import { useRedirectTransition } from "@/hooks/useRedirectTransition";
import {
  ORDER_CACHE_FIELDS,
  ORDER_ITEM_EVIDENCE_CACHE_FIELDS,
} from "@/utils/cacheFields";
import { useMutation } from "@apollo/client/react";
import { useRef, useState } from "react";

import {
  CREATE_ORDER_MUTATION,
  CreateOrderInput,
  CreateOrderResponse,
} from "../_shared/orderCreate";
import {
  CREATE_ORDER_ITEM_MUTATION,
  CreateOrderItemResponse,
  createDraftItems,
  useOrderDraftItems,
} from "../../_shared/orderDraftItems";
import { usePaymentTermOptions } from "../../_shared/orderPaymentTerms";
import { useFreeFreightTarget } from "../../_shared/orderFreight";

/**
 * O que a página de novo pedido faz igual em qualquer origem (lista, cliente,
 * fábrica): guarda a fábrica e o cliente escolhidos, mantém o rascunho de
 * itens, as condições e o frete da fábrica, e grava — cria o pedido, depois
 * cada item, e entra no pedido criado.
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
  const { options: paymentTermOptions, minimumOf } = usePaymentTermOptions(
    true,
    factoryId || null
  );
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
  const [createOrderItem] = useMutation<CreateOrderItemResponse>(
    CREATE_ORDER_ITEM_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // Cria o pedido e, em seguida, cada item do rascunho.
  const create = async (input: CreateOrderInput) => {
    await execute(
      async () => {
        const res = await createOrder({ variables: { input } });
        if (!res.data?.createOrder?.status || !res.data.createOrder.data) {
          throw new Error(
            res.data?.createOrder?.message ?? "Erro ao criar pedido"
          );
        }
        const order = res.data.createOrder.data;

        // Itens são gravados após o pedido existir (o backend não os aceita no
        // CreateOrderInput). Falhas parciais não desfazem o pedido.
        const failed = await createDraftItems(
          createOrderItem,
          order.id,
          draft.items
        );
        return { order, failed };
      },
      {
        successMessage: "Pedido criado com sucesso",
        onSuccess: async ({ order, failed }) => {
          // Item gravado é a prova de que a visita aconteceu: o backend fecha
          // a visita pendente do cliente no primeiro item. Sem itens, só o
          // pedido mudou.
          await invalidateClient(
            draft.items.length > 0
              ? ORDER_ITEM_EVIDENCE_CACHE_FIELDS
              : ORDER_CACHE_FIELDS
          );
          if (failed.length) {
            toast({
              variant: "error",
              title: "Alguns itens não foram adicionados",
              description: `${failed.join(", ")} — adicione no detalhe do pedido.`,
            });
          }
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
