import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListPageSkeleton } from "./index";

describe("ListPageSkeleton", () => {
  it("serve o que é fixo na tela sem esperar dados", () => {
    render(
      <ListPageSkeleton
        title="Clientes"
        description="Carteira de clientes da empresa."
        columns={["Cliente", "Cidade"]}
        listTitle="Carteira de clientes"
      />
    );

    // Título, descrição e rótulos de coluna não dependem de dados: aparecem de
    // imediato, então a troca pelo conteúdo real não desloca a página.
    expect(screen.getByText("Clientes")).toBeInTheDocument();
    expect(
      screen.getByText("Carteira de clientes da empresa.")
    ).toBeInTheDocument();
    expect(screen.getByText("Carteira de clientes")).toBeInTheDocument();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByText("Cidade")).toBeInTheDocument();
  });

  it("monta a grade cinza no tamanho pedido", () => {
    render(
      <ListPageSkeleton
        title="Pedidos"
        columns={["Pedido", "Cliente", "Valor"]}
        rows={4}
      />
    );

    // 3 colunas × 4 linhas de placeholder.
    expect(screen.getAllByRole("row")).toHaveLength(5); // 4 + cabeçalho
    expect(document.querySelectorAll("tbody td")).toHaveLength(12);
  });

  it("mostra as abas com os rótulos reais quando a lista tem abas", () => {
    render(
      <ListPageSkeleton
        title="Pedidos"
        tabs={["Todos os pedidos", "Ainda não faturados"]}
        columns={["Pedido"]}
      />
    );

    expect(
      screen.getByRole("tab", { name: "Todos os pedidos" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Ainda não faturados" })
    ).toBeInTheDocument();
  });

  it("aceita um corpo próprio no lugar da tabela", () => {
    render(
      <ListPageSkeleton title="Fábricas Representadas">
        <div data-testid="grid-de-cards" />
      </ListPageSkeleton>
    );

    expect(screen.getByTestId("grid-de-cards")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
