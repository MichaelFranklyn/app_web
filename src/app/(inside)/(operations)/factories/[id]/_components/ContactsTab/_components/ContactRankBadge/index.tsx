import { Badge } from "@/components/Badges";

interface Props {
  isPrimary: boolean;
  className?: string;
}

/**
 * Tarja do contato: "Principal" (quem recebe o pedido) ou "Secundário". O
 * secundário também ganha tarja para a lista não parecer ter só um contato
 * "marcado" e os outros sem informação (14/11/2026).
 */
export function ContactRankBadge({ isPrimary, className }: Props) {
  return (
    <Badge.Root
      color={isPrimary ? "blue" : "neutral"}
      appearance="tinted"
      className={className}
    >
      <Badge.Text>{isPrimary ? "Principal" : "Secundário"}</Badge.Text>
    </Badge.Root>
  );
}
