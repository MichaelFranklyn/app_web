import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Filters } from "../index";
import { ResultAnnouncer } from "./index";

describe("ResultAnnouncer", () => {
  it("anuncia o total com plural e milhar em pt-BR", () => {
    const { rerender } = render(<ResultAnnouncer count={0} />);
    expect(screen.getByRole("status")).toHaveTextContent("Nenhum resultado");
    rerender(<ResultAnnouncer count={1} />);
    expect(screen.getByRole("status")).toHaveTextContent("1 resultado");
    rerender(<ResultAnnouncer count={1234} />);
    expect(screen.getByRole("status")).toHaveTextContent("1.234 resultados");
  });

  it("enquanto carrega, mantém o último total em vez de esvaziar", () => {
    const { rerender } = render(<ResultAnnouncer count={12} />);
    rerender(<ResultAnnouncer count={undefined} />);
    expect(screen.getByRole("status")).toHaveTextContent("12 resultados");
  });

  it("Filters só põe a região viva quando a tela informa a contagem", () => {
    const { rerender } = render(
      <Filters fields={[]} values={{}} onChange={vi.fn()} />
    );
    expect(screen.queryByRole("status")).toBeNull();
    rerender(
      <Filters fields={[]} values={{}} onChange={vi.fn()} resultCount={3} />
    );
    expect(screen.getByRole("status")).toHaveTextContent("3 resultados");
  });
});
