import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { Viability, stockTiming, viabilityNote } from "@/utils/viability";
import { formatMoney } from "@/utils/format/masks";

interface Props {
  viability: Viability | null | undefined;
  /** Sem a lista de complemento — para onde o aviso precisa caber em uma linha. */
  compact?: boolean;
}

const TONE_CLASS = {
  amber: "border-(--amber) bg-(--amber)/8",
  red: "border-(--red) bg-(--red)/8",
  green: "border-(--green) bg-(--green)/8",
} as const;

/**
 * O aviso de pedido mínimo dentro do card da visita.
 *
 * Responde à pergunta que o vendedor só conseguia fazer no balcão, tarde: "dá
 * pedido nesse cliente hoje?". Quando falta pouco, mostra QUANTO falta e o que
 * levar para fechar — é a venda a mais que hoje ninguém faz. Quando não fecha
 * de jeito nenhum, mostra o dia em que fecha, para a ida ser remarcada em vez
 * de perdida.
 *
 * Silencioso quando o pedido fecha: o estado normal não é notícia, e um aviso
 * que aparece sempre deixa de ser lido.
 */
export function ViabilityNote({ viability, compact = false }: Props) {
  const note = viabilityNote(viability);
  if (!note || !viability) return null;

  const suggestions = compact ? [] : viability.suggestions;

  return (
    <div
      className={cn("mt-6 rounded-(--r-sm) border p-8", TONE_CLASS[note.tone])}
    >
      <Title variant="micro" weight="bold">
        {note.label}
      </Title>
      <Title variant="body-sm" className="mt-[2px]">
        {note.message}
      </Title>
      {note.action && (
        <Title variant="body-sm" color="muted" className="mt-4">
          {note.action}
        </Title>
      )}
      {suggestions.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {suggestions.map((suggestion) => {
            const timing = stockTiming(suggestion.daysUntilOut);
            return (
              <li key={suggestion.productId} className="flex flex-wrap gap-6">
                <Title variant="body-sm" weight="medium">
                  {suggestion.productName ?? suggestion.sku ?? "Produto"}
                </Title>
                <Title variant="body-sm" color="muted2">
                  {suggestion.quantity} un · {formatMoney(suggestion.value)}
                  {timing ? ` · ${timing}` : ""}
                </Title>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
