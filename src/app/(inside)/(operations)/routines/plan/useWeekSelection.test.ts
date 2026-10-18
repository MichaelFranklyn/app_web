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
      date: null,
    });
  });

  it("a sugestão soma à escolha sem trocar o que a pessoa já marcou", () => {
    const { result } = renderHook(() => useWeekSelection("s|w"));
    act(() => result.current.toggle(client("a", "IN_PERSON")));
    act(() =>
      result.current.applySuggestion([
        { clientId: "a", contactType: "REMOTE", date: "2026-10-20" },
        { clientId: "b", contactType: "IN_PERSON", date: "2026-10-21" },
      ])
    );
    expect(result.current.selection).toEqual({
      a: { contactType: "IN_PERSON", date: null },
      b: { contactType: "IN_PERSON", date: "2026-10-21" },
    });
  });

  it("trocar de vendedor ou de semana limpa a escolha", () => {
    const { result, rerender } = renderHook(
      ({ key }) => useWeekSelection(key),
      { initialProps: { key: "s1|w1" } }
    );
    act(() => result.current.toggle(client("a", "IN_PERSON")));
    rerender({ key: "s2|w1" });
    expect(result.current.selection).toEqual({});
  });
});
