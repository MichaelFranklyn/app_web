import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useHeldResult } from "./useHeldResult";

type Props = {
  data: string | undefined;
  previousData?: string;
  error?: unknown;
  variables: unknown;
};

const setup = (initial: Props) =>
  renderHook((p: Props) => useHeldResult(p, p.variables), {
    initialProps: initial,
  });

const fail = new Error("Failed to fetch");

describe("useHeldResult", () => {
  it("recorte novo carregando: segura a resposta anterior", () => {
    const h = setup({ data: "nov", variables: { month: 11 } });
    h.rerender({
      data: undefined,
      previousData: "nov",
      variables: { month: 10 },
    });
    expect(h.result.current).toEqual({ shown: "nov", failed: false });
  });

  it("recorte novo que FALHOU: erro, não os números do recorte velho", () => {
    const h = setup({ data: "nov", variables: { month: 11 } });
    h.rerender({
      data: undefined,
      previousData: "nov",
      error: fail,
      variables: { month: 10 },
    });
    expect(h.result.current).toEqual({ shown: undefined, failed: true });
  });

  it("rebusca do MESMO recorte que falhou: mantém o que já estava na tela", () => {
    const h = setup({ data: "nov", variables: { month: 11 } });
    h.rerender({
      data: undefined,
      previousData: "nov",
      error: fail,
      variables: { month: 11 },
    });
    expect(h.result.current).toEqual({ shown: "nov", failed: false });
  });

  it("primeira busca que falhou: erro", () => {
    const h = setup({ data: undefined, error: fail, variables: { month: 11 } });
    expect(h.result.current.failed).toBe(true);
  });

  it("voltou ao recorte e a resposta chegou: mostra a nova", () => {
    const h = setup({ data: "nov", variables: { month: 11 } });
    h.rerender({
      data: undefined,
      previousData: "nov",
      error: fail,
      variables: { month: 10 },
    });
    h.rerender({ data: "out", previousData: "nov", variables: { month: 10 } });
    expect(h.result.current).toEqual({ shown: "out", failed: false });
  });
});
