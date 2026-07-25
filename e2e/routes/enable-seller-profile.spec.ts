import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * "Owner que também vende": quem já tem login ganha o perfil de campo pelo
 * PRÓPRIO perfil, via `createSeller`. Trocar o papel para "Vendedor" no cadastro
 * não serve — rebaixaria o acesso da pessoa. Papel é o que ela vê; perfil de
 * vendedor é como ela opera.
 */
const ownerSemPerfilDeVendedor = () => ({
  user_detail: {
    status: true,
    message: "ok",
    data: {
      id: "u-owner",
      name: "Rafael Menezes",
      email: "rafael@contato.com",
      role: "OWNER",
      isActive: true,
      phone: "71988887777",
      cpf: "11144477735",
      birthDate: null,
      addressZip: null,
      addressStreet: null,
      addressNumber: null,
      addressComplement: null,
      addressNeighborhood: null,
      addressCity: null,
      addressState: null,
      createdAt: "2026-01-01T00:00:00Z",
      company: {
        id: "c-1",
        nomeFantasia: "Contato Representação",
        razaoSocial: "Contato Representação LTDA",
      },
      seller: null,
    },
  },
});

test("perfil: habilita o perfil de vendedor de quem já tem login", async ({
  page,
}) => {
  let sentInput: Record<string, unknown> | null = null;

  await mockGraphql(page, {
    UserDetail: () => ownerSemPerfilDeVendedor(),
    CreateSellerProfile: (v) => {
      sentInput = (v.input ?? {}) as Record<string, unknown>;
      return {
        createSeller: {
          status: true,
          message: "ok",
          data: { id: "seller-9", region: "Bahia", isActive: true },
        },
      };
    },
  });

  await page.goto("/settings/users/u-owner");

  // Sem perfil de campo, o card ocupa o lugar dos dados de vendedor.
  await expect(
    page.getByText("Esta pessoa ainda não vende em campo.")
  ).toBeVisible();
  // E os blocos de campo não existem.
  await expect(
    page.getByRole("heading", { name: "Rotina de visitas" })
  ).toHaveCount(0);

  await page
    .getByRole("button", { name: "Habilitar perfil de vendedor" })
    .click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator('input[name="region"]').fill("Bahia");
  await dialog.getByRole("button", { name: "Habilitar" }).click();

  await expect(page.getByText("Perfil de vendedor habilitado")).toBeVisible();
  // Nome e e-mail vêm do cadastro que já existe; o papel não é enviado.
  expect(sentInput).toEqual({
    name: "Rafael Menezes",
    email: "rafael@contato.com",
    region: "Bahia",
  });
});

test("meu perfil: o proprietário habilita o PRÓPRIO perfil de vendedor", async ({
  page,
}) => {
  let sentInput: Record<string, unknown> | null = null;
  const eu = ownerSemPerfilDeVendedor();
  // O token e2e é `e2e-user` com papel owner: é ele abrindo o próprio perfil.
  eu.user_detail.data.id = "e2e-user";

  await mockGraphql(page, {
    UserDetail: () => eu,
    CreateSellerProfile: (v) => {
      sentInput = (v.input ?? {}) as Record<string, unknown>;
      return {
        createSeller: {
          status: true,
          message: "ok",
          data: { id: "seller-9", region: "Bahia", isActive: true },
        },
      };
    },
  });

  await page.goto("/profile");
  await expect(page).toHaveURL(/\/settings\/user\/e2e-user$/);

  // A cópia fala com a pessoa, não sobre ela.
  await expect(page.getByText("Você ainda não vende em campo.")).toBeVisible();
  await page.getByRole("button", { name: "Passar a vender em campo" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator('input[name="region"]').fill("Bahia");
  await dialog.getByRole("button", { name: "Habilitar" }).click();

  await expect(page.getByText("Perfil de vendedor habilitado")).toBeVisible();
  expect(sentInput!.region).toBe("Bahia");
});

test("perfil: a região é opcional ao habilitar", async ({ page }) => {
  let sentInput: Record<string, unknown> | null = null;

  await mockGraphql(page, {
    UserDetail: () => ownerSemPerfilDeVendedor(),
    CreateSellerProfile: (v) => {
      sentInput = (v.input ?? {}) as Record<string, unknown>;
      return {
        createSeller: {
          status: true,
          message: "ok",
          data: { id: "seller-9", region: null, isActive: true },
        },
      };
    },
  });

  await page.goto("/settings/users/u-owner");
  await page
    .getByRole("button", { name: "Habilitar perfil de vendedor" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Habilitar" })
    .click();

  await expect(page.getByText("Perfil de vendedor habilitado")).toBeVisible();
  expect(sentInput!.region).toBeNull();
});
