import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SelectionBar } from "./index";

const NOUN = {
  singular: "parcela selecionada",
  plural: "parcelas selecionadas",
};

describe("SelectionBar", () => {
  it("some quando nada está selecionado", () => {
    render(
      <SelectionBar count={0} noun={NOUN} onClear={vi.fn()}>
        <button>Marcar como pago</button>
      </SelectionBar>
    );
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("conta no singular e no plural", () => {
    const { rerender } = render(
      <SelectionBar count={1} noun={NOUN} onClear={vi.fn()} />
    );
    expect(screen.getByText("1 parcela selecionada")).toBeInTheDocument();

    rerender(<SelectionBar count={3} noun={NOUN} onClear={vi.fn()} />);
    expect(screen.getByText("3 parcelas selecionadas")).toBeInTheDocument();
  });

  it("mostra o escopo e as ações recebidas", () => {
    render(
      <SelectionBar
        count={2}
        noun={NOUN}
        scopeLabel="Fábrica Alfa · agosto de 2026"
        onClear={vi.fn()}
      >
        <button>Cliente pagou</button>
      </SelectionBar>
    );
    expect(
      screen.getByText("Fábrica Alfa · agosto de 2026")
    ).toBeInTheDocument();
    expect(screen.getByText("Cliente pagou")).toBeInTheDocument();
  });

  it("limpa a seleção no botão e no Esc", async () => {
    const onClear = vi.fn();
    render(<SelectionBar count={2} noun={NOUN} onClear={onClear} />);

    await userEvent.click(screen.getByText("Limpar seleção"));
    expect(onClear).toHaveBeenCalledTimes(1);

    await userEvent.keyboard("{Escape}");
    expect(onClear).toHaveBeenCalledTimes(2);
  });
});
