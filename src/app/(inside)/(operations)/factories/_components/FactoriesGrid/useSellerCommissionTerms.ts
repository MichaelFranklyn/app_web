import { useCompleteList } from "@/hooks/useCompleteList";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useMemo } from "react";
import { CompanyFactory } from "../../interface";
import {
  MY_FACTORY_ACCESSES_QUERY,
  MyFactoryAccess,
  MyFactoryAccessesData,
} from "./gql";

export interface CommissionTerms {
  /**
   * Percentual do pedido; nulo = em branco na tela (acordo do vendedor ainda
   * não chegou, ou não foi cadastrado).
   */
  rate: number | null;
  basis: string;
}

const EMPTY_INPUT = {};
const getAccesses = (data: MyFactoryAccessesData) => data.my_factory_accesses;

/**
 * O que o card de comissão mostra ao VENDEDOR para um vínculo.
 *
 * O `commissionRate` do vínculo é o que a FÁBRICA paga à empresa, e o vendedor
 * NUNCA o vê — nem como substituto. Ele vê só o percentual do acesso dele
 * (`sellerCommissionRate`); sem percentual cadastrado, o campo fica em branco.
 * A base (Faturamento/Pagamento) não é valor, então cai na da fábrica quando o
 * repasse não tem uma própria.
 */
export const commissionTermsFor = (
  companyFactory: CompanyFactory,
  access: MyFactoryAccess | undefined
): CommissionTerms => ({
  rate:
    access?.sellerCommissionRate != null
      ? Number(access.sellerCommissionRate)
      : null,
  basis: access?.sellerCommissionBasis ?? companyFactory.commissionCalcBasis,
});

/**
 * As condições de comissão que cada card deve mostrar a QUEM está vendo.
 *
 * Gestor vê o acordo da empresa com a fábrica, como sempre. Vendedor vê só o
 * acordo dele: o percentual da fábrica não aparece para ele em hipótese
 * nenhuma, nem quando o dele não está cadastrado (aí fica em branco).
 * Enquanto o papel (lido do cookie depois de montar) ou os acessos do vendedor
 * não chegam, o percentual fica em branco — cair no da fábrica por um instante
 * mostraria de novo o número errado justamente para quem não deve vê-lo.
 */
export function useSellerCommissionTerms({
  roleKnown,
  isSeller,
}: {
  roleKnown: boolean;
  isSeller: boolean;
}) {
  const { data, loading, error } = useCompleteList<
    MyFactoryAccessesData,
    MyFactoryAccess
  >(MY_FACTORY_ACCESSES_QUERY, EMPTY_INPUT, getAccesses, { skip: !isSeller });

  useQueryErrorToast(
    error,
    "Não foi possível carregar a sua comissão em cada fábrica."
  );

  const accessByFactory = useMemo(
    () =>
      new Map(
        (data?.my_factory_accesses.edges ?? [])
          .map((edge) => edge.node)
          .filter((access) => access.isActive)
          .map((access) => [access.factoryId, access])
      ),
    [data]
  );

  return (companyFactory: CompanyFactory): CommissionTerms => {
    if (!roleKnown) {
      return { rate: null, basis: companyFactory.commissionCalcBasis };
    }
    if (!isSeller) {
      return {
        rate: companyFactory.commissionRate,
        basis: companyFactory.commissionCalcBasis,
      };
    }
    if (!data && (loading || error)) {
      return { rate: null, basis: companyFactory.commissionCalcBasis };
    }
    return commissionTermsFor(
      companyFactory,
      accessByFactory.get(companyFactory.factory.id)
    );
  };
}
