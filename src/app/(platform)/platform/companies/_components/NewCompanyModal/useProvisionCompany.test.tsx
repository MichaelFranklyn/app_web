import { MockedProvider } from "@apollo/client/testing/react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { Toast } from "@/components/Toast";
import { PROVISION_COMPANY_MUTATION } from "./gql";
import { useProvisionCompany } from "./useProvisionCompany";

const payload = {
  __typename: "ProvisionCompanyPayload",
  company: {
    __typename: "CompanyType",
    id: "comp1",
    cnpj: "51909936000170",
    razaoSocial: "ALTO CONSTRUCAO LTDA",
    nomeFantasia: "Alto",
    segment: "Construção",
  },
  owner: {
    __typename: "UserType",
    id: "u1",
    name: "Michael",
    email: "michael@alto.com",
    role: "OWNER",
  },
  firstAccessLink: "https://girus.app/primeiro-acesso/token",
};

const provisionMock = (
  input: Record<string, unknown>,
  ok = true,
  message = "CNPJ já provisionado"
) => ({
  request: { query: PROVISION_COMPANY_MUTATION, variables: { input } },
  result: {
    data: {
      provisionCompany: {
        __typename: "ProvisionCompanyResponse",
        status: ok,
        code: ok ? 201 : 409,
        message: ok ? "Empresa provisionada" : message,
        data: ok ? payload : null,
      },
    },
  },
});

const baseInput = {
  cnpj: "51909936000170",
  segment: "Construção",
  ownerName: "Michael",
  ownerEmail: "michael@alto.com",
  ownerPassword: null,
};

const form = (extra: Record<string, unknown> = {}) => ({
  cnpj: "51909936000170",
  segment: "  Construção  ",
  ownerName: "  Michael  ",
  ownerEmail: " michael@alto.com ",
  ownerPassword: "",
  ...extra,
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

const run = (mocks: unknown[]) =>
  renderHook(() => useProvisionCompany(), { wrapper: wrapper(mocks) }).result;

describe("useProvisionCompany", () => {
  it("guarda empresa, dono e link de primeiro acesso para a confirmação", async () => {
    // O link só aparece uma vez: é a tela de confirmação que o mostra.
    const result = run([provisionMock(baseInput)]);

    await act(() => result.current.submit(form()));

    await waitFor(() =>
      expect(result.current.result?.firstAccessLink).toBe(
        "https://girus.app/primeiro-acesso/token"
      )
    );
    expect(result.current.result?.company.razaoSocial).toBe(
      "ALTO CONSTRUCAO LTDA"
    );
  });

  it("senha em branco vira 'sem senha' — o dono define no primeiro acesso", async () => {
    const result = run([provisionMock(baseInput)]);

    await act(() => result.current.submit(form()));

    await waitFor(() => expect(result.current.result).not.toBeNull());
  });

  it("senha digitada viaja como foi digitada", async () => {
    const result = run([
      provisionMock({ ...baseInput, ownerPassword: "girus123" }),
    ]);

    await act(() => result.current.submit(form({ ownerPassword: "girus123" })));

    await waitFor(() => expect(result.current.result).not.toBeNull());
  });

  it("recusa do backend não abre a tela de confirmação", async () => {
    const result = run([provisionMock(baseInput, false)]);

    await act(() => result.current.submit(form()));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.result).toBeNull();
  });

  it("provisionar outra empresa começa do zero", async () => {
    const result = run([provisionMock(baseInput)]);
    await act(() => result.current.submit(form()));
    await waitFor(() => expect(result.current.result).not.toBeNull());

    act(() => result.current.reset());

    expect(result.current.result).toBeNull();
  });
});
