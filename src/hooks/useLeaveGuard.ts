"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/** Marca da entrada-sentinela que este hook põe no histórico. */
const SENTINEL = "__leaveGuard";

const isSentinel = (state: unknown) =>
  Boolean((state as Record<string, unknown> | null)?.[SENTINEL]);

/**
 * A tela está sobre a sentinela? Quem sai dela gravando (o redirect depois de
 * salvar) deve SUBSTITUIR a sentinela — senão o "Voltar" do destino cai numa
 * cópia da tela antes de chegar onde o usuário estava.
 */
export const isOnLeaveSentinel = () =>
  typeof window !== "undefined" && isSentinel(window.history.state);

/** Link que o App Router trataria como navegação interna, dentro desta aba. */
const internalTarget = (event: MouseEvent): string | null => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }
  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.hasAttribute("download")) return null;
  if (anchor.target && anchor.target !== "_self") return null;

  const url = new URL(anchor.href, window.location.href);
  // Outro site: quem avisa é o `beforeunload` do navegador.
  if (url.origin !== window.location.origin) return null;
  // Mesma tela (âncora na página): não sai de nada.
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return null;
  }
  return `${url.pathname}${url.search}${url.hash}`;
};

/**
 * Segura a saída de uma tela com trabalho não gravado e pergunta antes.
 *
 * Cobre as três portas de saída:
 * - recarregar/fechar a aba ou ir para outro site → aviso nativo do navegador
 *   (`beforeunload`; o texto é do navegador, não dá para trocar);
 * - clicar num link interno (sidebar, caminho do topo) → o clique é barrado e
 *   vira `pending`, para a tela confirmar no seu próprio modal;
 * - botão Voltar → uma entrada-sentinela no histórico absorve o primeiro
 *   "voltar"; ele vira `pending` e, confirmado, o histórico recua de verdade.
 *
 * Navegação feita pelo código (o "Cancelar" da tela) passa por `navigate(href)`
 * — ou `guard(acao)`, quando a saída não é uma rota.
 * O que NÃO passa por aqui — de propósito — é o redirect depois de gravar: ele
 * não usa link nem histórico para trás.
 *
 * A sentinela usa `history.pushState` sem URL, que o App Router do Next aceita:
 * ele copia o estado interno para a entrada nova, e voltar dela para a tela é
 * uma travessia para a mesma rota (não recarrega nada).
 */
export function useLeaveGuard(isDirty: boolean) {
  const router = useRouter();
  const [pending, setPending] = useState<(() => void) | null>(null);

  // Os ouvintes leem o valor atual, não o da montagem.
  const dirtyRef = useRef(isDirty);
  // Já confirmou a saída: nada mais é barrado até a tela sumir.
  const releasedRef = useRef(false);
  // Esta tela tem uma sentinela à frente no histórico.
  const sentinelRef = useRef(false);

  useEffect(() => {
    dirtyRef.current = isDirty;
  }, [isDirty]);

  const ask = useCallback((leave: () => void) => {
    setPending(() => leave);
  }, []);

  // Saída confirmada para outra rota: sobre a sentinela, o destino toma o lugar
  // dela — o "Voltar" de lá cai nesta tela, e não numa cópia dela.
  const goTo = useCallback(
    (href: string) => {
      if (isOnLeaveSentinel()) router.replace(href);
      else router.push(href);
    },
    [router]
  );

  // Sentinela: armada na primeira vez que a tela fica com algo a perder.
  useEffect(() => {
    if (!isDirty || isSentinel(window.history.state)) return;
    window.history.pushState({ [SENTINEL]: true }, "");
    sentinelRef.current = true;
  }, [isDirty]);

  // Botão Voltar. Fica montado mesmo sem nada a perder: se a sentinela ficou
  // para trás (o vendedor apagou os itens), o "voltar" tem de seguir sozinho em
  // vez de exigir dois cliques.
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (!sentinelRef.current || isSentinel(event.state)) return;
      // Saiu da sentinela para trás: está na entrada da própria tela.
      sentinelRef.current = false;
      if (!dirtyRef.current || releasedRef.current) {
        window.history.back();
        return;
      }
      // Rearma e pergunta; confirmado, recua a tela E a sentinela nova.
      window.history.pushState({ [SENTINEL]: true }, "");
      sentinelRef.current = true;
      ask(() => window.history.go(-2));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [ask]);

  // Recarregar, fechar a aba, sair para outro site.
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (releasedRef.current) return;
      event.preventDefault();
      // Navegadores antigos só mostram o aviso com `returnValue` preenchido.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // Links internos. Na fase de CAPTURA, no documento: roda antes do `onClick`
  // do `<Link>` do Next, que já teria navegado.
  useEffect(() => {
    if (!isDirty) return;
    const onClick = (event: MouseEvent) => {
      if (releasedRef.current) return;
      const href = internalTarget(event);
      if (!href) return;
      event.preventDefault();
      event.stopPropagation();
      ask(() => goTo(href));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [isDirty, ask, goTo]);

  /** Navegação do próprio código: pergunta antes se há algo a perder. */
  const guard = useCallback(
    (leave: () => void) => {
      if (dirtyRef.current && !releasedRef.current) ask(leave);
      else leave();
    },
    [ask]
  );

  /** Ir para outra rota pelo código (o "Cancelar"), perguntando antes. */
  const navigate = useCallback(
    (href: string) => guard(() => goTo(href)),
    [guard, goTo]
  );

  /** "Sair mesmo assim": solta a guarda e segue para onde ia. */
  const confirmLeave = useCallback(() => {
    releasedRef.current = true;
    const leave = pending;
    setPending(null);
    leave?.();
  }, [pending]);

  /** "Continuar aqui". */
  const stay = useCallback(() => setPending(null), []);

  return {
    guard,
    navigate,
    isAsking: pending !== null,
    confirmLeave,
    stay,
  };
}
