import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Table } from "../index";
import { TableSort } from "../interface";

const makeSort = (over: Partial<TableSort> = {}): TableSort => ({
  key: null,
  direction: "asc",
  onSort: vi.fn(),
  ...over,
});

/** Uma tabela mínima com as três situações de cabeçalho na mesma linha. */
const renderTable = (sort?: TableSort) =>
  render(
    <Table.Root sort={sort}>
      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Cliente</Table.Head>
            <Table.Head sortKey="order_date" sortFirst="desc">
              Data do pedido
            </Table.Head>
            <Table.Head sortKey="total_amount" align="right">
              Valor
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body />
      </Table.Table>
    </Table.Root>
  );

const headCell = (label: string) =>
  screen.getByText(label).closest("th") as HTMLElement;

describe("Table.Head — ordenação", () => {
  it("sem `sort` no Root, nem `sortKey` transforma a coluna em botão", () => {
    // É o que mantém intactas as dezenas de tabelas que não pediram ordenação.
    renderTable();
    expect(screen.queryByRole("button")).toBeNull();
    expect(headCell("Data do pedido")).not.toHaveAttribute("aria-sort");
  });

  it("coluna ordenável vira botão e anuncia que ainda não ordena", () => {
    renderTable(makeSort());
    expect(
      screen.getByRole("button", { name: "Data do pedido" })
    ).toBeInTheDocument();
    expect(headCell("Data do pedido")).toHaveAttribute("aria-sort", "none");
    // Coluna sem sortKey continua sendo texto, mesmo com o Root ordenável.
    expect(headCell("Cliente")).not.toHaveAttribute("aria-sort");
  });

  it("a coluna ativa anuncia a direção", () => {
    renderTable(makeSort({ key: "order_date", direction: "desc" }));
    expect(headCell("Data do pedido")).toHaveAttribute(
      "aria-sort",
      "descending"
    );
    // Só UMA coluna ordena por vez: a outra segue como "ordenável, não ativa".
    expect(headCell("Valor")).toHaveAttribute("aria-sort", "none");
  });

  it("clicar avisa a chave e a direção do primeiro clique da coluna", async () => {
    const sort = makeSort();
    renderTable(sort);

    await userEvent.click(screen.getByRole("button", { name: "Valor" }));
    expect(sort.onSort).toHaveBeenCalledWith("total_amount", "asc");

    await userEvent.click(
      screen.getByRole("button", { name: "Data do pedido" })
    );
    // Data começa pela mais recente — quem clica não quer o pedido de 2019.
    expect(sort.onSort).toHaveBeenCalledWith("order_date", "desc");
  });

  it("dá para ordenar pelo teclado", async () => {
    const sort = makeSort();
    renderTable(sort);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(sort.onSort).toHaveBeenCalledWith("order_date", "desc");
  });
});
