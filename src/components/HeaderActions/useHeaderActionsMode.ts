"use client";

import { RefObject, useEffect, useId, useLayoutEffect, useState } from "react";
import { HeaderActionsNeed, useHeaderActionsGroup } from "./Group";

// Estágios de exibição das ações do header, do mais folgado ao mais apertado.
export type HeaderActionsMode = "full" | "icon" | "column";

// useLayoutEffect no cliente (mede e converge antes de pintar, sem flicker);
// useEffect no servidor (evita o warning de SSR — lá não há DOM para medir).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface Params {
  /** O header em si (fonte da largura disponível). */
  headerRef: RefObject<HTMLDivElement | null>;
  /**
   * Conteúdo (título/eyebrow) que divide a linha com as ações; reivindica sua
   * largura natural. Omitir quando as ações têm a linha só para si (ex.: o
   * PanelHeader, onde elas ficam abaixo do título) — aí a régua é só o espaço
   * que as próprias ações ocupam.
   */
  contentRef?: RefObject<HTMLDivElement | null>;
  /** Wrapper das ações; medido em cada estágio. Null = sem ações. */
  actionsRef: RefObject<HTMLDivElement | null>;
}

const INITIAL_NEED: HeaderActionsNeed = { full: 0, icon: 0 };

/**
 * Decide o estágio das ações do header medindo o conteúdo REAL (não breakpoints
 * de pixel fixos): mantém o item no maior estágio que ainda couber ao lado do
 * título (na largura natural dele).
 *
 *   • full   → cabe título + gap + ações(ícone + texto).
 *   • icon   → não cabe com texto, mas cabe só com ícone.
 *   • column → não cabe nem só com ícone: ações descem e empilham em coluna.
 *
 * Dentro de um HeaderActionsGroup, todos os headers usam o PIOR caso do grupo,
 * então cards de mesma largura escolhem o mesmo estágio (coerente entre si).
 */
export function useHeaderActionsMode({
  headerRef,
  contentRef,
  actionsRef,
}: Params): HeaderActionsMode {
  const id = useId();
  const group = useHeaderActionsGroup();
  const report = group?.report;

  // Espaço disponível no header e quanto ESTE header precisa em cada estágio.
  const [available, setAvailable] = useState(0);
  const [ownNeed, setOwnNeed] = useState<HeaderActionsNeed>(INITIAL_NEED);

  useIsomorphicLayoutEffect(() => {
    const header = headerRef.current;
    const actions = actionsRef.current;
    if (!header || !actions) return;

    let raf = 0;

    const measure = () => {
      const cs = getComputedStyle(header);
      const padX =
        parseFloat(cs.paddingLeft || "0") + parseFloat(cs.paddingRight || "0");
      const avail = header.clientWidth - padX;
      if (avail <= 0) return;

      // Largura natural do conteúdo (título numa linha). Precisa neutralizar o
      // flex-1: senão o flex-grow ignora o width e devolve a largura já encolhida
      // (medição circular). O título ainda pode quebrar em várias linhas no
      // estágio column; aqui medimos só quanto ele quer na horizontal.
      // Sem conteúdo ao lado, não há título nem gap a descontar.
      let contentNatural = 0;
      let gap = 0;
      const content = contentRef?.current;
      if (content) {
        gap = parseFloat(cs.columnGap || cs.gap || "0") || 0;
        const prevFlex = content.style.flex;
        const prevWidth = content.style.width;
        content.style.flex = "none";
        content.style.width = "max-content";
        contentNatural = content.offsetWidth;
        content.style.flex = prevFlex;
        content.style.width = prevWidth;
      }

      // Largura das ações em cada estágio de linha, alternando o atributo (o CSS
      // reage na hora; leitura síncrona, sem repintar).
      const prev = header.getAttribute("data-actions-mode");
      header.setAttribute("data-actions-mode", "full");
      const fullWidth = actions.offsetWidth;
      header.setAttribute("data-actions-mode", "icon");
      const iconWidth = actions.offsetWidth;
      if (prev) header.setAttribute("data-actions-mode", prev);

      setAvailable(avail);
      setOwnNeed((prevNeed) => {
        const full = contentNatural + gap + fullWidth;
        const icon = contentNatural + gap + iconWidth;
        return prevNeed.full === full && prevNeed.icon === icon
          ? prevNeed
          : { full, icon };
      });
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(header);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [headerRef, contentRef, actionsRef]);

  // Reporta ao grupo (se houver). Em layout effect para convergir antes de pintar.
  useIsomorphicLayoutEffect(() => {
    if (!report) return;
    report(id, ownNeed);
    return () => report(id, null);
  }, [report, id, ownNeed]);

  // Régua = pior caso do grupo (coerência entre irmãos) ou o próprio (standalone).
  const need = group ? group.maxNeed : ownNeed;
  if (available >= need.full) return "full";
  if (available >= need.icon) return "icon";
  return "column";
}
