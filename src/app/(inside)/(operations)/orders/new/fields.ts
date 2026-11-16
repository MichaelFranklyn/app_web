import { FormFieldSchema, GridConfig } from "@/components/FormBuilder";
import { SelectOption } from "@/components/Input";
import { extractSelectValue } from "@/utils/form";

import { FREIGHT_OPTIONS } from "../../_shared/orderFreight";

/**
 * Campos que o pedido tem venha de onde vier (lista, cliente ou fábrica). Só o
 * "de quem é o pedido" muda com a origem; o resto é igual nas três e mora aqui
 * para não divergir.
 */

/**
 * Um campo por linha só no celular; no tablet, dois lado a lado. No computador
 * os dados do pedido cabem em DUAS linhas: na 1ª, o tipo e "de quem é o pedido"
 * (`partyGrid`); na 2ª, data, condição, frete, prazo e duração (2+3+2+2+3).
 * Empilhar em várias linhas empurrava os itens para longe do fim da tela.
 */
const narrow = (desktop: number): GridConfig => ({ tablet: 6, desktop });

/**
 * Largura dos campos "de quem é o pedido" (vendedor, fábrica, cliente ou o
 * vínculo) para fecharem a 1ª linha ao lado do Tipo (2 colunas).
 */
export function partyGrid(count: 1 | 2 | 3): GridConfig[] {
  if (count === 3) return [narrow(3), narrow(3), narrow(4)];
  if (count === 2) return [narrow(5), narrow(5)];
  return [narrow(10)];
}

export const orderKindField: FormFieldSchema = {
  grid: narrow(2),
  name: "orderKind",
  type: "radio",
  label: "Tipo",
  hint: "Orçamento vira pedido depois. Só pedido é faturado.",
  required: true,
  options: [
    { label: "Pedido", value: "order" },
    { label: "Orçamento", value: "quote" },
  ],
};

export const orderDateField: FormFieldSchema = {
  grid: narrow(2),
  name: "orderDate",
  type: "date",
  label: "Data do pedido",
  required: true,
};

interface PaymentTermFieldArgs {
  options: SelectOption[];
  /** Sem fábrica não há condição para listar; diz o que falta escolher. */
  pendingPlaceholder: string | null;
  onChange: (id: string) => void;
}

export const paymentTermField = ({
  options,
  pendingPlaceholder,
  onChange,
}: PaymentTermFieldArgs): FormFieldSchema => ({
  name: "paymentTermId",
  grid: narrow(3),
  type: "select-single",
  label: "Condição de pagamento",
  placeholder:
    pendingPlaceholder ??
    (options.length === 0
      ? "Fábrica sem condições cadastradas"
      : "Selecione a condição (ex.: 30/60/90)"),
  disabled: Boolean(pendingPlaceholder) || options.length === 0,
  options,
  // A condição vira estado assim que é escolhida: o aviso de valor mínimo
  // aparece junto dos itens, na mesma tela.
  onChange: (value) => onChange(extractSelectValue(value)),
});

export const freightField = (
  onChange: (freightType: string) => void
): FormFieldSchema => ({
  name: "freightType",
  grid: narrow(2),
  type: "select-single",
  label: "Frete",
  placeholder: "FOB ou CIF",
  options: FREIGHT_OPTIONS,
  onChange: (value) => onChange(extractSelectValue(value)),
});

export const deliveryField: FormFieldSchema = {
  grid: narrow(2),
  name: "deliveryEstimateDays",
  type: "number",
  label: "Prazo de entrega (dias)",
  placeholder: "Ex: 15",
  hint: "Contados do faturamento. Em branco: o prazo da fábrica.",
};

export const coverageField = (hint: string): FormFieldSchema => ({
  name: "coverageDays",
  grid: narrow(3),
  type: "number",
  label: "Dura quantos dias na loja?",
  placeholder: "Ex: 30",
  hint,
});

export const notesField: FormFieldSchema = {
  name: "notes",
  type: "textarea",
  label: "Observações",
  placeholder: "Observações adicionais...",
  rows: 3,
};

/** Os campos de um só passo/seção, como o FormBuilder espera. */
export const singleSection = (fields: FormFieldSchema[]) => [
  { id: "order", sections: [{ id: "details", fields }] },
];
