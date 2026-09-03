import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ImportOrderModal } from "./index";
import { TRAIL } from "./steps";

const open = async () => {
  render(
    <MockedProvider mocks={[]}>
      <ImportOrderModal
        onAddOptimistic={vi.fn()}
        canSelectSeller={false}
        ownSellerId="s-1"
      />
    </MockedProvider>
  );
  await userEvent.click(screen.getByText("Importar pedido"));
};

describe("a faixa de passos do modal", () => {
  it("não aparece na escolha — ali não se sabe o tamanho do caminho", async () => {
    await open();

    expect(screen.queryByText("Resultado")).toBeNull();
    expect(
      screen.getByText("Importar ficha de pedido do sistema")
    ).toBeTruthy();
  });

  it("aparece inteira ao escolher o arquivo de fábrica", async () => {
    await open();
    await userEvent.click(
      await screen.findByText("Gerar pedido com outra importação")
    );

    // Seis marcos, e a pessoa no segundo: é a conta que a caixa "Passo 3 de 6"
    // do passo seguinte precisa continuar.
    TRAIL.file.forEach((label) => expect(screen.getByText(label)).toBeTruthy());
  });

  it("aparece curta ao escolher a ficha do sistema", async () => {
    await open();
    await userEvent.click(
      await screen.findByText("Importar ficha de pedido do sistema")
    );

    TRAIL.sheet.forEach((label) =>
      expect(screen.getByText(label)).toBeTruthy()
    );
    expect(screen.queryByText("Colunas")).toBeNull();
  });
});
