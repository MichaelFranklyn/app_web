import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormBuilder } from "..";
import { FormStepSchema } from "../interface";

const steps: FormStepSchema[] = [
  {
    id: "s",
    sections: [
      {
        id: "sec",
        fields: [{ name: "birthDate", type: "date", label: "Nascimento" }],
      },
    ],
  },
];

/**
 * Regressão: `initialData` traz a data como ISO (é o que o backend devolve), mas
 * `Input.Date` trabalha com `Date`. O campo abria VAZIO mesmo havendo data salva
 * — e salvar em seguida apagava o valor sem ninguém perceber.
 */
describe("FormBuilder — campo date com initialData", () => {
  it("mostra a data que veio como ISO do backend", () => {
    render(
      <FormBuilder
        steps={steps}
        onSubmit={() => {}}
        initialData={{ birthDate: "1958-03-12" }}
        unstyled
      />
    );

    expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe(
      "12/03/1958"
    );
  });

  it("não desloca o dia por causa do fuso (UTC-3 mostraria o dia anterior)", () => {
    render(
      <FormBuilder
        steps={steps}
        onSubmit={() => {}}
        initialData={{ birthDate: "2026-01-01" }}
        unstyled
      />
    );

    expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe(
      "01/01/2026"
    );
  });

  it("fica vazio quando não há data", () => {
    render(
      <FormBuilder
        steps={steps}
        onSubmit={() => {}}
        initialData={{ birthDate: "" }}
        unstyled
      />
    );

    expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe("");
  });
});
