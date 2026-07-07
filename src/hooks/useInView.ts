"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Para de observar após a primeira entrada na viewport (default: true). */
  once?: boolean;
  /** Margem do root para antecipar o carregamento (ex.: "200px"). */
  rootMargin?: string;
}

/**
 * Observa um elemento e diz quando ele entra na viewport. Base do lazy-load por
 * scroll dos gráficos: enquanto `inView` é false, o gráfico não é montado e sua
 * query não é disparada.
 */
export function useInView<T extends Element = HTMLDivElement>({
  once = true,
  rootMargin = "200px",
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // SSR-safe: IntersectionObserver só existe no cliente.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin]);

  return { ref, inView };
}
