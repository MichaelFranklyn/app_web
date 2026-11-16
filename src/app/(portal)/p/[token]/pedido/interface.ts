/** O que qualquer linha de produto (acabando ou catálogo) leva para a lista. */
export interface OrderableProduct {
  productId: string;
  productName: string;
  sku: string | null;
  factoryName: string;
  /** Embalagem mínima em UNIDADES (múltiplo × unidades por embalagem). */
  saleMultiple: string | null;
  /** Decimal em string: a última compra, ou o múltiplo de venda. */
  suggestedQuantity: string;
  estimatedUnitPrice?: string | null;
  estimatedUnitPriceWithTax?: string | null;
  isPromo?: boolean;
  /** Preço por unidade pago na última compra (para comparar). */
  lastUnitPrice?: string | null;
  /** Foto do produto (caminho cru; resolver com `mediaUrl`). */
  imageUrl?: string | null;
}

/** Um produto na lista do cliente, com a quantidade que ele escolheu. */
export interface OrderCartItem {
  productId: string;
  productName: string;
  sku: string | null;
  factoryName: string;
  saleMultiple: string | null;
  estimatedUnitPrice: string | null;
  /** O preço estimado com imposto; ausente em listas guardadas antes dele. */
  estimatedUnitPriceWithTax?: string | null;
  /** Preço por unidade da última compra; ausente em listas antigas. */
  lastUnitPrice?: string | null;
  /** Ausente em listas guardadas antes da foto existir. */
  imageUrl?: string | null;
  /** Texto do campo, como o cliente digitou ("12", "1,5"). */
  quantity: string;
}

export interface OrderFormState {
  status: "idle" | "success" | "error";
  message: string;
  /** Muda a cada envio que deu certo: a tela esvazia a lista. */
  submission?: number;
  /** Para onde a tela vai depois do envio: o pedido enviado (ou a lista deles). */
  redirectTo?: string;
}
