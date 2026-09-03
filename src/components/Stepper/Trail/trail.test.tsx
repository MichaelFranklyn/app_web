import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FormBuilder } from "@/components/FormBuilder";
import { Stepper } from "@/components/Stepper";

/**
 * `Stepper.Trail` é a única trilha de passos do sistema — o `Stepper.Root`, o
 * `FormBuilder` e o checkout desenham por ela. Os testes cobrem o que os três
 * dependem: quantos marcos, qual está ativo e o que já foi cumprido.
 */
const STEPS = [
  { label: "Arquivo" },
  { label: "Colunas" },
  { label: "Revisão" },
];

describe("Stepper.Trail", () => {
  it("mostra um marco por passo, numerado, e marca o cumprido com ✓", () => {
    render(<Stepper.Trail steps={STEPS} current={1} />);

    STEPS.forEach((step) => expect(screen.getByText(step.label)).toBeTruthy());
    // Passo 1 cumprido → vira ícone de confirmação, não número.
    expect(screen.queryByText("1")).toBeNull();
    // Atual e pendente seguem numerados.
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("só deixa clicar em passo cumprido quando há onChange", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Stepper.Trail steps={STEPS} current={2} onChange={onChange} />
    );

    screen.getByText("Arquivo").click();
    expect(onChange).toHaveBeenCalledWith(0);

    // Sem `onChange` a trilha é só indicação: nada é clicável.
    onChange.mockClear();
    rerender(<Stepper.Trail steps={STEPS} current={2} />);
    screen.getByText("Arquivo").click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Stepper.Root renderiza a trilha e só o conteúdo do passo atual", () => {
    render(
      <Stepper.Root current={1}>
        <Stepper.Item label="Arquivo">
          <p>conteúdo do arquivo</p>
        </Stepper.Item>
        <Stepper.Item label="Colunas">
          <p>conteúdo das colunas</p>
        </Stepper.Item>
      </Stepper.Root>
    );

    expect(screen.getByText("Colunas")).toBeTruthy();
    expect(screen.getByText("conteúdo das colunas")).toBeTruthy();
    expect(screen.queryByText("conteúdo do arquivo")).toBeNull();
  });

  it("centraliza por padrão, no Root e no FormBuilder", () => {
    // `mx-auto` sobre `w-max`, e não `justify-center`: a faixa rola no
    // horizontal, e centralizar pelo eixo cortaria o começo de uma trilha
    // maior que a tela.
    const { container: rootBox } = render(
      <Stepper.Root current={0}>
        <Stepper.Item label="Arquivo">a</Stepper.Item>
        <Stepper.Item label="Colunas">b</Stepper.Item>
      </Stepper.Root>
    );
    expect(rootBox.querySelector(".w-max")?.className).toContain("mx-auto");

    const { container: formBox } = render(
      <FormBuilder.Stepper
        steps={[
          { id: "a", title: "Dados", sections: [] },
          { id: "b", title: "Itens", sections: [] },
        ]}
        currentStepIndex={0}
      />
    );
    expect(formBox.querySelector(".w-max")?.className).toContain("mx-auto");
  });

  it("não encolhe: dentro de uma coluna flex ela seria achatada a zero", () => {
    // Foi o que aconteceu no modal de importar pedido: `Modal.Body` é uma
    // coluna flex com altura limitada, os itens encolhem para caber e a faixa
    // — baixa e com overflow próprio — foi para altura ZERO. Os marcos
    // continuavam no DOM, pintados e do tamanho certo, e o que aparecia era um
    // espaço em branco. Nenhum teste em jsdom mede layout; o que dá para
    // guardar é o `shrink-0`.
    const { container } = render(<Stepper.Trail steps={STEPS} current={0} />);

    expect(container.firstElementChild?.className).toContain("shrink-0");
  });

  it("FormBuilder.Stepper usa a mesma trilha e some com um passo só", () => {
    const steps = [
      { id: "a", title: "Dados", sections: [] },
      { id: "b", title: "Itens", sections: [] },
    ];

    const { rerender } = render(
      <FormBuilder.Stepper steps={steps} currentStepIndex={0} />
    );
    expect(screen.getByText("Dados")).toBeTruthy();
    expect(screen.getByText("Itens")).toBeTruthy();

    // Um passo só não é um caminho: mostrar a trilha nesse caso é ruído.
    rerender(<FormBuilder.Stepper steps={[steps[0]]} currentStepIndex={0} />);
    expect(screen.queryByText("Dados")).toBeNull();
  });
});
