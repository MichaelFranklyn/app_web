import { Badge } from "@/components/Badges";
import {
  SUPPORT_PRIORITY_COLOR,
  SUPPORT_PRIORITY_LABEL,
  SupportCase,
} from "@/utils/support";

interface Props {
  priority: SupportCase["priority"];
  className?: string;
}

/**
 * A tarja de urgência da reclamação, na lista.
 *
 * "Normal" não ganha tarja: é o caso comum, e uma pílula azul em toda linha
 * virava ruído que ensinava a ignorar a coluna (crítica de 23/11/2026). Só a
 * exceção — alta ou baixa — se destaca.
 */
export function SupportPriorityBadge({ priority, className }: Props) {
  if (priority === "NORMAL") return null;
  return (
    <Badge.Root
      color={SUPPORT_PRIORITY_COLOR[priority]}
      appearance="tinted"
      size="sm"
      className={className}
    >
      <Badge.Text>{SUPPORT_PRIORITY_LABEL[priority]}</Badge.Text>
    </Badge.Root>
  );
}
