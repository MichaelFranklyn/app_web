import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Title } from "./index";

describe("Title", () => {
  it("usa a tag que a variante prescreve", () => {
    // A escala carrega semântica: heading-md é um h3, body-sm é um parágrafo.
    const { container } = render(<Title variant="heading-md">Fábricas</Title>);
    expect(container.querySelector("h3")).not.toBeNull();
  });

  it("`as` troca a tag e mantém a escala", () => {
    // O número de um cartão de estatística tem o tamanho de um heading e não é
    // cabeçalho de nada — sem esta saída, o jeito curto era escrever
    // `text-[19px]` à mão e sair da escala (ver typography.guard).
    const { container } = render(
      <Title as="span" variant="heading-md">
        128
      </Title>
    );
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span?.className).toContain("text-[19px]");
    expect(container.querySelector("h3")).toBeNull();
  });

  it("`as=label` serve ao rótulo de campo", () => {
    const { container } = render(
      <Title as="label" variant="body-sm">
        Ativo
      </Title>
    );
    expect(container.querySelector("label")).not.toBeNull();
  });

  it("a cor inverse escreve em branco, para as faixas coloridas", () => {
    // A faixa de offline é vermelha e a de impersonação roxa: sem uma cor da
    // escala para isso, as duas escapavam do Title inteiro.
    const { container } = render(
      <Title variant="body-xs" color="inverse">
        Sem internet agora.
      </Title>
    );
    expect(container.firstElementChild?.className).toContain("text-white");
  });

  it("className do chamador vence a cor da variante (twMerge)", () => {
    const { container } = render(
      <Title variant="body-sm" color="muted" className="text-(--red)">
        Erro
      </Title>
    );
    const className = container.firstElementChild?.className ?? "";
    expect(className).toContain("text-(--red)");
    expect(className).not.toContain("text-(--muted)");
  });
});
