import { Alert } from "@/components/Alert";

interface SentOrderSuccessProps {
  /** Mais de uma fábrica: o envio virou um pedido para cada. */
  count?: number;
}

/** A confirmação logo depois do envio — a mesma na lista e no detalhe. */
export function SentOrderSuccess({ count = 1 }: SentOrderSuccessProps) {
  return (
    <Alert.Root variant="success">
      <Alert.Description>
        {count > 1
          ? "Pedidos enviados! Cada fábrica foi para o seu representante. Acompanhe aqui a resposta."
          : "Pedido enviado! O representante já recebeu. Acompanhe aqui a resposta dele."}
      </Alert.Description>
    </Alert.Root>
  );
}
