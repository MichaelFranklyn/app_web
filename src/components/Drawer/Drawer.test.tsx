import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { Drawer } from "./index";

function Harness({ onClose = vi.fn() }: { onClose?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const close = () => {
    onClose();
    setOpen(false);
  };
  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir painel</button>
      <Drawer.Root open={open} onClose={close} label="Detalhes da visita">
        <Drawer.Header>Parada #1</Drawer.Header>
        <Drawer.Body>
          <button>Registrar visita</button>
        </Drawer.Body>
      </Drawer.Root>
    </>
  );
}

describe("Drawer: teclado de diálogo", () => {
  it("fechado, o painel sai do Tab e do leitor de tela (inert)", () => {
    render(<Harness />);
    const panel = screen.getByRole("dialog", { hidden: true });
    expect(panel).toHaveAttribute("inert");
    expect(panel).not.toHaveAttribute("aria-modal");
  });

  it("aberto, o foco entra no painel e o Tab circula dentro dele", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByText("Abrir painel"));

    const panel = screen.getByRole("dialog", { name: "Detalhes da visita" });
    expect(panel).toHaveAttribute("aria-modal", "true");
    expect(panel).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus();
    await user.tab();
    expect(screen.getByText("Registrar visita")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByText("Registrar visita")).toHaveFocus();
  });

  it("Esc fecha e o foco volta para quem abriu", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const opener = screen.getByText("Abrir painel");
    await user.click(opener);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(opener).toHaveFocus();
  });
});
