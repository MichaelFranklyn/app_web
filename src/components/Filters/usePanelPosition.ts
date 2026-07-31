"use client";

import { RefObject, useState } from "react";

const PANEL_WIDTH = 320;
const GAP = 4;
/** Respiro até a borda da janela, para o painel não encostar nela. */
const VIEWPORT_MARGIN = 8;
/**
 * Altura abaixo da qual o painel fica inútil (mostraria um campo e meio). Se
 * não houver nem isso embaixo, vale mais abrir para cima — desde que lá caiba
 * mais do que aqui.
 */
const MIN_USABLE_HEIGHT = 260;

/**
 * Coordenadas do painel de filtros a partir do botão que o abre.
 *
 * Mesma estratégia do InputDate: calcula uma vez na abertura, alinhando o
 * painel pela DIREITA do botão (é o canto que fica preso ao header da tabela) e
 * puxando-o para dentro da tela quando não há espaço à esquerda. Dentro de um
 * Modal, as coordenadas são relativas à âncora — lá o painel é `absolute`,
 * porque o `transform` do Dialog quebra o `fixed`.
 *
 * Na vertical, o painel se ajusta ao espaço que existe: ele cresce com a
 * quantidade de filtros e vive num portal, então passar do rodapé da janela o
 * tornaria inalcançável (rolar a página não traz de volta um elemento `fixed`).
 * Por isso a altura é limitada ao que cabe, com rolagem por dentro, e o painel
 * vira para cima quando é lá que sobra espaço.
 */
export function usePanelPosition(
  triggerRef: RefObject<HTMLElement | null>,
  anchor: Element | null
) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  const compute = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    // Alinhado à direita, a não ser que isso jogue o painel para fora da tela.
    const overflowsLeft = rect.right - PANEL_WIDTH < 8;

    const spaceBelow = window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - GAP - VIEWPORT_MARGIN;
    const openTop = spaceBelow < MIN_USABLE_HEIGHT && spaceAbove > spaceBelow;

    const vertical: React.CSSProperties = {
      maxHeight: Math.max(openTop ? spaceAbove : spaceBelow, 0),
      overflowY: "auto",
      // Abrindo para cima, `top` é a borda SUPERIOR do botão: o translate sobe
      // o painel inteiro, cuja altura só se conhece depois de renderizar.
      ...(openTop
        ? { transform: `translateY(-100%) translateY(-${GAP}px)` }
        : {}),
    };

    if (anchor) {
      const anchorRect = anchor.getBoundingClientRect();
      setStyle({
        top: openTop
          ? rect.top - anchorRect.top
          : rect.bottom - anchorRect.top + GAP,
        ...(overflowsLeft
          ? { left: rect.left - anchorRect.left }
          : { right: anchorRect.right - rect.right }),
        ...vertical,
      });
      return;
    }

    setStyle({
      top: openTop ? rect.top : rect.bottom + GAP,
      ...(overflowsLeft
        ? { left: rect.left }
        : { right: window.innerWidth - rect.right }),
      ...vertical,
    });
  };

  return { style, compute };
}
