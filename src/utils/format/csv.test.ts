import { describe, expect, it, vi } from "vitest";

import { downloadCSV, parseCSV } from "./csv";

describe("parseCSV", () => {
  it("parseia vírgula com cabeçalho e linhas", () => {
    expect(parseCSV("a,b,c\n1,2,3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("detecta ; quando predominante na 1ª linha", () => {
    expect(parseCSV("a;b;c\n1;2;3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("respeita aspas com vírgula interna e aspas escapadas", () => {
    expect(parseCSV('"a,b","c""d"')).toEqual([["a,b", 'c"d']]);
  });

  it("ignora BOM inicial e linhas totalmente vazias", () => {
    expect(parseCSV("﻿a,b\n\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("trata CRLF como uma quebra só", () => {
    expect(parseCSV("a,b\r\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("downloadCSV", () => {
  it("gera o blob e dispara o download via âncora", () => {
    const createObjectURL = vi.fn(() => "blob:x");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    downloadCSV("export.csv", [
      ["a", "b"],
      ["1", "2"],
    ]);

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:x");
    expect(click).toHaveBeenCalledOnce();
    click.mockRestore();
  });
});
