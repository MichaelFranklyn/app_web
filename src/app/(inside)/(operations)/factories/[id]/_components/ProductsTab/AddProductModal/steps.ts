import { FormStepSchema } from "@/components/FormBuilder";
import { labelWithHelp } from "@/components/HelpTooltip";

import { SelectOption } from "../interface";
import { PRODUCT_FIELD_HELP } from "../productFieldHelp";

interface StepsOptions {
  categoryOptions: SelectOption[];
  unitOptions: SelectOption[];
  labelOptions: SelectOption[];
  taxRuleOptions: SelectOption[];
  priceListOptions: SelectOption[];
  tierOptions: SelectOption[];
  onCreateUnit: (label: string) => Promise<SelectOption>;
  onCreateLabel: (label: string) => Promise<SelectOption>;
  onCreateTaxRule: (label: string) => Promise<SelectOption>;
}

/**
 * Passos do cadastro manual de produto: informações gerais (obrigatórias),
 * impostos e preços (ambos opcionais, uma linha por imposto/tabela). Os dois
 * últimos evitam a ida ao detalhe do produto só para completar o cadastro.
 */
export function buildAddProductSteps({
  categoryOptions,
  unitOptions,
  labelOptions,
  taxRuleOptions,
  priceListOptions,
  tierOptions,
  onCreateUnit,
  onCreateLabel,
  onCreateTaxRule,
}: StepsOptions): FormStepSchema[] {
  return [
    {
      id: "info",
      title: "Informações",
      sections: [
        {
          id: "fields",
          fields: [
            {
              name: "sku",
              type: "text",
              label: labelWithHelp("Código do produto", PRODUCT_FIELD_HELP.sku),
              labelText: "Código do produto",
              required: true,
              placeholder: "Ex: ABC-123",
              minLength: 2,
              maxLength: 100,
            },
            {
              name: "name",
              type: "text",
              label: labelWithHelp("Nome do produto", PRODUCT_FIELD_HELP.name),
              labelText: "Nome do produto",
              required: true,
              placeholder: "Ex: Cimento CP-II 50kg",
              minLength: 2,
              maxLength: 255,
            },
            {
              name: "categoryId",
              type: "select-single",
              label: labelWithHelp("Categoria", PRODUCT_FIELD_HELP.category),
              labelText: "Categoria",
              required: true,
              placeholder:
                categoryOptions.length === 0
                  ? "Cadastre uma categoria primeiro"
                  : "Selecione a categoria",
              options: categoryOptions,
            },
            {
              name: "unitId",
              type: "select-single",
              label: labelWithHelp("Unidade", PRODUCT_FIELD_HELP.unit),
              labelText: "Unidade",
              required: true,
              placeholder: "Selecione ou digite para criar",
              options: unitOptions,
              onCreateOption: onCreateUnit,
            },
            {
              name: "unitLabelId",
              type: "select-single",
              label: labelWithHelp(
                "Rótulo de embalagem",
                PRODUCT_FIELD_HELP.unitLabel
              ),
              labelText: "Rótulo de embalagem",
              required: true,
              placeholder: "Selecione ou digite para criar",
              options: labelOptions,
              onCreateOption: onCreateLabel,
            },
            {
              name: "unitPerPack",
              type: "text",
              label: labelWithHelp(
                "Unidades por embalagem",
                PRODUCT_FIELD_HELP.unitPerPack
              ),
              labelText: "Unidades por embalagem",
              required: true,
              placeholder: "Ex: 12",
            },
            {
              name: "ncm",
              type: "text",
              label: labelWithHelp("NCM (opcional)", PRODUCT_FIELD_HELP.ncm),
              placeholder: "Ex: 3926.90.90",
              maxLength: 20,
            },
            {
              name: "saleMultiple",
              type: "text",
              label: labelWithHelp(
                "Múltiplo de venda (opcional)",
                PRODUCT_FIELD_HELP.saleMultiple
              ),
              placeholder: "Ex: 12",
            },
          ],
        },
      ],
    },
    {
      id: "taxes",
      title: "Impostos",
      sections: [
        {
          id: "taxes",
          name: "taxes",
          title: "Imposto",
          description:
            "Informe os impostos que incidem sobre este produto (ex.: IPI 5%). Você pode pular e cadastrar depois.",
          isRepeatable: true,
          isOptional: true,
          addLabel: "Adicionar imposto",
          fields: [
            {
              name: "taxRuleId",
              type: "select-single",
              label: "Imposto",
              labelText: "Imposto",
              placeholder: "Selecione ou digite para criar",
              options: taxRuleOptions,
              onCreateOption: onCreateTaxRule,
              grid: { mobile: 12, desktop: 7 },
            },
            {
              name: "rate",
              type: "number",
              label: "Alíquota (%)",
              labelText: "Alíquota",
              placeholder: "Ex: 5",
              grid: { mobile: 12, desktop: 5 },
            },
          ],
        },
      ],
    },
    {
      id: "prices",
      title: "Preços",
      sections: [
        {
          id: "prices",
          name: "prices",
          title: "Preço",
          description:
            "Informe o preço da embalagem fechada em cada tabela e nível. Você pode pular e cadastrar depois.",
          isRepeatable: true,
          isOptional: true,
          addLabel: "Adicionar preço",
          fields: [
            {
              name: "priceListId",
              type: "select-single",
              label: "Tabela de preço",
              labelText: "Tabela de preço",
              placeholder:
                priceListOptions.length === 0
                  ? "Cadastre uma tabela primeiro"
                  : "Selecione a tabela",
              options: priceListOptions,
              grid: { mobile: 12, desktop: 5 },
            },
            {
              name: "tierId",
              type: "select-single",
              label: "Nível",
              labelText: "Nível",
              placeholder:
                tierOptions.length === 0
                  ? "Cadastre um nível primeiro"
                  : "Selecione o nível",
              options: tierOptions,
              grid: { mobile: 12, desktop: 4 },
            },
            {
              name: "unitPrice",
              type: "currency",
              label: "Preço por embalagem",
              labelText: "Preço",
              placeholder: "0,00",
              grid: { mobile: 12, desktop: 3 },
            },
          ],
        },
      ],
    },
  ];
}
