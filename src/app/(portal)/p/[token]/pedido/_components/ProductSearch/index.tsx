"use client";

import { Input } from "@/components/Input";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { orderHref } from "../../utils";

interface ProductSearchProps {
  token: string;
  search: string | null;
  factoryId: string;
}

/** Espera o cliente parar de digitar antes de buscar. */
const TYPING_PAUSE_MS = 400;

/**
 * A busca de produto do pedido. Troca o endereço (`?q=`) pelo roteador, sem
 * recarregar a página: a tela não pisca e a "Minha lista" fica onde está.
 *
 * Busca sozinha quando o cliente para de digitar; Enter busca na hora.
 * Campo vazio (apagado ou no "x") volta a listar todos os produtos.
 */
export function ProductSearch({
  token,
  search,
  factoryId,
}: ProductSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(search ?? "");
  const [isSearching, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPending = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const go = (term: string) => {
    cancelPending();
    const query = term.trim() || null;
    if (query === (search ?? null)) return;
    const href = orderHref(token, query, 1, factoryId).replace(/#.*$/, "");
    startTransition(() => router.replace(href, { scroll: false }));
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

  // Mesmo campo das listas do escritório: sem rótulo visível (a lupa e o
  // placeholder dizem o que é) e sem botão — busca ao parar de digitar ou no
  // Enter.
  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="tablet:w-[280px] w-full"
    >
      <Input.Search
        id="q"
        name="q"
        aria-label="Buscar produto"
        placeholder="Buscar por nome ou código"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        containerClassName="w-full"
        aria-busy={isSearching}
      />
    </form>
  );
}
