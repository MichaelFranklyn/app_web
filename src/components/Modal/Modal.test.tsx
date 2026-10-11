import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InputSelect } from "@/components/Input/InputSelect";

import { Modal } from "./index";

const OPTIONS = [
  { value: "1", label: "Ouro" },
  { value: "2", label: "Prata" },
];

const dropdown = () => document.querySelector("[data-select-dropdown]");

function Form({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  return (
    <Modal.Root open onOpenChange={onOpenChange}>
      <Modal.Content aria-describedby={undefined}>
        <Modal.Header title="Novo cliente" />
        <InputSelect options={OPTIONS} placeholder="Nível" />
      </Modal.Content>
    </Modal.Root>
  );
}

describe("Modal + select: de quem é o Escape", () => {
  it("com a lista aberta, o Escape fecha a lista e o modal fica", async () => {
    const onOpenChange = vi.fn();
    render(<Form onOpenChange={onOpenChange} />);
    screen.getByPlaceholderText("Nível").focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(dropdown()).not.toBeNull();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(dropdown()).toBeNull());
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("com a lista fechada, o Escape fecha o modal", async () => {
    const onOpenChange = vi.fn();
    render(<Form onOpenChange={onOpenChange} />);
    screen.getByPlaceholderText("Nível").focus();

    await userEvent.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
