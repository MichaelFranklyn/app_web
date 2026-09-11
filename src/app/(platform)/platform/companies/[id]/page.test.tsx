import { beforeEach, describe, expect, it, vi } from "vitest";

import Page from "./page";
import { TenantDetailContentProps } from "./interface";

const { gqlFetch, notFound } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/services/graphql/gqlFetch", () => ({ gqlFetch }));
vi.mock("next/navigation", () => ({ notFound }));
// A página devolve o ELEMENTO do conteúdo sem renderizá-lo: o que os casos
// leem são as props que ela montou. O conteúdo em si tem testes próprios.
vi.mock("./content", () => ({ default: () => null }));

/**
 * A busca da ficha acontece no SERVIDOR e semeia o cache do Apollo. Duas regras
 * moram aqui e não têm como ser exercitadas pelo navegador:
 *
 *  • empresa inexistente é 404 de verdade, não ficha vazia;
 *  • só semeia com conteúdo — lista vazia semeada faria o cliente acreditar no
 *    vazio e nunca buscar.
 */
const ID = "tenant-1";

const tenant = { id: ID, nomeFantasia: "Empresa Console" };

const conexao = (nodes: unknown[]) => ({
  edges: nodes.map((node) => ({ node })),
  totalCount: nodes.length,
});

/** Resposta por operação, casando pelo nome da query do documento. */
const responder = (por: Record<string, unknown>) =>
  gqlFetch.mockImplementation(
    async ({ query }: { query: { definitions: unknown[] } }) => {
      const nome = (query.definitions[0] as { name?: { value: string } }).name
        ?.value;
      return { data: por[nome ?? ""] ?? null };
    }
  );

const abrir = async () => {
  const element = (await Page({ params: Promise.resolve({ id: ID }) })) as {
    props: TenantDetailContentProps;
  };
  return element.props;
};

const RESPOSTA_CHEIA = {
  PlatformTenant: { platformTenant: { data: tenant } },
  PlatformTenantUsers: { tenant_users: conexao([{ id: "u-1" }]) },
  PlatformTenantAudit: { tenant_audit: conexao([{ id: "a-1" }]) },
  PlatformTenantActivity: { tenant_activity: conexao([{ id: "act-1" }]) },
  PlatformTenantActivitySummary: {
    platformActivitySummary: { data: { totalActions: 3 } },
  },
};

beforeEach(() => {
  gqlFetch.mockReset();
  notFound.mockClear();
});

describe("ficha da empresa (servidor)", () => {
  it("semeia a ficha e as listas que vieram com conteúdo", async () => {
    responder(RESPOSTA_CHEIA);

    const props = await abrir();

    expect(props.id).toBe(ID);
    expect(props.seedTenant).toEqual(RESPOSTA_CHEIA.PlatformTenant);
    expect(props.seedUsers).toEqual(RESPOSTA_CHEIA.PlatformTenantUsers);
    expect(props.seedAudit).toEqual(RESPOSTA_CHEIA.PlatformTenantAudit);
    expect(props.seedActivity).toEqual(RESPOSTA_CHEIA.PlatformTenantActivity);
    expect(props.seedActivitySummary).toEqual(
      RESPOSTA_CHEIA.PlatformTenantActivitySummary
    );
  });

  it("busca as cinco consultas de uma vez, sem encadear", async () => {
    responder(RESPOSTA_CHEIA);

    await abrir();

    expect(gqlFetch).toHaveBeenCalledTimes(5);
  });

  it("empresa inexistente é 404, não ficha vazia", async () => {
    responder({
      ...RESPOSTA_CHEIA,
      PlatformTenant: { platformTenant: { data: null } },
    });

    await expect(abrir()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("lista vazia NÃO é semeada: o cliente precisa buscar", async () => {
    // Semear o vazio faria a tela acreditar nele e nunca ir à rede.
    responder({
      ...RESPOSTA_CHEIA,
      PlatformTenantUsers: { tenant_users: conexao([]) },
      PlatformTenantAudit: { tenant_audit: conexao([]) },
      PlatformTenantActivity: { tenant_activity: conexao([]) },
    });

    const props = await abrir();

    expect(props.seedUsers).toBeNull();
    expect(props.seedAudit).toBeNull();
    expect(props.seedActivity).toBeNull();
    // A ficha em si continua semeada.
    expect(props.seedTenant).not.toBeNull();
  });

  it("resumo sem dado também não é semeado", async () => {
    responder({
      ...RESPOSTA_CHEIA,
      PlatformTenantActivitySummary: {
        platformActivitySummary: { data: null },
      },
    });

    expect((await abrir()).seedActivitySummary).toBeNull();
  });

  it("backend fora do ar abre a tela sem semente, e não em 404", async () => {
    // Falha de rede e empresa inexistente chegariam iguais se o `catch` não
    // separasse os dois: só a segunda devolve `data: null` de propósito.
    gqlFetch.mockRejectedValue(new Error("ECONNREFUSED"));

    const props = await abrir();

    expect(notFound).not.toHaveBeenCalled();
    expect(props.seedTenant).toBeNull();
    expect(props.seedUsers).toBeNull();
  });

  it("as variables do SSR batem com as do cliente, senão o seed vira cache-miss", async () => {
    responder(RESPOSTA_CHEIA);

    await abrir();

    const porNome = Object.fromEntries(
      gqlFetch.mock.calls.map(([options]) => [
        (options.query.definitions[0] as { name?: { value: string } }).name
          ?.value,
        options.variables,
      ])
    );

    expect(porNome.PlatformTenant).toEqual({ id: ID });
    expect(porNome.PlatformTenantUsers).toEqual({
      input: {
        first: 50,
        after: null,
        filters: [{ field: "company_id", value: ID }],
      },
    });
    expect(porNome.PlatformTenantAudit).toEqual({
      input: {
        first: 20,
        after: null,
        filters: [{ field: "target_company_id", value: ID }],
      },
    });
    expect(porNome.PlatformTenantActivity).toEqual({
      input: {
        first: 12,
        after: null,
        filters: [{ field: "company_id", value: ID }],
      },
    });
    expect(porNome.PlatformTenantActivitySummary).toEqual({ companyId: ID });
  });
});
