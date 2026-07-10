"use client";

import React from "react";

// Largura (px) que um header precisa para caber, ao lado do título natural, em
// cada estágio de linha: `full` = botão com texto; `icon` = só ícone.
export interface HeaderActionsNeed {
  full: number;
  icon: number;
}

interface GroupContextValue {
  /** Um header informa quanto precisa (ou null ao desmontar). */
  report: (id: string, need: HeaderActionsNeed | null) => void;
  /** Pior caso do grupo — o header mais exigente manda em todos. */
  maxNeed: HeaderActionsNeed;
}

const HeaderActionsGroupContext = React.createContext<GroupContextValue | null>(
  null
);

/**
 * Coordena o estágio (full/icon/column) de vários `Card.Header`/`Table.CardHead`
 * que dividem o mesmo grupo (ex.: cards lado a lado num grid). Sem coordenação,
 * cada card decidiria sozinho pela largura do próprio título e ficariam
 * incoerentes entre si (um com texto, o vizinho só ícone, na mesma largura).
 *
 * Cada header reporta o espaço de que precisa; o grupo expõe o PIOR caso, e como
 * todos têm a mesma largura disponível, todos escolhem o mesmo estágio — coerente
 * e sem overflow (o título mais comprido dita a régua).
 */
export function HeaderActionsGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  const needsRef = React.useRef<Map<string, HeaderActionsNeed>>(new Map());
  const [maxNeed, setMaxNeed] = React.useState<HeaderActionsNeed>({
    full: 0,
    icon: 0,
  });

  const report = React.useCallback(
    (id: string, need: HeaderActionsNeed | null) => {
      if (need === null) needsRef.current.delete(id);
      else needsRef.current.set(id, need);

      let full = 0;
      let icon = 0;
      for (const n of needsRef.current.values()) {
        full = Math.max(full, n.full);
        icon = Math.max(icon, n.icon);
      }
      setMaxNeed((prev) =>
        prev.full === full && prev.icon === icon ? prev : { full, icon }
      );
    },
    []
  );

  const value = React.useMemo<GroupContextValue>(
    () => ({ report, maxNeed }),
    [report, maxNeed]
  );

  return (
    <HeaderActionsGroupContext.Provider value={value}>
      {children}
    </HeaderActionsGroupContext.Provider>
  );
}

export function useHeaderActionsGroup(): GroupContextValue | null {
  return React.useContext(HeaderActionsGroupContext);
}
