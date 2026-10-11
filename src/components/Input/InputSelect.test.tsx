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

  // Um formulário que guarda só o id manda a string crua como `value`. Isso
  // deixava o campo com `value={undefined}` e o React acusava um input
  // controlado virando não controlado.
  it("ignora um value que não é opção sem descontrolar o input", () => {
    const errors: unknown[] = [];
    const spy = vi
      .spyOn(console, "error")
      .mockImplementation((...args) => errors.push(args[0]));

    render(
      <InputSelect
        options={OPTIONS}
        placeholder="Nível"
        value={"2" as unknown as SelectOption}
      />
    );

    const input = screen.getByPlaceholderText<HTMLInputElement>("Nível");
    expect(input.value).toBe("");
    expect(
      errors.filter((e) => String(e).includes("uncontrolled"))
    ).toHaveLength(0);
    spy.mockRestore();
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

describe("InputSelect em formulário nativo", () => {
  const submitted = (form: HTMLFormElement) =>
    new FormData(form).getAll("nivel");

  it("envia o VALOR da opção inicial, não o rótulo", () => {
    const { container } = render(
      <form>
        <InputSelect name="nivel" options={OPTIONS} defaultValue={OPTIONS[1]} />
      </form>
    );
    expect(submitted(container.querySelector("form")!)).toEqual(["2"]);
  });

  it("sem escolha, envia vazio — e a caixa de busca não entra no FormData", () => {
    const { container } = render(
      <form>
        <InputSelect name="nivel" options={OPTIONS} placeholder="Nível" />
      </form>
    );
    expect(submitted(container.querySelector("form")!)).toEqual([""]);
    expect(
      Array.from(new FormData(container.querySelector("form")!).keys())
    ).toEqual(["nivel"]);
  });

  it("acompanha a escolha feita na tela sem precisar de value controlado", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <form>
        <InputSelect
          name="nivel"
          options={OPTIONS}
          placeholder="Nível"
          onChange={onChange}
        />
      </form>
    );
    await userEvent.click(screen.getByPlaceholderText("Nível"));
    await userEvent.click(within(dropdown()).getByText("Bronze"));
    expect(submitted(container.querySelector("form")!)).toEqual(["3"]);
    expect(onChange).toHaveBeenCalledWith(OPTIONS[2]);
  });
});

