import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { SelectOption } from "@/components/Input";

import { useCompanyFactoryId } from "../orderItemCatalog";
import { ORDER_PAYMENT_TERMS_QUERY, OrderPaymentTermsData } from "./gql";

/**
 * Opções de condição de pagamento da fábrica escolhida no wizard de pedido —
 * mesmas condições (e mesmo rótulo "Nome (30/60/90)") oferecidas ao faturar.
 * Vazio enquanto a fábrica não foi escolhida ou não tem condições cadastradas.
 */
export function usePaymentTermOptions(
  open: boolean,
  factoryId: string | null
): SelectOption[] {
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

  return useMemo(
    () =>
      data?.factoryPaymentTerms.edges.map(({ node }) => ({
        value: node.id,
        label: `${node.name} (${node.installmentsDays.join("/")})`,
      })) ?? [],
    [data]
  );
}
