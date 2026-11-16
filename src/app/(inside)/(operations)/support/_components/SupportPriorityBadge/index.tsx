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

/** A tarja de urgência da reclamação, na lista. */
export function SupportPriorityBadge({ priority, className }: Props) {
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
