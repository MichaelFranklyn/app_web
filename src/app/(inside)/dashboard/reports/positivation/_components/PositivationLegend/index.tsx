import { Divider } from "@/components/Divider";
import { Title } from "@/components/Title";
import { Check, Minus } from "lucide-react";

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
        className="flex flex-wrap items-center gap-x-[16px] gap-y-[6px] px-[20px] py-[10px]"
      >
        <li className="inline-flex items-center gap-[6px]">
          <Check
            size={16}
            aria-hidden
            className="text-(--color-status-success)"
          />
          <Title as="span" variant="micro" color="muted">
            Comprou no período
          </Title>
        </li>
        <li className="inline-flex items-center gap-[6px]">
          <Minus size={16} aria-hidden className="text-(--color-action-text)" />
          <Title as="span" variant="micro" color="muted">
            Atende e não comprou
          </Title>
        </li>
        <li className="inline-flex items-center gap-[6px]">
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
