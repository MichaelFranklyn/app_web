"use client";

import { Input } from "@/components/Input";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { SentOrdersTab, sentOrdersHref } from "../../utils";

interface SentOrdersSearchProps {
  token: string;
  tab: SentOrdersTab;
  search: string;
}

/** Espera o cliente parar de digitar antes de buscar. */
const TYPING_PAUSE_MS = 400;

/**
 * A busca da lista de pedidos: fábrica ou número do pedido. Mesmo jeito da
 * busca de produto do "Fazer pedido": troca o endereço (`?busca=`) ao parar de
 * digitar ou no Enter, e volta para a página 1. Sem JavaScript, o form manda
 * por GET para o mesmo endereço — a busca funciona igual.
 */
export function SentOrdersSearch({
  token,
  tab,
  search,
}: SentOrdersSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(search);
  const [isSearching, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPending = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const go = (term: string) => {
    cancelPending();
    if (term.trim() === search.trim()) return;
    startTransition(() =>
      router.replace(sentOrdersHref(token, 1, tab, term), { scroll: false })
    );
  };

  useEffect(() => cancelPending, []);

  const handleChange = (next: string) => {
    setValue(next);
    cancelPending();
    // Apagou tudo: volta a lista inteira sem esperar.
    if (!next.trim()) return go("");
    timer.current = setTimeout(() => go(next), TYPING_PAUSE_MS);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    go(value);
  };

  return (
    <form
      role="search"
      method="get"
      action={`/p/${token}/enviados`}
      onSubmit={handleSubmit}
      className="tablet:w-[280px] w-full"
    >
      {tab !== "todos" ? <input type="hidden" name="tipo" value={tab} /> : null}
      <Input.Search
        id="busca"
        name="busca"
        aria-label="Buscar pedido por fábrica ou número"
        placeholder="Buscar por fábrica ou número"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        containerClassName="w-full"
        aria-busy={isSearching}
      />
    </form>
  );
}
