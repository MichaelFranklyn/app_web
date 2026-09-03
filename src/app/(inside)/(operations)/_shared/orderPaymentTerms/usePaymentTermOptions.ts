import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { formatMoney } from "@/utils/format/masks";

import { PaymentTermMinimum } from "../orderDraftItems";
import { useCompanyFactoryId } from "../orderItemCatalog";
import { ORDER_PAYMENT_TERMS_QUERY, OrderPaymentTermsData } from "./gql";
import { PaymentTermChoices } from "./interface";
import { findTermIdByName, paymentTermLabel } from "./utils";

/**
 * Opções de condição de pagamento da fábrica escolhida no wizard de pedido —
 * mesmas condições, e mesmo rótulo ("30/60 dias"), oferecidas ao faturar.
 * Vazio enquanto a fábrica não foi escolhida ou não tem condições cadastradas.
 *
 * O rótulo carrega o piso de faturamento ("30/60/90 · mínimo R$ 3.000,00")
 * porque é no passo 1 que essa informação evita trabalho perdido: quem já sabe
 * da exigência escolhe outra condição antes de montar o pedido inteiro.
 */
export function usePaymentTermOptions(
  open: boolean,
  factoryId: string | null
): PaymentTermChoices {
  const companyFactoryId = useCompanyFactoryId(open, factoryId);

  const { data, loading } = useQuery<OrderPaymentTermsData>(
    ORDER_PAYMENT_TERMS_QUERY,
    {
      variables: {
        input: {
          first: 100,
          filters: [
            {
              field: "company_factory_id",
              operator: "eq",
              value: companyFactoryId,
            },
          ],
        },
      },
      skip: !open || !companyFactoryId,
      // Prazo e mínimo se editam na tela da fábrica e valem aqui na hora.
      fetchPolicy: "cache-and-network",
    }
  );

  return useMemo(() => {
    const nodes = data?.factoryPaymentTerms.edges.map(({ node }) => node) ?? [];

    const options = nodes.map((node) => {
      // O prazo, e só ele: o nome cadastrado costuma ser os próprios dias, e o
      // rótulo saía repetindo — "45/60/90 (45/60/90)".
      const base = paymentTermLabel(node);
      return {
        value: node.id,
        label: node.minOrderAmount
          ? `${base} · mínimo ${formatMoney(node.minOrderAmount)}`
          : base,
      };
    });

    const minimumOf = (
      termId: string | null | undefined
    ): PaymentTermMinimum | null => {
      if (!termId) return null;
      const node = nodes.find((n) => n.id === termId);
      if (!node?.minOrderAmount) return null;
      return { termName: node.name, amount: node.minOrderAmount };
    };

    return {
      options,
      minimumOf,
      idByName: (name: string) => findTermIdByName(nodes, name),
      loading,
    };
  }, [data, loading]);
}
