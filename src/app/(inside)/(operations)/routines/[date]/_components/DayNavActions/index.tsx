import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Props {
  prevHref: string;
  nextHref: string;
}

/** Base de botão `size="sm"`, para os links ficarem da altura do "Imprimir rota". */
const BASE =
  "inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-(--r-sm) border border-(--border) font-head text-[13px] font-(--weight-bold) text-(--text2) transition-colors hover:border-(--border2) hover:text-(--text)";

/**
 * Sair do dia e andar entre os dias — junto das ações da rota, não numa linha
 * própria acima do título: é tudo comando de barra de ferramentas, e separado
 * o "voltar" competia com o cabeçalho pela primeira leitura da página.
 */
export function DayNavActions({ prevHref, nextHref }: Props) {
  return (
    <>
      <Link
        href="/routines"
        className={`${BASE} min-h-[32.8px] px-[12px] py-[5px]`}
      >
        <ChevronLeft size={14} className="shrink-0" />
        Voltar para a rotina
      </Link>
      <Link
        href={prevHref}
        aria-label="Dia anterior"
        title="Dia anterior"
        className={`${BASE} h-[32.8px] w-[32.8px]`}
      >
        <ChevronLeft size={16} />
      </Link>
      <Link
        href={nextHref}
        aria-label="Próximo dia"
        title="Próximo dia"
        className={`${BASE} h-[32.8px] w-[32.8px]`}
      >
        <ChevronRight size={16} />
      </Link>
    </>
  );
}
