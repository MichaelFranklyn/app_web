import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTableState } from "./useTableState";

const params = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useSearchParams: () => params,
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/x",
}));

const conn = (total: number) => ({
  edges: Array.from({ length: Math.min(total, 20) }, (_, i) => ({
    node: { id: i },
  })),
  pageInfo: { hasNextPage: false, endCursor: null },
  totalCount: total,
});

describe("useTableState", () => {
  it("deriva items, totalCount e totalPages", () => {
    const { result } = renderHook(() =>
      useTableState<{ id: number }>({
        fields: {},
        data: conn(45),
        loading: false,
        first: 20,
      })
    );
    expect(result.current.items).toHaveLength(20);
    expect(result.current.totalCount).toBe(45);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.currentPage).toBe(1);
  });

  it("compacta o paginationRange com muitas páginas", () => {
    const { result } = renderHook(() =>
      useTableState({ fields: {}, data: conn(200), loading: false, first: 20 })
    );
    // 10 páginas, na 1ª: [1, 2, "...", 10]
    expect(result.current.paginationRange[0]).toBe(1);
    expect(result.current.paginationRange).toContain("...");
    expect(result.current.paginationRange.at(-1)).toBe(10);
  });

  it("isFirstLoad quando carrega sem data; totalPages mínimo 1", () => {
    const { result } = renderHook(() =>
      useTableState({ fields: {}, data: null, loading: true })
    );
    expect(result.current.isFirstLoad).toBe(true);
    expect(result.current.totalPages).toBe(1);
  });
});
