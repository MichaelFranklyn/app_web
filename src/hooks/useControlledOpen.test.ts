import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useControlledOpen } from "./useControlledOpen";

describe("useControlledOpen", () => {
  it("sem `open`, guarda o estado sozinho", () => {
    const { result } = renderHook(() => useControlledOpen());
    expect(result.current.isControlled).toBe(false);
    expect(result.current.open).toBe(false);

    act(() => result.current.setOpen(true));
    expect(result.current.open).toBe(true);
  });

  it("com `open`, obedece ao pai e só avisa a mudança", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useControlledOpen(false, onOpenChange));
    expect(result.current.isControlled).toBe(true);

    act(() => result.current.setOpen(true));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // O pai não mudou o `open`: o modal continua fechado.
    expect(result.current.open).toBe(false);
  });
});
