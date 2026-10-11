import { Alert } from "@/components/Alert";
import { Lock } from "lucide-react";

interface Props {
  /** Por que os itens não mudam mais — `null` enquanto ainda podem mudar. */
  reason: string | null;
}

/**
 * Explica por que os botões de item sumiram. Botão ausente sem explicação
 * parece defeito; aqui a frase diz o motivo e, no faturado, qual é a saída.
 */
export function ItemsLockedBanner({ reason }: Props) {
  if (!reason) return null;

  return (
    <Alert.Root variant="info">
      <Alert.Icon icon={Lock} />
      <Alert.Content>
        <Alert.Title>
          Os itens deste pedido não podem mais ser alterados
        </Alert.Title>
        <Alert.Description>{reason}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
  );
}