describe("InputSelect pelo teclado", () => {
  const active = () =>
    dropdown()?.querySelector('[data-active="true"]')?.textContent;

  it("seta para baixo abre a lista sem escolher nada", async () => {
    const onChange = vi.fn();
    render(
      <InputSelect options={OPTIONS} placeholder="Nível" onChange={onChange} />
    );
    screen.getByPlaceholderText("Nível").focus();

    await userEvent.keyboard("{ArrowDown}");

    expect(dropdown()).not.toBeNull();
    expect(active()).toBeUndefined();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("as setas andam pelas opções e dão a volta nas pontas", async () => {
    render(<InputSelect options={OPTIONS} placeholder="Nível" />);
    screen.getByPlaceholderText("Nível").focus();

    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Ouro");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(active()).toBe("Bronze");
    await userEvent.keyboard("{ArrowDown}");
    expect(active()).toBe("Ouro");
    await userEvent.keyboard("{ArrowUp}");
    expect(active()).toBe("Bronze");
  });

  it("Home e End vão às pontas", async () => {
    render(<InputSelect options={OPTIONS} placeholder="Nível" />);
    screen.getByPlaceholderText("Nível").focus();

    await userEvent.keyboard("{ArrowDown}{End}");
    expect(active()).toBe("Bronze");
    await userEvent.keyboard("{Home}");
    expect(active()).toBe("Ouro");
  });

  it("Enter escolhe a opção marcada e fecha", async () => {
    const onChange = vi.fn();
    render(
      <InputSelect options={OPTIONS} placeholder="Nível" onChange={onChange} />
    );
    const input = screen.getByPlaceholderText<HTMLInputElement>("Nível");
    input.focus();

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: "2", label: "Prata" })
    );
    expect(input.value).toBe("Prata");
    await waitFor(() => expect(dropdown()).toBeNull());
  });

  it("reabrir parte da opção que já está escolhida", async () => {
    render(
      <InputSelect options={OPTIONS} placeholder="Nível" value={OPTIONS[1]} />
    );
    screen.getByPlaceholderText("Nível").focus();

    await userEvent.keyboard("{ArrowDown}{ArrowDown}");

    expect(active()).toBe("Prata");
  });

  it("digitar e descer escolhe entre o que sobrou do filtro", async () => {
    const onChange = vi.fn();
    render(
      <InputSelect options={OPTIONS} placeholder="Nível" onChange={onChange} />
    );
    const input = screen.getByPlaceholderText("Nível");

    await userEvent.type(input, "r");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    // "r" casa Ouro, Prata e Bronze; a segunda da lista filtrada é Prata.
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Prata" })
    );
  });

  it("Escape fecha só a lista — não sobe para quem está em volta", async () => {
    const onOuterKeyDown = vi.fn();
    render(
      // Faz as vezes do Modal, que fecha o formulário inteiro no Escape.
      <div onKeyDown={onOuterKeyDown}>
        <InputSelect options={OPTIONS} placeholder="Nível" />
      </div>
    );
    screen.getByPlaceholderText("Nível").focus();
    await userEvent.keyboard("{ArrowDown}");
    onOuterKeyDown.mockClear();

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(dropdown()).toBeNull());
    expect(onOuterKeyDown).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Nível")).toHaveFocus();
  });

  it("com a lista fechada, o Escape segue para o Modal", async () => {
    const onOuterKeyDown = vi.fn();
    render(
      <div onKeyDown={onOuterKeyDown}>
        <InputSelect options={OPTIONS} placeholder="Nível" />
      </div>
    );
    screen.getByPlaceholderText("Nível").focus();

    await userEvent.keyboard("{Escape}");

    expect(onOuterKeyDown).toHaveBeenCalled();
  });

  it("multi: Enter marca sem fechar, e Backspace no campo vazio tira a última", async () => {
    const onChange = vi.fn();
    render(
      <InputSelect
        variant="multi"
        options={OPTIONS}
        placeholder="Níveis"
        onChange={onChange}
      />
    );
    screen.getByPlaceholderText("Níveis").focus();

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}{ArrowDown}{Enter}");

    expect(dropdown()).not.toBeNull();
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ label: "Ouro" }),
      expect.objectContaining({ label: "Prata" }),
    ]);

    await userEvent.keyboard("{Backspace}");

    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ label: "Ouro" }),
    ]);
  });
});

describe("InputSelect para o leitor de tela", () => {
  it("é um combobox ligado a um listbox, com as opções e a escolhida", async () => {
    render(
      <InputSelect
        label="Nível"
        options={OPTIONS}
        placeholder="Nível"
        value={OPTIONS[1]}
      />
    );
    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(combobox).not.toHaveAttribute("aria-controls");

    await userEvent.click(combobox);

    const listbox = screen.getByRole("listbox");
    expect(combobox).toHaveAttribute("aria-expanded", "true");
    expect(combobox).toHaveAttribute("aria-controls", listbox.id);
    const options = within(listbox).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual([
      "Ouro",
      "Prata",
      "Bronze",
    ]);
    expect(
      within(listbox).getByRole("option", { selected: true })
    ).toHaveTextContent("Prata");
  });

  it("anuncia a opção sob o teclado por aria-activedescendant", async () => {
    render(<InputSelect options={OPTIONS} placeholder="Nível" />);
    const combobox = screen.getByRole("combobox");
    combobox.focus();
    expect(combobox).not.toHaveAttribute("aria-activedescendant");

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");

    const prata = within(screen.getByRole("listbox")).getByRole("option", {
      name: "Prata",
    });
    expect(combobox).toHaveAttribute("aria-activedescendant", prata.id);
    // O foco não sai do campo: quem anda é só a marca.
    expect(combobox).toHaveFocus();
  });

  it("multi avisa que aceita mais de uma escolha", async () => {
    render(
      <InputSelect variant="multi" options={OPTIONS} placeholder="Níveis" />
    );
    await userEvent.click(screen.getByRole("combobox"));

    expect(screen.getByRole("listbox")).toHaveAttribute(
      "aria-multiselectable",
      "true"
    );
  });
});
