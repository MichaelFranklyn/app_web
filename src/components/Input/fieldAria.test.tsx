import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { InputText } from "./InputText";
import { InputSelect } from "./InputSelect";

describe("Campo: erro e dica ligados ao controle", () => {
  it("com erro, o controle fica inválido e é descrito pela mensagem", () => {
    render(<InputText label="CNPJ" error="CNPJ inválido" />);
    const field = screen.getByLabelText("CNPJ");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("CNPJ inválido");
  });

  it("só com dica, descreve mas não marca inválido", () => {
    render(<InputText label="Apelido" hint="Aparece no PDF" />);
    const field = screen.getByLabelText("Apelido");
    expect(field).not.toHaveAttribute("aria-invalid");
    expect(field).toHaveAccessibleDescription("Aparece no PDF");
  });

  it("sem dica, não aponta para id inexistente", () => {
    render(<InputText label="Nome" />);
    expect(screen.getByLabelText("Nome")).not.toHaveAttribute(
      "aria-describedby"
    );
  });

  it("soma o aria-describedby que a tela já passava", () => {
    render(
      <>
        <span id="extra">Extra</span>
        <InputText label="Email" error="Obrigatório" aria-describedby="extra" />
      </>
    );
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Extra Obrigatório"
    );
  });

  it("o select também recebe a ligação", () => {
    render(
      <InputSelect label="Fábrica" error="Escolha uma fábrica" options={[]} />
    );
    const field = screen.getByRole("combobox");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Escolha uma fábrica");
  });
});
