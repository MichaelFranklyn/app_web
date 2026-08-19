"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SelectionBarProps } from "./interface";
import { selectionBarStyles } from "./style";

export type { SelectionBarProps } from "./interface";

/**
 * Barra de atalhos do que está selecionado numa tabela.
 *
 * Fica fixa na base da JANELA, e não no fim da tabela, porque é lá que o
 * usuário está olhando: quem marca a primeira linha, no topo de um cartão com
 * trinta parcelas, precisa ver a resposta na hora. Presa ao fim do cartão, a
 * barra nascia fora da tela e a seleção parecia não fazer nada.
 *
 * Vai num portal: o cartão da tabela tem `overflow-hidden`, e o `position:
 * fixed` de dentro dele seria cortado.
 *
 * @example
 * <SelectionBar
 *   count={ids.length}
 *   noun={{ singular: "parcela selecionada", plural: "parcelas selecionadas" }}
 *   scopeLabel="Fábrica Alfa"
 *   onClear={limpar}
 * >
 *   <Button.Root ...>Marcar como pago</Button.Root>
 * </SelectionBar>
 */
export function SelectionBar({
  count,
  noun,
  scopeLabel,
  children,
  onClear,
  clearLabel = "Limpar seleção",
}: SelectionBarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Esc desfaz a seleção, como em qualquer lista de e-mail: é a saída que a
  // pessoa tenta antes de procurar o botão.
  useEffect(() => {
    if (count === 0) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClear();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, onClear]);

  if (!mounted || count === 0) return null;

  return createPortal(
    <div
      className={selectionBarStyles.container}
      role="region"
      aria-label="Ações da seleção"
    >
      <div className={selectionBarStyles.bar}>
        <div className={selectionBarStyles.count}>
          {/* `aria-live`: quem usa leitor de tela ouve a contagem mudar sem
              precisar caçar a barra depois de cada clique. */}
          <Title variant="body-sm" weight="semibold" aria-live="polite">
            {count} {count === 1 ? noun.singular : noun.plural}
          </Title>
          {scopeLabel && (
            <Title variant="caption" color="muted" className="truncate">
              {scopeLabel}
            </Title>
          )}
        </div>

        <div className={selectionBarStyles.actions}>
          {children}
          <Button.Root
            appearance="ghost"
            color="neutral"
            size="sm"
            noUppercase
            onClick={onClear}
          >
            <Button.Icon icon={X} />
            <Button.Title>{clearLabel}</Button.Title>
          </Button.Root>
        </div>
      </div>
    </div>,
    document.body
  );
}
