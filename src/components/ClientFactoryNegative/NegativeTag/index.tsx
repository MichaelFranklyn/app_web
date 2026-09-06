"use client";

import { Badge } from "@/components/Badges";
import { Tooltip } from "@/components/Tooltip";
import { Ban } from "lucide-react";
import { negativeTooltip } from "../utils";

interface Props {
  isNegative: boolean;
  negativeSince?: string | null;
  negativeReason?: string | null;
  /** Rótulo do estado normal. Nulo esconde a tarja quando não há negativação. */
  activeLabel?: string | null;
}

/**
 * A tarja "Negativado" de um vínculo cliente × fábrica.
 *
 * Ícone E palavra, como as outras marcas da rotina (`FixedVisitTag`): o público
 * é idoso e um símbolo sozinho não se lê de relance. O porquê e o desde quando
 * ficam no tooltip — a linha da tabela não comporta a frase inteira, mas o
 * vendedor precisa alcançá-la sem sair da tela.
 */
export function NegativeTag({
  isNegative,
  negativeSince = null,
  negativeReason = null,
  activeLabel = "Ativo",
}: Props) {
  if (!isNegative) {
    if (!activeLabel) return null;
    return (
      <Badge.Root color="green" appearance="tinted">
        <Badge.Text>{activeLabel}</Badge.Text>
      </Badge.Root>
    );
  }

  return (
    <Tooltip content={negativeTooltip(negativeSince, negativeReason)}>
      <span className="inline-flex">
        <Badge.Root color="red" appearance="tinted">
          <Badge.Icon>
            <Ban />
          </Badge.Icon>
          <Badge.Text>Negativado</Badge.Text>
        </Badge.Root>
      </span>
    </Tooltip>
  );
}
