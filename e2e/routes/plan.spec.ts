import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * O plano da empresa, do lado de quem paga por ele.
 *
 * A tela existe para responder, dentro do sistema, por que um botão parou de
 * funcionar — então o que ela precisa garantir é que o teto cheio apareça como
 * teto cheio, e que o recurso ausente apareça em vez de sumir.
 */
const plan = (over: Record<string, unknown> = {}) => ({
  myPlan: {
    status: true,
    code: 200,
    message: "ok",
    data: {
      code: "pro",
      label: "Pro",
      features: ["ROUTINES", "REPORTS"],
      limits: [
        {
          key: "USERS",
          label: "logins",
          limit: 10,
          used: 4,
          isAtLimit: false,
        },
        {
          key: "CLIENTS",
          label: "clientes",
          limit: 100,
          used: 100,
          isAtLimit: true,
        },
        {
          key: "FACTORIES",
          label: "fábricas",
          limit: null,
          used: 7,
          isAtLimit: false,
        },
      ],
      ...over,
    },
  },
});

test("plano: mostra o uso de cada teto", async ({ page }) => {
  await mockGraphql(page, { MyPlan: () => plan() });

  await page.goto("/settings/plan");

  await expect(page.getByText("Pro").first()).toBeVisible();
  await expect(page.getByText("4 de 10")).toBeVisible();
  // Teto ausente não vira "0 de 0": vira "sem limite", e sem barra.
  await expect(page.getByText("7 · sem limite")).toBeVisible();
});

test("plano: teto cheio avisa por que o cadastro vai ser recusado", async ({
  page,
}) => {
  await mockGraphql(page, { MyPlan: () => plan() });

  await page.goto("/settings/plan");

  await expect(page.getByText("100 de 100")).toBeVisible();
  await expect(page.getByText(/limite atingido/i).first()).toBeVisible();
});

test("plano: o recurso que falta aparece na lista, em vez de sumir", async ({
  page,
}) => {
  await mockGraphql(page, { MyPlan: () => plan() });

  await page.goto("/settings/plan");

  // Pela DESCRIÇÃO, não pelo rótulo: "Comissões" também é um item da sidebar,
  // e `getByText` pegaria o do menu — o teste passaria sem o card existir.
  // Mostrar só o incluído esconderia justamente o que interessa a quem avalia
  // trocar de plano, e deixaria a ausência do menu sem explicação.
  await expect(
    page.getByText("Apuração, recebimento e conciliação das comissões.")
  ).toBeVisible();
});
