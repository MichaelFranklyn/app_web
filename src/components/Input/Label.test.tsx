import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InputDate } from "./InputDate";
import { InputSelect } from "./InputSelect";
import { InputText } from "./InputText";
import { InputTextarea } from "./InputTextarea";

/** O asterisco é `aria-hidden`; a marca acessível é o texto ao lado dele. */
const marks = () => screen.queryAllByText("*");

describe("marca de campo obrigatório", () => {
  it("põe o asterisco no label quando o campo é obrigatório", () => {
    render(<InputText label="Nome" required />);
    expect(marks()).toHaveLength(1);
    // O leitor de tela não lê "*": a palavra vai junto, escondida da vista.
    expect(screen.getByText("(obrigatório)")).toBeInTheDocument();
  });

  it("não põe nada no campo opcional", () => {
    render(<InputText label="Apelido" />);
    expect(marks()).toHaveLength(0);
    expect(screen.queryByText("(obrigatório)")).toBeNull();
  });

  it("marca o controle com aria-required, não com o required nativo", () => {
    // O `required` do HTML abriria o balão do navegador por cima da validação
    // do formulário — outra mensagem, em inglês, e fora do fluxo do yup.
    render(<InputText label="Nome" required />);
    const control = screen.getByRole("textbox");
    expect(control).toHaveAttribute("aria-required", "true");
    // Sem o atributo nativo (`toBeRequired` não serve aqui: ele aceita
    // aria-required como equivalente, que é justamente o que queremos separar).
    expect(control).not.toHaveAttribute("required");
  });

  it("o campo opcional não anuncia aria-required", () => {
    render(<InputText label="Apelido" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-required");
  });

  it("vale para os outros tipos de campo, não só texto", () => {
    // Um asterisco que aparece só no texto ensinaria a convenção errada.
    const { unmount } = render(<InputTextarea label="Observações" required />);
    expect(marks()).toHaveLength(1);
    unmount();

    const select = render(
      <InputSelect label="Fábrica" options={[]} required />
    );
    expect(marks()).toHaveLength(1);
    select.unmount();

    render(<InputDate label="Data do pedido" required />);
    expect(marks()).toHaveLength(1);
  });

  it("label continua ligado ao controle pelo htmlFor", () => {
    // O asterisco entra DENTRO do label; clicar nele tem de focar o campo.
    render(<InputText label="Nome" required />);
    expect(screen.getByLabelText(/Nome/)).toBe(screen.getByRole("textbox"));
  });
});
