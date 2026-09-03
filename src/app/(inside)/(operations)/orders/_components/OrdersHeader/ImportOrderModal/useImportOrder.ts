import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useToast } from "@/components/Toast";
import { useRefetchQueriesClient } from "@/hooks/useInvalidateQueries";
import { extractSelectValue } from "@/utils/form";
import { getTodayIso } from "@/utils/format/date";
import { readWorkbook } from "@/utils/import/reader";
import {
  isOrderSheet,
  readOrderSheet,
  type OrderSheetRead,
} from "@/utils/orderSheet/read";

import { DeferredOrderTarget } from "../../../../_components/OrderImportWizard";
import type { ImportRow } from "../../../../_components/OrderImportWizard/utils";
import {
  coverageHint,
  useCoverageSuggestion,
} from "../../../../_shared/orderCoverage";
import { useCompanyFactoryNode } from "../../../../_shared/orderItemCatalog";
import { usePaymentTermOptions } from "../../../../_shared/orderPaymentTerms";
import { FREIGHT_OPTIONS } from "../../../../_shared/orderFreight";
import { Order } from "../../../interface";
import {
  CREATE_ORDER_MUTATION,
  ORDER_SELLER_FACTORIES_QUERY,
  ORDER_SELLERS_OPTIONS_QUERY,
} from "../gql";
import { useOrderClientOptions } from "../useOrderClientOptions";
import { CreateOrderInput, CreateOrderResponse } from "../interface";
import { normalizeInput } from "../utils";
import { type ImportMode, sheetSummary, sheetToOrderInput } from "./utils";

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

const LIST_INPUT = { first: 200 };

export interface ImportOrderModalProps {
  onAddOptimistic: (order: Order) => void;
  /** Gestor escolhe o vendedor; o vendedor não (a query `sellers` é admin-only). */
  canSelectSeller: boolean;
  /** Perfil de vendedor de quem usa a tela — o dono do pedido quando não há escolha. */
  ownSellerId: string | null;
}

