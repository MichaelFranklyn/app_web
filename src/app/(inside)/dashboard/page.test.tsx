import { beforeEach, describe, expect, it, vi } from "vitest";

import Page from "./page";
import { DashboardSeed } from "./interface";

const { executeServerQueries, getServerCookie, hasFeatureServer } = vi.hoisted(
  () => ({
    executeServerQueries: vi.fn(),
    getServerCookie: vi.fn(),
    hasFeatureServer: vi.fn(),
  })
);

vi.mock("@/services/graphql/getDataServer", () => ({ executeServerQueries }));
vi.mock("@/utils/cookies/serverCookie", () => ({ getServerCookie }));
vi.mock("@/services/plan/server", () => ({ hasFeatureServer }));
// A página devolve o ELEMENTO do conteúdo sem renderizá-lo; o que se lê aqui
// são as props que ela montou.
vi.mock("./content", () => ({ default: () => null }));

/**
 * A tela mais aberta do sistema, buscada no servidor.
 *
 * A regra que mora aqui é a APOSTA: o gestor que também vende abre vendo "os
 * meus", e esse id já veio no cookie — então os números saem ao mesmo tempo que
 * a lista de vendedores, em vez de esperarem por ela. Quando a aposta erra, aí
 * sim vai em fila. É essa diferença que os casos prendem, junto com a regra de
 * não semear sem recorte (buscar sem escopo traria a empresa inteira).
 */
interface Props {
  canSelectSeller: boolean;
  ownSellerId: string | null;
  initialSellerId: string | null;
  seed: DashboardSeed;
}

const SELLERS_KEY = "dashboard_sellers";

const vendedores = (ids: string[]) => ({
  dashboard_sellers: { edges: ids.map((id) => ({ node: { id, name: id } })) },
});

const NUMEROS = {
  orders_by_period: { edges: [], totalCount: 0 },
  recent_orders: { edges: [] },
  company_clients_count: { totalCount: 7 },
  schedules_by_period: { edges: [] },
};

/** Chamadas de números (as que não são a lista de vendedores). */
const buscasDeNumeros = () =>
  executeServerQueries.mock.calls
    .map(([queries]) => queries as Record<string, { variables: unknown }>)
    .filter((queries) => !(SELLERS_KEY in queries));

/** Vendedor pedido em cada busca de números, lido do filtro enviado. */
const recortes = () =>
  buscasDeNumeros().map((queries) => {
    const filtros = (
      queries.orders_by_period.variables as {
        input: { filters: { field: string; value: string }[] };
      }
    ).input.filters;
    return filtros.find((f) => f.field === "seller_id")?.value ?? null;
  });

const abrir = async () => {
  const element = (await Page()) as { props: Props };
  return element.props;
};

/** Responde a lista de vendedores e os números; o resto é configurado no caso. */
const responder = (sellers: string[] | null, numeros = NUMEROS) =>
  executeServerQueries.mockImplementation(
    async (queries: Record<string, unknown>) => {
      if (SELLERS_KEY in queries) {
        if (sellers === null) throw new Error("sem lista");
        return vendedores(sellers);
      }
      // Só devolve o que foi PEDIDO, como o de verdade: é isso que faz a
      // ausência das visitas aparecer no seed.
      return Object.fromEntries(
        Object.keys(queries).map((key) => [
          key,
          numeros[key as keyof typeof numeros],
        ])
      );
    }
  );

beforeEach(() => {
  executeServerQueries.mockReset();
  getServerCookie.mockReset();
  hasFeatureServer.mockReset().mockResolvedValue(true);
});

