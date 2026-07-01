"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FlowStep } from "../interface";
import { TourCard } from "./TourCard";

const GAP = 12;
const MARGIN = 16;
const SPOTLIGHT_PADDING = 6;
const OVERLAY_COLOR = "rgba(15, 23, 42, 0.55)";

interface TourLayerProps {
  step: FlowStep;
  current: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  isExiting?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  // Chamado quando o step TEM seletor mas o alvo não aparece dentro do orçamento do
  // waitFor (~3s) — ou quando o conteúdo exigido (requireSelector) não existe no DOM.
  onTargetMissing?: () => void;
  // Chamado quando o alvo (e o conteúdo exigido, se houver) foi encontrado e o step
  // vai de fato aparecer.
  onTargetFound?: () => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

export const TourLayer = ({
  step,
  current,
  total,
  isFirst,
  isLast,
  isExiting = false,
  onPrev,
  onNext,
  onClose,
  onTargetMissing,
  onTargetFound,
}: TourLayerProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  // Última referência dos callbacks: lida no momento do disparo sem incluí-los nas
  // deps do efeito de busca (que só depende de element/clickBefore/seletores).
  const onTargetMissingRef = useRef(onTargetMissing);
  onTargetMissingRef.current = onTargetMissing;
  const onTargetFoundRef = useRef(onTargetFound);
  onTargetFoundRef.current = onTargetFound;
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  // Fade-in: o overlay aparece já na montagem; a caixa só revela (fade) depois de
  // posicionada, evitando que ela "desça do topo" partindo do top:-9999.
  const [overlayShown, setOverlayShown] = useState(false);
  const [cardShown, setCardShown] = useState(false);

  // Localiza e acompanha o elemento-alvo (scroll/resize/smooth-scroll).
  useEffect(() => {
    const selector = step.element;
    const clicks = step.clickBefore
      ? Array.isArray(step.clickBefore)
        ? step.clickBefore
        : [step.clickBefore]
      : [];

    let cancelled = false;
    const timers: number[] = [];
    let detach: (() => void) | null = null;

    // Alvo já visível na tela? (rect com área > 0).
    const isVisible = (sel: string) => {
      const node = document.querySelector(sel) as HTMLElement | null;
      if (!node) return false;
      const r = node.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };

    // Espera um seletor existir (até ~3s) e chama cb(node) — node null se desistir.
    const waitFor = (sel: string, cb: (node: HTMLElement | null) => void) => {
      let attempts = 0;
      const tick = () => {
        if (cancelled) return;
        const node = document.querySelector(sel) as HTMLElement | null;
        if (node || attempts > 20) {
          cb(node);
          return;
        }
        attempts += 1;
        timers.push(window.setTimeout(tick, 150));
      };
      tick();
    };

    const attach = (node: HTMLElement) => {
      // Scroll instantâneo: medimos a região já na posição final e só fazemos fade.
      node.scrollIntoView({
        block: "center",
        behavior: "instant" as ScrollBehavior,
      });

      const update = () => setRect(node.getBoundingClientRect());
      update();

      const polling = window.setInterval(update, 100);
      const stopPolling = window.setTimeout(
        () => window.clearInterval(polling),
        700
      );
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      const observer = new ResizeObserver(update);
      observer.observe(node);

      detach = () => {
        window.clearInterval(polling);
        window.clearTimeout(stopPolling);
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
        observer.disconnect();
      };
    };

    const findTarget = () => {
      if (!selector) {
        setRect(null);
        return;
      }
      waitFor(selector, (node) => {
        if (node) {
          onTargetFoundRef.current?.();
          attach(node);
          return;
        }
        // Alvo nunca montou dentro do orçamento do waitFor (~3s): sinaliza ao motor
        // para pular este step em vez de deixar o overlay escuro sem caixa.
        setRect(null);
        onTargetMissingRef.current?.();
      });
    };

    // Clica os seletores em sequência (cada um aguardado), depois mira o alvo.
    const runClicks = (index: number) => {
      if (cancelled) return;
      if (index >= clicks.length) {
        findTarget();
        return;
      }
      waitFor(clicks[index], (node) => {
        node?.click();
        timers.push(window.setTimeout(() => runClicks(index + 1), 120));
      });
    };

    // Decisão de pular ANTES do clickBefore (e antes de esperar o alvo).
    const requiredMissing =
      step.requireSelector && !document.querySelector(step.requireSelector);
    const blockedByPresent =
      step.skipIfSelector && document.querySelector(step.skipIfSelector);

    if (requiredMissing || blockedByPresent) {
      setRect(null);
      onTargetMissingRef.current?.();
    } else if (!clicks.length) {
      findTarget();
    } else if (
      selector &&
      isVisible(selector) &&
      (!step.requireSelector || isVisible(step.requireSelector))
    ) {
      // Alvo (e conteúdo exigido) já visível → não reexecuta os cliques.
      findTarget();
    } else {
      // Defere os cliques 1 tick: em dev o StrictMode monta 2x; o cleanup do 1º
      // setup cancela este timer antes de ele rodar, então só o 2º executa.
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          runClicks(0);
        }, 0)
      );
    }

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
      detach?.();
    };
  }, [
    step.element,
    step.clickBefore,
    step.requireSelector,
    step.skipIfSelector,
  ]);

  // Calcula a posição da caixa a partir do rect do alvo e do tamanho da caixa.
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const cardHeight = card.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Sem elemento → centralizado (boas-vindas).
    if (!step.element) {
      setPos({ top: vh / 2 - cardHeight / 2, left: vw / 2 - cardWidth / 2 });
      return;
    }

    // Step com elemento mas rect ainda não medido → mantém escondido (sem flash).
    if (!rect) return;

    const side = step.side ?? "bottom";
    const align = step.align ?? "center";
    let top = 0;
    let left = 0;

    if (side === "bottom" || side === "top") {
      top = side === "bottom" ? rect.bottom + GAP : rect.top - cardHeight - GAP;
      // Vira para o lado oposto se não couber.
      if (
        side === "bottom" &&
        top + cardHeight > vh - MARGIN &&
        rect.top - cardHeight - GAP > MARGIN
      ) {
        top = rect.top - cardHeight - GAP;
      }
      if (
        side === "top" &&
        top < MARGIN &&
        rect.bottom + GAP + cardHeight < vh - MARGIN
      ) {
        top = rect.bottom + GAP;
      }
      left =
        align === "start"
          ? rect.left
          : align === "end"
            ? rect.right - cardWidth
            : rect.left + rect.width / 2 - cardWidth / 2;
    } else {
      left = side === "right" ? rect.right + GAP : rect.left - cardWidth - GAP;
      if (
        side === "right" &&
        left + cardWidth > vw - MARGIN &&
        rect.left - cardWidth - GAP > MARGIN
      ) {
        left = rect.left - cardWidth - GAP;
      }
      if (
        side === "left" &&
        left < MARGIN &&
        rect.right + GAP + cardWidth < vw - MARGIN
      ) {
        left = rect.right + GAP;
      }
      top =
        align === "start"
          ? rect.top
          : align === "end"
            ? rect.bottom - cardHeight
            : rect.top + rect.height / 2 - cardHeight / 2;
    }

    setPos({
      top: clamp(top, MARGIN, vh - cardHeight - MARGIN),
      left: clamp(left, MARGIN, vw - cardWidth - MARGIN),
    });
  }, [rect, step.element, step.side, step.align, current]);

  // Esc fecha o tour.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Dispara o fade-in do overlay logo na montagem (1 frame após pintar opacity 0).
  useEffect(() => {
    const id = requestAnimationFrame(() => setOverlayShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Revela a caixa (fade) só quando já há posição calculada — nunca anima top/left.
  useEffect(() => {
    if (!pos) return;
    const id = requestAnimationFrame(() => setCardShown(true));
    return () => cancelAnimationFrame(id);
  }, [pos]);

  const visible = !isExiting && overlayShown;

  return createPortal(
    <>
      {/* Overlay captura cliques fora (fecha) e desenha o escurecimento. */}
      <div
        className="fixed inset-0 z-[9998] transition-opacity duration-200 ease-out"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onClose}
      >
        {rect ? (
          // Sem transição de posição: o spotlight acompanha o alvo instantaneamente.
          <div
            className="pointer-events-none absolute rounded-sm"
            style={{
              top: rect.top - SPOTLIGHT_PADDING,
              left: rect.left - SPOTLIGHT_PADDING,
              width: rect.width + SPOTLIGHT_PADDING * 2,
              height: rect.height + SPOTLIGHT_PADDING * 2,
              boxShadow: `0 0 0 9999px ${OVERLAY_COLOR}`,
            }}
          />
        ) : !step.element ? (
          // Step de boas-vindas (sem alvo): escurece a tela inteira atrás da caixa.
          <div
            className="absolute inset-0"
            style={{ background: OVERLAY_COLOR }}
          />
        ) : null}
      </div>

      {/* Caixa do tour (design system), posicionada por nós. */}
      <div
        ref={cardRef}
        className="fixed z-[9999] transition-opacity duration-200 ease-out"
        style={{
          top: pos?.top ?? -9999,
          left: pos?.left ?? -9999,
          opacity: cardShown && visible ? 1 : 0,
          pointerEvents: cardShown && visible ? "auto" : "none",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <TourCard
          title={step.title}
          description={step.description}
          current={current}
          total={total}
          isFirst={isFirst}
          isLast={isLast}
          onPrev={onPrev}
          onNext={onNext}
          onClose={onClose}
        />
      </div>
    </>,
    document.body
  );
};
