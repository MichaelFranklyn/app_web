import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { FormBuilder } from "./index";
import { FormBuilderRef, FormStepSchema } from "./interface";

/**
 * `onDirtyChange` é o que deixa a tela perguntar antes de sair: conta o que o
 * USUÁRIO mexeu, não o que o código preencheu por ele (uma sugestão não é
 * trabalho a perder).
 */
const STEPS: FormStepSchema[] = [
  {
    id: "s",
    sections: [
      {
        id: "f",
        fields: [{ name: "notes", type: "text", label: "Observações" }],
      },
    ],
  },
];

const renderForm = () => {
  const onDirtyChange = vi.fn();
  const ref = createRef<FormBuilderRef>();
  render(
    <FormBuilder
      ref={ref}
      steps={STEPS}
      onSubmit={() => {}}
      initialData={{ notes: "" }}
      onDirtyChange={onDirtyChange}
    />
  );
  return { onDirtyChange, ref };
};

describe("FormBuilder — onDirtyChange", () => {
  it("abre limpo", () => {
    const { onDirtyChange } = renderForm();
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it("digitar marca como mexido; desfazer volta a limpo", async () => {
    const { onDirtyChange } = renderForm();
    const input = screen.getByLabelText(/Observações/);

    fireEvent.change(input, { target: { value: "entregar cedo" } });
    await vi.waitFor(() =>
      expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    );

    fireEvent.change(input, { target: { value: "" } });
    await vi.waitFor(() =>
      expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    );
  });

  it("valor posto pelo código não conta", async () => {
    const { onDirtyChange, ref } = renderForm();

    act(() => ref.current?.setValue("notes", "sugestão"));

    expect(onDirtyChange).not.toHaveBeenCalledWith(true);
  });
});
