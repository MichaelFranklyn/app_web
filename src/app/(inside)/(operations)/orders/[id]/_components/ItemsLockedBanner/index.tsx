import { Title } from "@/components/Title";
import { Lock } from "lucide-react";

interface Props {
  /** Por que os itens não mudam mais — `null` enquanto ainda podem mudar. */
  reason: string | null;
}

/**
 * Explica por que os botões de item sumiram. Botão ausente sem explicação
 * parece defeito; aqui a frase diz o motivo e, no faturado, qual é a saída.
 *
 * Uma linha cinza, não um alerta: em todo pedido faturado (o caso comum) a
 * caixa azul aparecia acima dos itens e gritava como se houvesse problema
 * (crítica do detalhe do pedido, 23/11/2026). É explicação, não aviso.
 */
export function ItemsLockedBanner({ reason }: Props) {
  if (!reason) return null;

  return (
    <div className="flex items-start gap-6">
      <Lock
        size={14}
        aria-hidden
        className="mt-[3px] shrink-0 text-(--color-text-muted)"
      />
      <Title variant="body-sm" color="muted">
        Itens não podem mais ser alterados. {reason}
      </Title>
    </div>
  );
}
