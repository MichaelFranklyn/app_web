import { MockedProvider } from "@apollo/client/testing/react";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  COMPANY_BRANDING_QUERY,
  useCompanyBranding,
} from "./useCompanyBranding";

const { useUserData } = vi.hoisted(() => ({ useUserData: vi.fn() }));
vi.mock("@/hooks/useUserData", () => ({ useUserData }));

const branding = (over: Record<string, unknown> = {}) => ({
  id: "c-1",
  razaoSocial: "Empresa Teste LTDA",
  nomeFantasia: "Empresa Teste",
  logoUrl: "https://cdn/logo.png",
  avatarUrl: "https://cdn/avatar.png",
  ...over,
});

const mock = (data: Record<string, unknown> | null) => ({
  request: { query: COMPANY_BRANDING_QUERY },
  result: { data: { company_branding: { status: true, data } } },
});

const render = (mocks: ReturnType<typeof mock>[]) =>
  renderHook(() => useCompanyBranding(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    ),
  });

describe("useCompanyBranding", () => {
  beforeEach(() => {
    useUserData.mockReturnValue({ userData: { role: "OWNER" } });
  });

  it("traz o nome fantasia e as duas imagens", async () => {
    const { result } = render([mock(branding())]);

    await waitFor(() => expect(result.current.company).not.toBeNull());
    expect(result.current.name).toBe("Empresa Teste");
    expect(result.current.logoUrl).toBe("https://cdn/logo.png");
    expect(result.current.avatarUrl).toBe("https://cdn/avatar.png");
  });

  it("sem nome fantasia, cai na razão social", async () => {
    const { result } = render([mock(branding({ nomeFantasia: null }))]);

    await waitFor(() => expect(result.current.name).toBe("Empresa Teste LTDA"));
  });

  it("sem símbolo próprio, o avatar usa a marca completa", async () => {
    const { result } = render([mock(branding({ avatarUrl: null }))]);

    await waitFor(() =>
      expect(result.current.avatarUrl).toBe("https://cdn/logo.png")
    );
  });

  it("super usuário não busca: ele não tem empresa no contexto", async () => {
    useUserData.mockReturnValue({ userData: { role: "SU" } });

    // Sem mock nenhum: se a query disparasse, o MockedProvider acusaria erro e
    // o hook devolveria dados nulos por falha, não por decisão.
    const { result } = render([]);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.company).toBeNull();
    expect(result.current.name).toBeNull();
  });

  it("enquanto o cookie não foi lido, não busca", async () => {
    useUserData.mockReturnValue({ userData: null });

    const { result } = render([]);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.company).toBeNull();
  });
});
