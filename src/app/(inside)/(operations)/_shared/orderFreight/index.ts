import { SelectOption } from "@/components/Input";

/**
 * Modalidade de frete do pedido — compartilhada entre criar/importar pedido em
 * /orders, /clients e /factories. O valor é o NOME do enum GraphQL (FOB/CIF);
 * vazio = não informado.
 */
export const FREIGHT_OPTIONS: SelectOption[] = [
  { value: "FOB", label: "FOB — frete por conta do cliente" },
  { value: "CIF", label: "CIF — entrega pela fábrica" },
];
