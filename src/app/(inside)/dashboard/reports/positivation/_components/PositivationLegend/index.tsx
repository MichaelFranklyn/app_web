import { Divider } from "@/components/Divider";
import { Title } from "@/components/Title";
import { Check, Minus } from "lucide-react";
import { ICON_SIZE } from "@/components/Icon";

/**
 * A legenda da matriz, à vista acima da tabela. Só no "?" ninguém achava o que
 * o "·" queria dizer, nem a diferença entre ele e o traço (crítica dos
 * Relatórios, 20/11/2026). Os símbolos são os mesmos da célula.
 */
export function PositivationLegend() {
  return (
    <>
      <ul
        aria-label="Legenda da matriz"
        className="flex flex-wrap items-center gap-x-16 gap-y-6 px-20 py-10"
      >
        <li className="inline-flex items-center gap-6">
          <Check
            size={ICON_SIZE.md}
            aria-hidden
            className="text-(--color-status-success)"
          />
          <Title as="span" variant="micro" color="muted">
            Comprou no período
          </Title>
        </li>
        <li className="inline-flex items-center gap-6">
          <Minus
            size={ICON_SIZE.md}
            aria-hidden
            className="text-(--color-action-text)"
          />
          <Title as="span" variant="micro" color="muted">
            Atende e não comprou
          </Title>
        </li>
        <li className="inline-flex items-center gap-6">
          <Title as="span" variant="body" color="muted2" aria-hidden>
            ·
          </Title>
          <Title as="span" variant="micro" color="muted">
            Não atende essa fábrica
          </Title>
        </li>
      </ul>
      <Divider.Root />
    </>
  );
}
