import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Table } from "./index";
import { isLongCellText, WRAP_MIN_CHARS } from "./utils";

const LONG = "COMERCIAL DE MATERIAIS DE CONSTRUCAO SILVA E FILHOS LTDA";

describe("isLongCellText", () => {
  it("texto curto, data e número ficam em uma linha", () => {
    expect(isLongCellText("vence hoje")).toBe(false);
    expect(isLongCellText("12/10/2026")).toBe(false);
    expect(isLongCellText(1234.56)).toBe(false);
    expect(isLongCellText("a".repeat(WRAP_MIN_CHARS))).toBe(false);
  });

  it("texto longo pode quebrar", () => {
    expect(isLongCellText(LONG)).toBe(true);
    expect(isLongCellText("a".repeat(WRAP_MIN_CHARS + 1))).toBe(true);
  });

  it("soma os pedaços de um texto montado em partes", () => {
    expect(
      isLongCellText(["Confirmado em ", "03/10/2026", ", há ", 9, " dias"])
    ).toBe(true);
    expect(isLongCellText(["há ", 9, " dias", null, false])).toBe(false);
  });

  it("conteúdo com elemento não é decidido pelo tamanho", () => {
    expect(isLongCellText(<span>{LONG}</span>)).toBe(false);
    expect(isLongCellText([LONG, <b key="b">x</b>])).toBe(false);
    expect(isLongCellText(null)).toBe(false);
  });
});

const renderCells = (cells: React.ReactNode) =>
  render(
    <Table.Root>
      <Table.Table>
        <Table.Body>
          <Table.Row>{cells}</Table.Row>
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );

describe("quebra de linha no desktop", () => {
  it("a célula segue nowrap por padrão e só o texto longo ganha a quebra", () => {
    renderCells(
      <>
        <Table.Cell>vence hoje</Table.Cell>
        <Table.Cell>{LONG}</Table.Cell>
      </>
    );
    const short = screen.getByText("vence hoje");
    const long = screen.getByText(LONG);
    expect(short.className).toContain("whitespace-nowrap");
    expect(short.className).not.toContain("desktop:whitespace-normal");
    // A base continua nowrap: no celular e no tablet a tabela segue rolando.
    expect(long.className).toContain("whitespace-nowrap");
    expect(long.className).toContain("desktop:whitespace-normal");
    expect(long.className).toContain("desktop:min-w-[220px]");
  });

  it("Table.CellText longo quebra mesmo dentro de uma célula composta", () => {
    renderCells(
      <Table.Cell>
        <div>
          <Table.CellText variant="strong">{LONG}</Table.CellText>
          <Table.CellText variant="dim">12.345.678/0001-90</Table.CellText>
        </div>
      </Table.Cell>
    );
    expect(screen.getByText(LONG).className).toContain(
      "desktop:whitespace-normal"
    );
    expect(screen.getByText(LONG).className).toContain("desktop:inline-block");
    expect(screen.getByText("12.345.678/0001-90").className).not.toContain(
      "desktop:whitespace-normal"
    );
  });

  it("`wrap` força ou trava a quebra, seja qual for o tamanho", () => {
    renderCells(
      <>
        <Table.Cell wrap>
          <span>curto</span>
        </Table.Cell>
        <Table.Cell wrap={false}>{LONG}</Table.Cell>
      </>
    );
    expect(screen.getByText("curto").closest("td")?.className).toContain(
      "desktop:whitespace-normal"
    );
    expect(screen.getByText(LONG).className).not.toContain(
      "desktop:whitespace-normal"
    );
  });
});
