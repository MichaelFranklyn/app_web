import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormBuilder } from "./index";
import { FormStepSchema } from "./interface";

/**
 * A marca de obrigatório sai do MESMO `required` que o `buildYupSchema` usa
 * para exigir preenchimento — não de uma segunda lista, que poderia divergir da
 * validação e prometer na tela o que o formulário não cobra (ou o contrário).
 */
const steps = (
  fields: FormStepSchema["sections"][0]["fields"]
): FormStepSchema[] => [{ id: "s", sections: [{ id: "f", fields }] }];

const asterisks = () => screen.queryAllByText("*");

describe("FormBuilder — campo obrigatório", () => {
  it("marca só os campos obrigatórios", () => {
    render(
      <FormBuilder
        steps={steps([
          { name: "nome", type: "text", label: "Nome", required: true },
          { name: "apelido", type: "text", label: "Apelido" },
        ])}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByLabelText(/Nome/)).toHaveAttribute(
      "aria-required",
      "true"
    );
    expect(screen.getByLabelText(/Apelido/)).not.toHaveAttribute(
      "aria-required"
    );
    expect(asterisks()).toHaveLength(1);
  });

  it("marca também os grupos, que desenham o próprio label", () => {
    // Checkbox, radio e switch não passam pelo InputRoot: sem a prop explícita
    // no label deles, o asterisco sumia justamente nesses três.
    render(
      <FormBuilder
        steps={steps([
          {
            name: "regioes",
            type: "checkbox",
            label: "Regiões",
            required: true,
            options: [{ value: "sp", label: "SP" }],
          },
          {
            name: "turno",
            type: "radio",
            label: "Turno",
            required: true,
            options: [{ value: "m", label: "Manhã" }],
          },
          {
            name: "avisos",
            type: "switch",
            label: "Avisos",
            required: true,
            options: [{ value: "email", label: "E-mail" }],
          },
        ])}
        onSubmit={() => {}}
      />
    );

    expect(asterisks()).toHaveLength(3);
  });

  it("o label aponta para o campo que ele rotula", () => {
    // O InputRoot gerava um id próprio e o label apontava para ELE, enquanto o
    // controle usava o id do campo: clicar no rótulo não focava nada e o leitor
    // de tela não anunciava o nome do campo.
    render(
      <FormBuilder
        steps={steps([{ name: "nome", type: "text", label: "Nome" }])}
        onSubmit={() => {}}
      />
    );
    const control = screen.getByRole("textbox");
    const label = screen.getByText("Nome");
    expect(label).toHaveAttribute("for", control.id);
  });

  it("campo sem label não inventa marca solta", () => {
    render(
      <FormBuilder
        steps={steps([{ name: "oculto", type: "text", required: true }])}
        onSubmit={() => {}}
      />
    );
    expect(asterisks()).toHaveLength(0);
  });
});
