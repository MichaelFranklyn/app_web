import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useQueryErrorToast } from "@/hooks/useQueryErrorToast";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useMutation } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import { getProductErrorMessage } from "../errors";
import { SelectOption } from "../interface";
import {
  CREATE_TAX_RULE_MUTATION,
  FACTORY_PRICE_LISTS_OPTIONS_QUERY,
  PRICE_TIERS_OPTIONS_QUERY,
  TAX_RULES_QUERY,
} from "./gql";
import {
  CreateTaxRuleResponse,
  FactoryPriceListsData,
  PriceTiersData,
  TaxRulesData,
} from "./interface";

// Catálogos pequenos carregados por inteiro (ver useCompleteList): sem `first`
// fixo, quem passar do teto é rebuscado pelo total em vez de sumir da lista.
const LIST_INPUT = {};
const getTaxRules = (d: TaxRulesData) => d.taxRules;
const getPriceLists = (d: FactoryPriceListsData) => d.factoryPriceLists;
const getTiers = (d: PriceTiersData) => d.priceTiers;

/**
 * Opções dos passos "Impostos" e "Preços" do cadastro manual de produto:
 * regras de imposto (catálogo da empresa, com criação inline) e as tabelas de
 * preço / níveis da fábrica. Só carrega com o modal aberto.
 */
export function useProductExtrasOptions(
  open: boolean,
  companyFactoryId: string
) {
  const byCompanyFactory = useMemo(
    () => ({
      filters: [
        {
          field: "company_factory_id",
          operator: "eq",
          value: companyFactoryId,
        },
      ],
    }),
    [companyFactoryId]
  );

  const {
    data: rulesData,
    error: rulesError,
    refetch: refetchRules,
  } = useCompleteList<TaxRulesData>(TAX_RULES_QUERY, LIST_INPUT, getTaxRules, {
    skip: !open,
  });

  const { data: listsData, error: listsError } =
    useCompleteList<FactoryPriceListsData>(
      FACTORY_PRICE_LISTS_OPTIONS_QUERY,
      byCompanyFactory,
      getPriceLists,
      { skip: !open || !companyFactoryId }
    );

  const { data: tiersData, error: tiersError } =
    useCompleteList<PriceTiersData>(
      PRICE_TIERS_OPTIONS_QUERY,
      byCompanyFactory,
      getTiers,
      { skip: !open || !companyFactoryId }
    );

  const [createTaxRule] = useMutation<CreateTaxRuleResponse>(
    CREATE_TAX_RULE_MUTATION
  );
  const { execute } = useAsyncAction();

  // Como em `useProductCatalogOptions`: `execute` engole o erro, então
  // relançamos para o select não criar uma opção-fantasma com o label como id.
  const handleCreateTaxRule = useCallback(
    async (label: string): Promise<SelectOption> => {
      const created = await execute(
        async () => {
          const res = await createTaxRule({
            variables: { input: { name: label.trim() } },
          });
          const data = res.data?.createTaxRule?.data;
          if (!res.data?.createTaxRule?.status || !data) {
            throw new Error(
              getProductErrorMessage(
                res.data?.createTaxRule?.message,
                "Erro ao criar imposto"
              )
            );
          }
          await refetchRules();
          return { value: data.id, label: data.name };
        },
        { successMessage: "Imposto criado com sucesso" }
      );
      if (!created) throw new Error("Erro ao criar imposto");
      return created;
    },
    [execute, createTaxRule, refetchRules]
  );

  const taxRuleOptions: SelectOption[] = useMemo(
    () =>
      rulesData?.taxRules.edges.map((e) => ({
        value: e.node.id,
        label: e.node.name,
      })) ?? [],
    [rulesData]
  );

  const priceListOptions: SelectOption[] = useMemo(
    () =>
      listsData?.factoryPriceLists.edges.map((e) => ({
        value: e.node.id,
        label: e.node.isActive ? `${e.node.name} (ativa)` : e.node.name,
      })) ?? [],
    [listsData]
  );

  const tierOptions: SelectOption[] = useMemo(
    () =>
      tiersData?.priceTiers.edges.map((e) => ({
        value: e.node.id,
        label: e.node.name,
      })) ?? [],
    [tiersData]
  );

  useQueryErrorToast(
    rulesError ?? listsError ?? tiersError,
    "Não foi possível carregar impostos e tabelas de preço. Tente novamente."
  );

  return {
    taxRuleOptions,
    priceListOptions,
    tierOptions,
    handleCreateTaxRule,
  };
}
