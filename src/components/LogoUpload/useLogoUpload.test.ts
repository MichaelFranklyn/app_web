import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useLogoUpload } from "./useLogoUpload";

const pngFile = () =>
  new File([new Uint8Array([1, 2, 3])], "marca.png", { type: "image/png" });

describe("useLogoUpload", () => {
  it("não envia campo de logo quando nada mudou", async () => {
    const { result } = renderHook(() => useLogoUpload());
    await expect(result.current.toLogoInput()).resolves.toEqual({});
  });

  it("envia base64 + nome do arquivo escolhido", async () => {
    const { result } = renderHook(() => useLogoUpload());
    const file = pngFile();

    act(() => result.current.onChange({ file, cleared: false }));

    const input = await result.current.toLogoInput();
    expect(input.logoFileName).toBe("marca.png");
    // Base64 sem o prefixo data URL (o backend também tolera, mas o padrão é cru).
    expect(input.logoBase64).toBe("AQID");
  });

  it("base64 vazio sinaliza remoção ao backend", async () => {
    const { result } = renderHook(() => useLogoUpload());

    act(() => result.current.onChange({ file: null, cleared: true }));

    await expect(result.current.toLogoInput()).resolves.toEqual({
      logoBase64: "",
      logoFileName: null,
    });
  });

  it("reset volta ao estado de 'nada mudou'", async () => {
    const { result } = renderHook(() => useLogoUpload());

    act(() => result.current.onChange({ file: pngFile(), cleared: false }));
    act(() => result.current.reset());

    await expect(result.current.toLogoInput()).resolves.toEqual({});
  });
});
