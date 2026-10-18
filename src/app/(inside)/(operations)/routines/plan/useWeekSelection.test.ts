import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PriorityClient } from "./interface";
import { useWeekSelection } from "./useWeekSelection";

const client = (clientId: string, suggested: "IN_PERSON" | "REMOTE") =>
  ({ clientId, suggestedContactType: suggested }) as PriorityClient;

describe("useWeekSelection", () => {
  it("marcar traz o toque sugerido e sem dia", () => {
    const { result } = renderHook(() => useWeekSelection("s|w"));
    act(() => result.current.toggle(client("a", "REMOTE")));
    expect(result.current.selection.a).toEqual({
      contactType: "REMOTE",
      weekday: null,
    });
  });

  it("o dia escolhido é um dia da semana", () => {
    const { result } = renderHook(() => useWeekSelection("s"));
    act(() => result.current.toggle(client("a", "IN_PERSON")));
    act(() => result.current.setWeekday("a", 3));
    expect(result.current.selection.a.weekday).toBe(3);
  });

  it("trocar de vendedor limpa a escolha", () => {
    const { result, rerender } = renderHook(
      ({ key }) => useWeekSelection(key),
      { initialProps: { key: "s1|w1" } }
    );
    act(() => result.current.toggle(client("a", "IN_PERSON")));
    rerender({ key: "s2|w1" });
    expect(result.current.selection).toEqual({});
  });
});
