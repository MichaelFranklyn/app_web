import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { formatMoney } from "@/utils/format/masks";

import { PaymentTermMinimum } from "../orderDraftItems";
import { useCompanyFactoryId } from "../orderItemCatalog";
import { ORDER_PAYMENT_TERMS_QUERY, OrderPaymentTermsData } from "./gql";
import { PaymentTermChoices } from "./interface";

/**
 * Opções de condição de pagamento da fábrica escolhida no wizard de pedido —
 * mesmas condições (e mesmo rótulo "Nome (30/60/90)") oferecidas ao faturar.
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

  const { data } = useQuery<OrderPaymentTermsData>(ORDER_PAYMENT_TERMS_QUERY, {
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
  });

  return useMemo(() => {
    const nodes = data?.factoryPaymentTerms.edges.map(({ node }) => node) ?? [];

    const options = nodes.map((node) => {
      const base = `${node.name} (${node.installmentsDays.join("/")})`;
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

    return { options, minimumOf };
  }, [data]);
}
