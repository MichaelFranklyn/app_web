import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";
import { describe, expect, it, vi } from "vitest";

import { InputDate } from "./InputDate";

const openCalendar = (input: HTMLElement) => {
  // O input é readOnly/pointer-events-none; quem abre é o container (onClick).
  fireEvent.click(input.parentElement as HTMLElement);
};

describe("InputDate (single)", () => {
  it("mostra o placeholder padrão e nada selecionado", () => {
    render(<InputDate />);
    expect(screen.getByPlaceholderText("Selecione a data")).toBeInTheDocument();
  });

  it("exibe o valor controlado formatado dd/MM/yyyy", () => {
    render(<InputDate value={new Date(2026, 6, 15)} />);
    expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe(
      "15/07/2026"
    );
  });

  it("abre e mostra os atalhos", () => {
    render(<InputDate />);
    openCalendar(screen.getByRole("textbox"));
    expect(screen.getByRole("button", { name: "Hoje" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ontem" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Amanhã" })).toBeInTheDocument();
  });

  it("atalho 'Hoje' seleciona a data de hoje, dispara onChange e fecha", async () => {
    const onChange = vi.fn();
    render(<InputDate onChange={onChange} />);
    const input = screen.getByRole<HTMLInputElement>("textbox");
    openCalendar(input);
    await userEvent.click(screen.getByRole("button", { name: "Hoje" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0] as Date;
    expect(format(arg, "dd/MM/yyyy")).toBe(format(new Date(), "dd/MM/yyyy"));
    // Sem `value` controlado, o display volta a vazio ao fechar (o componente
    // é controlado: quem persiste é o pai via onChange). Aqui basta o fechamento.
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Hoje" })
      ).not.toBeInTheDocument()
    );
  });

  it("limpa o valor no botão de limpar", async () => {
    const onChange = vi.fn();
    render(<InputDate value={new Date(2026, 6, 15)} onChange={onChange} />);
    const input = screen.getByRole<HTMLInputElement>("textbox");
    expect(input.value).toBe("15/07/2026");

    // Fechado + com valor → o único button é o limpar.
    await userEvent.click(screen.getByRole("button"));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(input.value).toBe("");
  });
});

describe("InputDate (range)", () => {
  it("usa o placeholder de período", () => {
    render(<InputDate variant="range" />);
    expect(
      screen.getByPlaceholderText("Selecione o período")
    ).toBeInTheDocument();
  });

  it("exibe o intervalo controlado 'de - até'", () => {
    render(
      <InputDate
        variant="range"
        value={{ from: new Date(2026, 6, 1), to: new Date(2026, 6, 10) }}
      />
    );
    expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe(
      "01/07/2026 - 10/07/2026"
    );
  });

  // Os dois painéis são calendários independentes: mexer no mês/ano de um não
  // pode arrastar o outro (com um único DayPicker de 2 meses, o dropdown da
  // direita jogava o mês escolhido para a esquerda).
  it("mudar o mês pelo dropdown da direita não move o painel da esquerda", async () => {
    render(
      <InputDate variant="range" value={{ from: new Date(2026, 0, 15) }} />
    );
    openCalendar(screen.getByRole("textbox"));

    const [leftMonth, rightMonth] =
      screen.getAllByLabelText("Choose the Month");
    expect(leftMonth).toHaveTextContent("janeiro");
    expect(rightMonth).toHaveTextContent("fevereiro");

    await userEvent.click(rightMonth);
    await userEvent.click(screen.getByRole("button", { name: "outubro" }));

    const [leftAfter, rightAfter] =
      screen.getAllByLabelText("Choose the Month");
    expect(leftAfter).toHaveTextContent("janeiro");
    expect(rightAfter).toHaveTextContent("outubro");
  });

  it("mudar o ano pelo dropdown da direita não move o painel da esquerda", async () => {
    render(
      <InputDate variant="range" value={{ from: new Date(2026, 0, 15) }} />
    );
    openCalendar(screen.getByRole("textbox"));

    const [, rightYear] = screen.getAllByLabelText("Choose the Year");
    await userEvent.click(rightYear);
    await userEvent.click(screen.getByRole("button", { name: "2028" }));

    const [leftMonth, rightMonth] =
      screen.getAllByLabelText("Choose the Month");
    const [leftYear, rightYearAfter] =
      screen.getAllByLabelText("Choose the Year");
    expect(leftMonth).toHaveTextContent("janeiro");
    expect(leftYear).toHaveTextContent("2026");
    expect(rightMonth).toHaveTextContent("fevereiro");
    expect(rightYearAfter).toHaveTextContent("2028");
  });

  it("mudar o mês pelo dropdown da esquerda não move o painel da direita", async () => {
    render(
      <InputDate variant="range" value={{ from: new Date(2026, 0, 15) }} />
    );
    openCalendar(screen.getByRole("textbox"));

    const [leftMonth] = screen.getAllByLabelText("Choose the Month");
    await userEvent.click(leftMonth);
    await userEvent.click(screen.getByRole("button", { name: "maio" }));

    const [leftAfter, rightAfter] =
      screen.getAllByLabelText("Choose the Month");
    expect(leftAfter).toHaveTextContent("maio");
    expect(rightAfter).toHaveTextContent("fevereiro");
  });

  it("reabre mostrando o começo do período à esquerda e o fim à direita", () => {
    render(
      <InputDate
        variant="range"
        value={{ from: new Date(2026, 0, 15), to: new Date(2026, 9, 20) }}
      />
    );
    openCalendar(screen.getByRole("textbox"));

    const [leftMonth, rightMonth] =
      screen.getAllByLabelText("Choose the Month");
    expect(leftMonth).toHaveTextContent("janeiro");
    expect(rightMonth).toHaveTextContent("outubro");
  });

  it("atalho de período dispara onChange com {from,to} e fecha", async () => {
    const onChange = vi.fn();
    render(<InputDate variant="range" onChange={onChange} />);
    openCalendar(screen.getByRole("textbox"));
    await userEvent.click(screen.getByRole("button", { name: "Esta Semana" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0] as { from: Date; to: Date };
    expect(range.from).toBeInstanceOf(Date);
    expect(range.to).toBeInstanceOf(Date);
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Esta Semana" })
      ).not.toBeInTheDocument()
    );
  });
});
