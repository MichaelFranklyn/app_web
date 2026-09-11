import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useInView } from "./useInView";

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

/** Espião do IntersectionObserver: guarda o callback para o teste disparar a
 * entrada/saída da viewport na mão — o jsdom não faz layout. */
function stubIntersectionObserver() {
  const observe = vi.fn();
  const disconnect = vi.fn();
  let fire: ObserverCallback = () => {};
  let options: { rootMargin?: string } = {};

  class Stub {
    constructor(cb: ObserverCallback, opts: { rootMargin?: string }) {
      fire = cb;
      options = opts;
    }
    observe = observe;
    disconnect = disconnect;
    unobserve = vi.fn();
    takeRecords = () => [];
    root = null;
    rootMargin = "";
    thresholds = [];
  }

  (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver =
    Stub;

  return {
    observe,
    disconnect,
    enter: () => fire([{ isIntersecting: true }]),
    leave: () => fire([{ isIntersecting: false }]),
    optionsUsed: () => options,
  };
}

function Alvo({ once }: { once?: boolean } = {}) {
  const { ref, inView } = useInView<HTMLDivElement>(
    once === undefined ? undefined : { once }
  );
  return (
    <div ref={ref} data-testid="alvo">
      {inView ? "visível" : "fora"}
    </div>
  );
}

afterEach(() => {
  delete (globalThis as { IntersectionObserver?: unknown })
    .IntersectionObserver;
});

describe("useInView", () => {
  it("sem IntersectionObserver, monta o conteúdo em vez de escondê-lo para sempre", async () => {
    // O jsdom e navegadores antigos não têm a API. Degradar para "não está na
    // tela" deixaria o gráfico invisível e a query nunca dispararia.
    render(<Alvo />);
    await waitFor(() =>
      expect(screen.getByTestId("alvo")).toHaveTextContent("visível")
    );
  });

  it("entra na viewport e, por padrão, para de observar", async () => {
    const io = stubIntersectionObserver();
    render(<Alvo />);

    expect(screen.getByTestId("alvo")).toHaveTextContent("fora");
    expect(io.observe).toHaveBeenCalled();
    // A margem antecipa a carga antes de o elemento aparecer de fato.
    expect(io.optionsUsed().rootMargin).toBe("200px");

    io.enter();
    await waitFor(() =>
      expect(screen.getByTestId("alvo")).toHaveTextContent("visível")
    );
    expect(io.disconnect).toHaveBeenCalled();
  });

  it("com once=false, volta a falso ao sair da viewport", async () => {
    const io = stubIntersectionObserver();
    render(<Alvo once={false} />);

    io.enter();
    await waitFor(() =>
      expect(screen.getByTestId("alvo")).toHaveTextContent("visível")
    );

    io.leave();
    await waitFor(() =>
      expect(screen.getByTestId("alvo")).toHaveTextContent("fora")
    );
  });

  it("desconecta o observador ao desmontar", () => {
    const io = stubIntersectionObserver();
    const { unmount } = render(<Alvo />);
    unmount();
    expect(io.disconnect).toHaveBeenCalled();
  });
});
