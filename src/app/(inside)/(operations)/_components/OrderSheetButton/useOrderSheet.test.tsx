import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { downloadOrderSheet, loadImage, loadGirusLogo, branding } = vi.hoisted(
  () => ({
    downloadOrderSheet: vi.fn(async () => {}),
    loadImage: vi.fn(async () => ({ dataUrl: "logo", width: 10, height: 10 })),
    loadGirusLogo: vi.fn(async () => ({
      dataUrl: "girus",
      width: 10,
      height: 10,
    })),
    branding: { name: "Contato Rep.", logoUrl: "https://x/logo.png" },
  })
);

vi.mock("@/utils/orderSheet", () => ({ downloadOrderSheet }));
vi.mock("@/utils/media", () => ({ loadImage }));
vi.mock("@/utils/pdf/footer", () => ({ loadGirusLogo }));
vi.mock("@/hooks/useCompanyBranding", () => ({
  useCompanyBranding: () => branding,
}));

import { Toast } from "@/components/Toast";
import { sheetPackageFixture } from "@/utils/orderSheet/fixture";
import { ORDER_SHEET_PACKAGE_QUERY } from "./gql";
import { useOrderSheet } from "./useOrderSheet";

const packageMock = (
  pkg: unknown = sheetPackageFixture(),
  sellerId: string | null = null
) => ({
  request: {
    query: ORDER_SHEET_PACKAGE_QUERY,
    variables: { sellerId },
  },
  result: { data: { orderSheetPackage: pkg } },
});

const wrapper = (mocks: unknown[]) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Toast.ToastProvider>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- mocks do MockLink */}
      <MockedProvider mocks={mocks as any}>{children}</MockedProvider>
    </Toast.ToastProvider>
  );
  return Wrapper;
};

const run = (mocks: unknown[], options = {}) =>
  renderHook(() => useOrderSheet(options), { wrapper: wrapper(mocks) }).result;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useOrderSheet", () => {
  it("gera a ficha com a marca da representação e a do sistema", async () => {
    // As marcas são as mesmas do PDF que vai ao cliente.
    const result = run([packageMock()], { clientName: "Alto" });

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.generate();
    });

    expect(ok).toBe(true);
    expect(downloadOrderSheet).toHaveBeenCalledOnce();
    const [, options] = downloadOrderSheet.mock.calls[0] as unknown as [
      unknown,
      { clientName?: string; brand: Record<string, unknown> },
    ];
    expect(options.clientName).toBe("Alto");
    expect(options.brand).toMatchObject({
      companyName: "Contato Rep.",
      companyLogo: { dataUrl: "logo" },
      girusLogo: { dataUrl: "girus" },
    });
  });

  it("leva o CNPJ já preenchido quando a ficha sai da tela do cliente", async () => {
    const result = run([packageMock()], {
      cnpjDigits: "51909936000170",
      clientName: "Alto",
    });

    await act(async () => {
      await result.current.generate();
    });

    const [, options] = downloadOrderSheet.mock.calls[0] as unknown as [
      unknown,
      { cnpjDigits?: string },
    ];
    expect(options.cnpjDigits).toBe("51909936000170");
  });

  it("vendedor sem fábrica não recebe uma ficha vazia", async () => {
    // Sem fábrica não há catálogo: a ficha sairia com dropdown vazio e nenhum
    // produto — melhor dizer o que falta.
    const result = run([packageMock(sheetPackageFixture({ factories: [] }))]);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.generate();
    });

    expect(ok).toBe(false);
    expect(downloadOrderSheet).not.toHaveBeenCalled();
  });

  it("o gestor pede a ficha de um vendedor específico", async () => {
    const result = run([packageMock(sheetPackageFixture(), "seller-9")]);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.generate("seller-9");
    });

    expect(ok).toBe(true);
  });

  it("falha de rede não deixa o botão preso em 'gerando'", async () => {
    const result = run([
      {
        request: {
          query: ORDER_SHEET_PACKAGE_QUERY,
          variables: { sellerId: null },
        },
        error: new Error("sem rede"),
      },
    ]);

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.generate();
    });

    expect(ok).toBe(false);
    await waitFor(() => expect(result.current.generating).toBe(false));
    expect(downloadOrderSheet).not.toHaveBeenCalled();
  });
});
