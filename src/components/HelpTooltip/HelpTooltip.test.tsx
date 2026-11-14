import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";

import { HelpTooltip } from "./index";

const tap = (user: ReturnType<typeof userEvent.setup>, target: Element) =>
  user.pointer({ keys: "[TouchA]", target });

function setup() {
  const user = userEvent.setup();
  render(
    <>
      <HelpTooltip label="Ajuda: comissão" content="Vale sobre o faturado." />
      <button>Fora</button>
    </>
  );
  return {
    user,
    trigger: screen.getByRole("button", { name: "Ajuda: comissão" }),
  };
}

describe("HelpTooltip: abre no toque", () => {
  it("o toque abre e o segundo toque fecha", async () => {
    const { user, trigger } = setup();
    await tap(user, trigger);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Vale sobre o faturado."
    );
    await tap(user, trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("tocar fora fecha", async () => {
    const { user, trigger } = setup();
    await tap(user, trigger);
    await screen.findByRole("tooltip");
    await tap(user, screen.getByText("Fora"));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("clique de mouse também alterna, e Esc fecha", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);
    await screen.findByRole("tooltip");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
