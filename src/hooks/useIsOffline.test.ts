import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useIsOffline } from "./useIsOffline";

const setOnline = (value: boolean) =>
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(value);

describe("useIsOffline", () => {
  afterEach(() => vi.restoreAllMocks());

  it("é falso com rede", () => {
    setOnline(true);
    const { result } = renderHook(() => useIsOffline());
    expect(result.current).toBe(false);
  });

  it("acompanha a queda e a volta da rede", () => {
    setOnline(true);
    const { result } = renderHook(() => useIsOffline());

    setOnline(false);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(true);

    setOnline(true);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(false);
  });
});
