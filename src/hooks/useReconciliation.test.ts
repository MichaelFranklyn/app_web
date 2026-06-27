import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useReconciliation } from "./useReconciliation";

describe("useReconciliation", () => {
  it("pré-seleciona o existente mais parecido (>= 70%)", () => {
    const { result } = renderHook(() =>
      useReconciliation(["Cimento"], ["CIMENTO", "Areia"])
    );
    expect(result.current.recon["Cimento"]).toBe("CIMENTO");
  });

  it("cria novo (o próprio valor) quando nada é parecido", () => {
    const { result } = renderHook(() =>
      useReconciliation(["Produto Z"], ["Areia"])
    );
    expect(result.current.recon["Produto Z"]).toBe("Produto Z");
  });

  it("setFinal sobrescreve e o ajuste manual é preservado", () => {
    const { result } = renderHook(() =>
      useReconciliation(["Cimento"], ["CIMENTO"])
    );
    act(() => result.current.setFinal("Cimento", "Escolha Manual"));
    expect(result.current.recon["Cimento"]).toBe("Escolha Manual");
  });
});