export function useImportOrder({
  onAddOptimistic,
  canSelectSeller,
  ownSellerId,
}: ImportOrderModalProps) {
  const [open, setOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  // Qual caminho de importação: a ficha do sistema (que se lê sozinha) ou um
  // arquivo de fábrica (que precisa dos dados do pedido antes).
  const [mode, setMode] = useState<ImportMode | null>(null);
  // A ficha inteira, quando o caminho é o dela: é ela que vira o pedido, sem
  // passar pelos campos.
  const [sheetRead, setSheetRead] = useState<OrderSheetRead | null>(null);
  // O que o formulário mostrava quando a pessoa avançou. Voltar do wizard
  // REMONTA o formulário (ele sai da árvore enquanto o wizard ocupa a tela), e
  // sem o rascunho ele voltaria vazio: quem clica em "Informações" para trocar
  // o cliente perderia o vendedor e a fábrica junto.
  const [detailsDraft, setDetailsDraft] = useState<Record<string, unknown>>();
  // Dados validados do formulário — o pedido em si SÓ é criado na confirmação
  // final do wizard (desistir no meio não deixa pedido vazio para trás).
  const [pending, setPending] = useState<CreateOrderInput | null>(null);
  const [sellerId, setSellerId] = useState(
    canSelectSeller ? "" : (ownSellerId ?? "")
  );
  const [factoryId, setFactoryId] = useState("");
  // Itens lidos de uma ficha nossa. Quando existem, o wizard abre na revisão.
  const [sheetRows, setSheetRows] = useState<ImportRow[] | null>(null);
  // O prazo vem da ficha pelo NOME; o id só dá para resolver depois que as
  // condições da fábrica chegam do servidor (ver o efeito abaixo).
  const [sheetTermName, setSheetTermName] = useState("");
  const [readingSheet, setReadingSheet] = useState(false);
  // O cliente também vira estado (e não só campo do form) para a sugestão de
  // cobertura saber de qual prateleira está falando.
  const [clientId, setClientId] = useState("");
  // Id do pedido criado pela confirmação — memoizado para uma re-tentativa
  // (ex.: falha de rede ao gravar itens) não criar um segundo pedido.
  const createdOrderIdRef = useRef<string | null>(null);

  const formRef = useRef<FormBuilderRef>(null);
  const { toast } = useToast();
  const refetchClient = useRefetchQueriesClient();
  const [createOrder] = useMutation<CreateOrderResponse>(CREATE_ORDER_MUTATION);

  // Só as opções: a importação não monta itens na tela (o wizard traz os do
  // arquivo), então o piso aparece apenas no rótulo da condição.
  const {
    options: paymentTermOptions,
    idByName: paymentTermIdByName,
    loading: loadingTerms,
  } = usePaymentTermOptions(open, factoryId || null);
  const ipiInOrder =
    useCompanyFactoryNode(open, factoryId || null)?.ipiInOrder ?? false;

  const { data: sellersData } = useQuery<SellersOptionsData>(
    ORDER_SELLERS_OPTIONS_QUERY,
    {
      variables: { input: LIST_INPUT },
      skip: !open || !canSelectSeller,
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
      skip: !open || !sellerId,
    }
  );
  // Carteira do vendedor naquela fábrica: a única lista destes modais que pode
  // passar de uma página, por isso busca no servidor (ver o hook, no pai).
  const clients = useOrderClientOptions(open, sellerId, factoryId);

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
      if (node.factory)
        map.set(
          node.factoryId,
          node.factory.nomeFantasia ?? node.factory.razaoSocial
        );
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [factoriesData]);
  const clientOptions = clients.options;
  const cadenceByClient = clients.cadenceByClient;

  useCoverageSuggestion(formRef, cadenceByClient.get(clientId), open);

  const formSteps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "order",
        sections: [
          {
            id: "details",
            title: "Para qual pedido?",
            fields: [
              // Só gestor escolhe o vendedor (ver `canSelectSeller`).
              ...(canSelectSeller
                ? [
                    {
                      name: "sellerId",
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
                        setFactoryId("");
                        setClientId("");
                        setValue("factoryId", "");
                        setValue("clientId", "");
                      },
                    },
                  ]
                : []),
              {
                name: "factoryId",
                type: "select-single",
                label: "Fábrica",
                placeholder: sellerId
                  ? "Selecione a fábrica"
                  : "Selecione o vendedor primeiro",
                required: true,
                disabled: !sellerId,
                options: factoryOptions,
                onChange: (value, setValue) => {
                  setFactoryId(extractSelectValue(value));
                  setClientId("");
                  setValue("clientId", "");
                  // Condições de pagamento são da fábrica: trocar invalida a escolha.
                  setValue("paymentTermId", "");
                },
              },
              {
                name: "clientId",
                type: "select-single",
                label: "Cliente",
                placeholder: factoryId
                  ? "Selecione o cliente"
                  : "Selecione a fábrica primeiro",
                required: true,
                disabled: !factoryId,
                options: clientOptions,
                // `onSearch` vem `undefined` quando a carteira coube inteira na
                // primeira página: aí o select filtra em memória, sem latência.
                onSearch: clients.onSearch,
                loading: clients.loading,
                onChange: (value) => setClientId(extractSelectValue(value)),
              },
              {
                name: "orderDate",
                type: "date",
                label: "Data do pedido",
                required: true,
              },
              {
                name: "paymentTermId",
                type: "select-single",
                label: "Condição de pagamento (opcional)",
                placeholder: !factoryId
                  ? "Selecione a fábrica primeiro"
                  : paymentTermOptions.length === 0
                    ? "Fábrica sem condições cadastradas"
                    : "Selecione a condição (ex.: 30/60/90)",
                disabled: !factoryId || paymentTermOptions.length === 0,
                options: paymentTermOptions,
              },
              {
                name: "freightType",
                type: "select-single",
                label: "Frete (opcional)",
                placeholder: "FOB ou CIF",
                options: FREIGHT_OPTIONS,
              },
              {
                name: "deliveryEstimateDays",
                type: "number",
                label: "Prazo de entrega (dias)",
                placeholder: "Ex: 15",
                hint: "Dias até a mercadoria chegar, contados do faturamento. Em branco: usa o prazo padrão da fábrica.",
              },
              {
                name: "coverageDays",
                type: "number",
                label: "Dura quantos dias na loja?",
                placeholder: "Ex: 30",
                hint: coverageHint(cadenceByClient.get(clientId)),
              },
              {
                name: "notes",
                type: "textarea",
                label: "Observações",
                placeholder: "Observações adicionais...",
                rows: 3,
                hint: "A ficha de pedido traz o que você anotou nela.",
              },
            ],
          },
        ],
      },
    ],
    [
      canSelectSeller,
      sellerOptions,
      factoryOptions,
      clientOptions,
      clients.onSearch,
      clients.loading,
      sellerId,
      factoryId,
      paymentTermOptions,
      cadenceByClient,
      clientId,
    ]
  );

  /**
   * Lê uma ficha de pedido preenchida e responde o formulário com ela.
   *
   * O vendedor já disse tudo na planilha, offline: para quem é o pedido, de que
   * fábrica, com que prazo e o que ele comprou. Então aqui não há campo a
   * preencher — o arquivo vira o pedido direto e ele cai na conferência dos
   * itens. O pedido ainda NÃO é gravado: quem sobe (às vezes o escritório, não
   * quem vendeu) confirma na última etapa do wizard.
   */
  const handleSheetFile = async (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    setReadingSheet(true);
    try {
      const workbook = await readWorkbook(selected);
      if (!isOrderSheet(workbook)) {
        toast({
          variant: "error",
          title: "Este arquivo não é uma ficha de pedido",
          description:
            "Esta é a ficha .xlsx que você baixa do sistema. Para o arquivo da " +
            'fábrica, volte e escolha "Gerar pedido com outra importação".',
        });
        return;
      }

      const sheet = readOrderSheet(workbook);

      // Vendedor não sobe a ficha de um colega: a carteira e os níveis dentro
      // dela são de outra pessoa. O backend também recusaria (o cliente não
      // está designado a ele), mas com uma mensagem que não explica nada.
      if (
        !canSelectSeller &&
        ownSellerId &&
        sheet.meta.sellerId !== ownSellerId
      ) {
        toast({
          variant: "error",
          title: `Esta ficha é do vendedor ${sheet.meta.sellerName}`,
          description: "Peça para ele subir, ou para um gestor fazer isso.",
        });
        return;
      }

      if (!sheet.factoryId || !sheet.clientId) {
        toast({
          variant: "warning",
          title: "Ficha incompleta",
          description: !sheet.factoryId
            ? "Escolha a fábrica na ficha antes de subir."
            : "O CNPJ preenchido não é de um cliente da carteira desta ficha.",
        });
        return;
      }

      if (sheet.items.length === 0) {
        toast({
          variant: "warning",
          title: "Ficha sem itens",
          description: "Preencha o código e a quantidade de embalagens.",
        });
        return;
      }

      // Nada de preencher campo: a ficha responde tudo o que o formulário
      // perguntaria, e quem a preencheu já respondeu isso na loja. O que ele
      // tem a conferir são os itens, onde o catálogo de hoje pode discordar do
      // que ele anotou. Os estados abaixo existem porque o wizard depende
      // deles: catálogo da fábrica, cobertura do cliente, condições da fábrica.
      setSellerId(sheet.meta.sellerId);
      setFactoryId(sheet.factoryId);
      setClientId(sheet.clientId);
      setSheetTermName(sheet.paymentTermName);
      setSheetRead(sheet);
      setSheetRows(
        sheet.items.map((item) => ({
          sku: item.sku,
          quantity: item.quantity,
          // A ficha não traz preço: o dela é fórmula, e o que vale é o catálogo
          // de hoje. O backend resolve pelo nível acordado do vínculo.
          unitPrice: null,
          ipiRate: 0,
          discountPercent: item.discountPercent,
        }))
      );

      toast({
        variant: "success",
        title: "Ficha lida",
        description: `${sheet.items.length} item(ns). Agora confira o que casou com o catálogo.`,
      });
    } catch {
      toast({
        variant: "error",
        title: "Não foi possível ler a ficha",
        description: "Confira se o arquivo é a planilha .xlsx preenchida.",
      });
    } finally {
      setReadingSheet(false);
    }
  };

  /**
   * A condição da ficha, resolvida — ela guarda o NOME ("45/60/90") e o id só
   * existe depois que as condições da fábrica voltam do servidor.
   */
  const sheetTerm = useMemo(() => {
    if (!sheetTermName || loadingTerms) return null;
    const id = paymentTermIdByName(sheetTermName);
    return paymentTermOptions.find((option) => option.value === id) ?? null;
  }, [sheetTermName, loadingTerms, paymentTermIdByName, paymentTermOptions]);

  /**
   * Ficha lida → pedido montado, sem passo intermediário.
   *
   * Espera só as condições de pagamento: elas dependem da fábrica, que só se
   * conhece depois de ler o arquivo. `loadingTerms` é o que distingue "ainda
   * não chegou" de "esta fábrica não tem condição cadastrada" — sem isso, uma
   * fábrica sem condições travaria a importação para sempre.
   */
  useEffect(() => {
    if (!sheetRead || pending || loadingTerms) return;
    setPending(
      sheetToOrderInput(sheetRead, sheetTerm?.value ?? null, getTodayIso())
    );
  }, [sheetRead, pending, loadingTerms, sheetTerm]);

  const refetchList = () => {
    refetchClient(["Orders", "OrderStats"]);
  };

  const handleClose = (value: boolean) => {
    if (!value && isBusy) return; // Não fecha durante a importação.
    setOpen(value);
    if (!value) {
      if (createdOrderIdRef.current) refetchList(); // Pedido criado: lista reflete.
      setPending(null);
      createdOrderIdRef.current = null;
      setSellerId(canSelectSeller ? "" : (ownSellerId ?? ""));
      setFactoryId("");
      setClientId("");
      setSheetRows(null);
      setSheetTermName("");
      setSheetRead(null);
      setMode(null);
      setDetailsDraft(undefined);
      formRef.current?.resetForm();
    }
  };

  // Formulário válido: guarda os dados e avança para o wizard — SEM criar nada.
  const handleDetailsValid = (data: Record<string, unknown>) => {
    setDetailsDraft(data);
    setPending(normalizeInput(data, sellerId));
  };

  /**
   * Volta para um passo que é do modal, saindo do wizard.
   *
   * Zerar o `pending` é o que devolve a tela: sem ele não há alvo adiado, e o
   * modal volta a mostrar o passo dele. Nada foi gravado até aqui — o pedido só
   * nasce na confirmação —, então voltar não deixa rastro no banco.
   */
  const goToLeadingStep = (index: number) => {
    setPending(null);
    if (index > 0) return; // "Informações": o formulário volta com o rascunho.
    setMode(null);
    setSheetRead(null);
    setSheetRows(null);
    setSheetTermName("");
  };

  // Alvo adiado do wizard: o pedido nasce na confirmação final da importação.
  const deferred: DeferredOrderTarget | null = useMemo(() => {
    if (!pending) return null;
    return {
      factoryId: pending.factoryId,
      clientId: pending.clientId,
      createOrder: async () => {
        if (createdOrderIdRef.current) return createdOrderIdRef.current;
        const res = await createOrder({ variables: { input: pending } });
        if (!res.data?.createOrder?.status || !res.data.createOrder.data) {
          throw new Error(
            res.data?.createOrder?.message ?? "Erro ao criar pedido"
          );
        }
        const order = res.data.createOrder.data;
        createdOrderIdRef.current = order.id;
        onAddOptimistic(order);
        return order.id;
      },
    };
  }, [pending, createOrder, onAddOptimistic]);

  return {
    open,
    handleClose,
    deferred,
    ipiInOrder,
    setIsBusy,
    refetchList,
    formRef,
    formSteps,
    handleDetailsValid,
    /** Itens da ficha: quando existem, o wizard pula arquivo e colunas. */
    sheetRows,
    handleSheetFile,
    /** Lendo o arquivo, ou esperando as condições da fábrica para montar o pedido. */
    readingSheet: readingSheet || (!!sheetRead && !pending),
    mode,
    setMode,
    goToLeadingStep,
    /** O que o formulário tinha quando avançou — para ele voltar preenchido. */
    detailsDraft,
    /** O que a ficha disse — o resumo que substitui os campos preenchidos. */
    sheetSummary: sheetRead
      ? sheetSummary(sheetRead, sheetTerm?.label ?? null)
      : "",
  };
}
