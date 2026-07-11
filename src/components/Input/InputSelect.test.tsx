import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InputSelect, SelectOption } from "./InputSelect";

const OPTIONS: SelectOption[] = [
  { value: "1", label: "Ouro" },
  { value: "2", label: "Prata" },
  { value: "3", label: "Bronze" },
];

const dropdown = () =>
  document.querySelector("[data-select-dropdown]") as HTMLElement;

describe("InputSelect (single)", () => {
  it("mostra o placeholder e esconde as opções até abrir", () => {
    render(<InputSelect options={OPTIONS} placeholder="Selecione o nível" />);
    expect(
      screen.getByPlaceholderText("Selecione o nível")
    ).toBeInTheDocument();
    expect(dropdown()).toBeNull();
  });

  it("abre ao clicar e lista as opções", async () => {
    render(<InputSelect options={OPTIONS} placeholder="Nível" />);
    await userEvent.click(screen.getByPlaceholderText("Nível"));
    const panel = dropdown();
    expect(within(panel).getByText("Ouro")).toBeInTheDocument();
    expect(within(panel).getByText("Prata")).toBeInTheDocument();
    expect(within(panel).getByText("Bronze")).toBeInTheDocument();
  });

  it("seleciona uma opção: dispara onChange, preenche o campo e fecha", async () => {
    const onChange = vi.fn();
    render(
      <InputSelect options={OPTIONS} placeholder="Nível" onChange={onChange} />
    );
    const input = screen.getByPlaceholderText<HTMLInputElement>("Nível");
    await userEvent.click(input);
    await userEvent.click(within(dropdown()).getByText("Prata"));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: "2", label: "Prata" })
    );
    expect(input.value).toBe("Prata");
    await waitFor(() => expect(dropdown()).toBeNull());
  });

  it("filtra as opções ao digitar", async () => {
    render(<InputSelect options={OPTIONS} placeholder="Nível" />);
    const input = screen.getByPlaceholderText("Nível");
    await userEvent.click(input);
    await userEvent.type(input, "pra");

    const panel = dropdown();
    expect(within(panel).getByText("Prata")).toBeInTheDocument();
    expect(within(panel).queryByText("Ouro")).toBeNull();
    expect(within(panel).queryByText("Bronze")).toBeNull();
  });

  it("mostra 'Nenhum resultado' quando o filtro não casa e não há criação", async () => {
    render(<InputSelect options={OPTIONS} placeholder="Nível" />);
    const input = screen.getByPlaceholderText("Nível");
    await userEvent.click(input);
    await userEvent.type(input, "zzz");
    expect(
      within(dropdown()).getByText("Nenhum resultado encontrado")
    ).toBeInTheDocument();
  });

  it("limpa o valor selecionado no botão de limpar", async () => {
    const onChange = vi.fn();
    render(
      <InputSelect options={OPTIONS} placeholder="Nível" onChange={onChange} />
    );
    const input = screen.getByPlaceholderText<HTMLInputElement>("Nível");
    await userEvent.click(input);
    await userEvent.click(within(dropdown()).getByText("Ouro"));
    expect(input.value).toBe("Ouro");

    // Dropdown fechado + valor presente → o único button é o "limpar".
    await userEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(input.value).toBe("");
  });
});

describe("InputSelect (multi)", () => {
  it("acumula seleções e dispara onChange com o array", async () => {
    const onChange = vi.fn();
    render(
      <InputSelect
        variant="multi"
        options={OPTIONS}
        placeholder="Níveis"
        onChange={onChange}
      />
    );
    const input = screen.getByPlaceholderText("Níveis");
    await userEvent.click(input);
    await userEvent.click(within(dropdown()).getByText("Ouro"));
    await userEvent.click(within(dropdown()).getByText("Bronze"));

    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ value: "1" }),
      expect.objectContaining({ value: "3" }),
    ]);
    // Badges das selecionadas aparecem no campo (fora do dropdown portalado,
    // onde os mesmos rótulos também constam como opções).
    const badgeOf = (label: string) =>
      screen.getAllByText(label).filter((el) => !dropdown()?.contains(el));
    expect(badgeOf("Ouro")).toHaveLength(1);
    expect(badgeOf("Bronze")).toHaveLength(1);
  });

  it("'Selecionar todos' seleciona todas e depois limpa", async () => {
    const onChange = vi.fn();
    render(
      <InputSelect
        variant="multi"
        options={OPTIONS}
        placeholder="Níveis"
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByPlaceholderText("Níveis"));
    await userEvent.click(within(dropdown()).getByText("Selecionar todos"));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ value: "1" }),
        expect.objectContaining({ value: "2" }),
        expect.objectContaining({ value: "3" }),
      ])
    );

    await userEvent.click(within(dropdown()).getByText("Selecionar todos"));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe("InputSelect (criação)", () => {
  it("oferece criar o valor digitado e chama onCreateOption", async () => {
    const onCreateOption = vi.fn().mockResolvedValue({
      value: "novo",
      label: "Novo Nível",
    });
    const onChange = vi.fn();
    render(
      <InputSelect
        options={OPTIONS}
        placeholder="Nível"
        onCreateOption={onCreateOption}
        onChange={onChange}
      />
    );
    const input = screen.getByPlaceholderText("Nível");
    await userEvent.click(input);
    await userEvent.type(input, "Novo Nível");
    await userEvent.click(within(dropdown()).getByText('Criar "Novo Nível"'));

    expect(onCreateOption).toHaveBeenCalledWith("Novo Nível");
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ value: "novo", label: "Novo Nível" })
      )
    );
  });

  it("cria com Enter quando há texto", async () => {
    const onCreateOption = vi.fn().mockResolvedValue(null);
    render(
      <InputSelect
        options={OPTIONS}
        placeholder="Nível"
        onCreateOption={onCreateOption}
      />
    );
    const input = screen.getByPlaceholderText("Nível");
    await userEvent.click(input);
    await userEvent.type(input, "Inédito{Enter}");
    expect(onCreateOption).toHaveBeenCalledWith("Inédito");
  });
});