describe("dashboard (servidor)", () => {
  it("vendedor não escolhe vendedor: busca direto, sem recorte", async () => {
    getServerCookie.mockResolvedValue({ role: "SELLER", sellerId: "s-1" });
    responder([]);

    const props = await abrir();

    expect(props.canSelectSeller).toBe(false);
    expect(props.initialSellerId).toBeNull();
    // Nem pede a lista: quem não escolhe vendedor não precisa dela.
    expect(
      executeServerQueries.mock.calls.some(([q]) => SELLERS_KEY in q)
    ).toBe(false);
    expect(buscasDeNumeros()).toHaveLength(1);
    expect(props.seed.clients).not.toBeNull();
  });

  it("gestor que também vende abre vendo os dele, numa busca só", async () => {
    // A aposta certa: o id já veio no cookie, então os números saíram junto com
    // a lista em vez de esperarem por ela.
    getServerCookie.mockResolvedValue({ role: "OWNER", sellerId: "s-1" });
    responder(["s-1", "s-2"]);

    const props = await abrir();

    expect(props.canSelectSeller).toBe(true);
    expect(props.initialSellerId).toBe("s-1");
    expect(recortes()).toEqual(["s-1"]);
  });

  it("aposta errada (perfil fora da lista) refaz a busca com o primeiro", async () => {
    // Perfil de vendedor inativo, por exemplo: aí não teve jeito, vai em fila.
    getServerCookie.mockResolvedValue({ role: "OWNER", sellerId: "s-9" });
    responder(["s-1", "s-2"]);

    const props = await abrir();

    expect(props.initialSellerId).toBe("s-1");
    expect(recortes()).toEqual(["s-9", "s-1"]);
  });

  it("gestor que não vende espera a lista e usa o primeiro", async () => {
    getServerCookie.mockResolvedValue({ role: "ADMIN", sellerId: null });
    responder(["s-3", "s-4"]);

    const props = await abrir();

    expect(props.initialSellerId).toBe("s-3");
    expect(recortes()).toEqual(["s-3"]);
  });

  it("empresa sem vendedor nenhum não semeia: sem recorte, viria a empresa toda", async () => {
    getServerCookie.mockResolvedValue({ role: "OWNER", sellerId: null });
    responder([]);

    const props = await abrir();

    expect(props.initialSellerId).toBeNull();
    expect(buscasDeNumeros()).toHaveLength(0);
    expect(props.seed.orders).toBeNull();
    expect(props.seed.clients).toBeNull();
  });

  it("lista de vendedores que falha não derruba a tela", async () => {
    // O cliente resolve quando a lista chegar.
    getServerCookie.mockResolvedValue({ role: "OWNER", sellerId: null });
    responder(null);

    const props = await abrir();

    expect(props.seed.sellers).toBeNull();
    expect(props.initialSellerId).toBeNull();
  });

  it("sem o motor de rotina no plano, não pede as visitas", async () => {
    // O backend recusa `visitSchedules` sem o recurso, e a recusa derrubaria a
    // página inteira por causa de um cartão.
    hasFeatureServer.mockResolvedValue(false);
    getServerCookie.mockResolvedValue({ role: "SELLER", sellerId: "s-1" });
    responder([]);

    const props = await abrir();

    expect(buscasDeNumeros()[0]).not.toHaveProperty("schedules_by_period");
    expect(props.seed.schedules).toBeNull();
  });

  it("com o motor de rotina, as visitas entram no mesmo lote", async () => {
    getServerCookie.mockResolvedValue({ role: "SELLER", sellerId: "s-1" });
    responder([]);

    const props = await abrir();

    expect(buscasDeNumeros()[0]).toHaveProperty("schedules_by_period");
    expect(props.seed.schedules).not.toBeNull();
  });

  it("números que falham abrem a tela sem semente, e não em erro", async () => {
    // Backend fora, sessão caindo: a tela busca do navegador como sempre fez.
    getServerCookie.mockResolvedValue({ role: "SELLER", sellerId: "s-1" });
    executeServerQueries.mockRejectedValue(new Error("ECONNREFUSED"));

    const props = await abrir();

    expect(props.seed.orders).toBeNull();
    expect(props.seed.recentOrders).toBeNull();
    expect(props.seed.clients).toBeNull();
  });

  it("sem cookie de sessão, trata como quem não escolhe vendedor", async () => {
    getServerCookie.mockResolvedValue(null);
    responder([]);

    const props = await abrir();

    expect(props.canSelectSeller).toBe(false);
    expect(props.ownSellerId).toBeNull();
  });

  it("o super usuário também escolhe vendedor", async () => {
    getServerCookie.mockResolvedValue({ role: "SU", sellerId: null });
    responder(["s-1"]);

    expect((await abrir()).canSelectSeller).toBe(true);
  });
});
