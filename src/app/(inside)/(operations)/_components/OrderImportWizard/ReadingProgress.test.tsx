import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ReadingProgress,
  SLOW_READING_SECONDS,
  readingMessage,
} from "./ReadingProgress";

describe("readingMessage", () => {
  it("diz a fase, sem relógio, enquanto a espera é curta", () => {
    expect(readingMessage("upload", 0)).toEqual({
      title: "Enviando o arquivo…",
      description: null,
    });
    expect(readingMessage("read", SLOW_READING_SECONDS - 1).title).toBe(
      "Lendo o pedido…"
    );
  });

  it("na espera longa mostra os segundos e acalma", () => {
    const msg = readingMessage("read", 12);
    expect(msg.title).toBe("Lendo o pedido… 12 segundos");
    expect(msg.description).toMatch(/Pode aguardar nesta tela/);
  });
});

describe("ReadingProgress", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("conta o tempo e avisa a partir de 10 segundos", () => {
    render(<ReadingProgress phase="read" />);
    expect(screen.getByRole("status")).toHaveTextContent("Lendo o pedido…");
    expect(screen.queryByText(/Pode aguardar/)).toBeNull();

    act(() => {
      vi.advanceTimersByTime(SLOW_READING_SECONDS * 1000);
    });

    expect(screen.getByText(/10 segundos/)).toBeInTheDocument();
    expect(screen.getByText(/Pode aguardar nesta tela/)).toBeInTheDocument();
  });
});
