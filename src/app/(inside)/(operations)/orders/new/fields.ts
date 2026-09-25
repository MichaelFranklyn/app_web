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
 * Um campo por linha só no celular: no tablet vão dois lado a lado e no
 * computador três — a página tem largura, e empilhar tudo numa coluna estreita
 * empurrava os itens para longe do fim da tela.
 */
export const FIELD_GRID: GridConfig = { tablet: 6, desktop: 4 };

export const orderKindField: FormFieldSchema = {
  grid: FIELD_GRID,
  name: "orderKind",
  type: "radio",
  label: "Tipo",
  hint: "O orçamento pode ser convertido em pedido depois. Só o pedido pode ser faturado.",
  required: true,
  options: [
    { label: "Pedido", value: "order" },
    { label: "Orçamento", value: "quote" },
  ],
};

export const orderDateField: FormFieldSchema = {
  grid: FIELD_GRID,
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
  grid: FIELD_GRID,
  type: "select-single",
  label: "Condição de pagamento (opcional)",
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
  grid: FIELD_GRID,
  type: "select-single",
  label: "Frete (opcional)",
  placeholder: "FOB ou CIF",
  options: FREIGHT_OPTIONS,
  onChange: (value) => onChange(extractSelectValue(value)),
});

export const deliveryField: FormFieldSchema = {
  grid: FIELD_GRID,
  name: "deliveryEstimateDays",
  type: "number",
  label: "Prazo de entrega (dias)",
  placeholder: "Ex: 15",
  hint: "Dias até a mercadoria chegar, contados do faturamento. Em branco: usa o prazo padrão da fábrica.",
};

export const coverageField = (hint: string): FormFieldSchema => ({
  name: "coverageDays",
  grid: FIELD_GRID,
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
