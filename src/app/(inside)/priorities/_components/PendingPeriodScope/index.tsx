"use client";

import { Input } from "@/components/Input";
import { parseLocalDate, toIsoDate } from "@/utils/format/date";
import { usePathname, useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";

/**
 * O período dos cartões de Pendências, no cabeçalho da central (18/11/2026).
 * Era o único campo do painel "Filtros" ao lado da nota — um painel inteiro
 * para um filtro só; o usuário pediu o campo no topo, junto do vendedor.
 *
 * Escreve `?dueFrom=`/`?dueTo=` pela History API, como o `SellerScope`: o
 * `useTableFilters` da aba lê a URL e o Apollo repinta, sem ida ao servidor.
 */
export function PendingPeriodScope() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const from = searchParams.get("dueFrom");
  const to = searchParams.get("dueTo");

  const value: DateRange | null =
    from || to
      ? {
          from: parseLocalDate(from ?? undefined) ?? undefined,
          to: parseLocalDate(to ?? undefined) ?? undefined,
        }
      : null;

  const onChange = (next: Date | DateRange | null | undefined) => {
    // O calendário devolve um DateRange; limpar devolve null/undefined.
    const picked = next && "from" in next ? next : null;
    const params = new URLSearchParams(searchParams.toString());
    const patch = {
      dueFrom: toIsoDate(picked?.from),
      dueTo: toIsoDate(picked?.to),
    };
    Object.entries(patch).forEach(([key, iso]) => {
      if (iso) params.set(key, iso);
      else params.delete(key);
    });
    // Outro período, outra lista: a página virada não vale mais.
    params.delete("page");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${pathname}?${query}` : pathname
    );
  };

  return (
    <div className="tablet:w-[260px] w-full" data-tour="pending-filters">
      <Input.Date
        size="sm"
        variant="range"
        aria-label="Período dos cartões"
        // É o recorte em vigor, não um campo vazio: vai escrito como valor.
        emptyLabel="Vencidas e próximos 7 dias"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
