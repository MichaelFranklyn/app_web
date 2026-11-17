import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const reportError = vi.fn();
vi.mock("@/utils/errorReporting/report", () => ({
  reportError: (...args: unknown[]) => reportError(...args),
}));

import { useReportRouteError } from "./useReportRouteError";

describe("useReportRouteError", () => {
  it("relata o erro do boundary com o digest, uma vez por erro", () => {
    const error = Object.assign(new Error("ssr"), { digest: "999" });
    const { rerender } = renderHook(() => useReportRouteError(error));
    rerender();
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(error, "boundary", "999");
  });

  it("marca a origem do boundary global", () => {
    reportError.mockClear();
    const error = new Error("raiz");
    renderHook(() => useReportRouteError(error, "global-boundary"));
    expect(reportError).toHaveBeenCalledWith(
      error,
      "global-boundary",
      undefined
    );
  });
});
