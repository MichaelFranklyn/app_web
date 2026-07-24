import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * /company — dados e LOGO da empresa. Saiu das configurações e virou rota
 * própria, aberta pelo atalho "Dados da empresa" no menu do usuário na topbar;
 * é só do dono da conta (updateCompany é @is_owner no backend), por isso o
 * grantRole("OWNER").
 *
 * O que este teste protege: a logo escolhida precisa chegar na mutation como
 * `logoBase64`. É o caminho que, se quebrar, deixa a empresa sem logo no menu
 * e no PDF do pedido sem qualquer aviso — a tela salva "com sucesso" do mesmo
 * jeito, porque os outros campos vão junto.
 */
const company = {
  id: "company-1",
  cnpj: "33000167000101",
  razaoSocial: "CONTATO REPRESENTACAO LTDA",
  nomeFantasia: "Contato Rep.",
  segment: "Representação Comercial",
  phone: null,
  whatsapp: null,
  website: null,
  addressZip: null,
  addressStreet: null,
  addressNumber: null,
  addressComplement: null,
  addressNeighborhood: null,
  addressCity: "Lauro de Freitas",
  addressState: "BA",
  logoUrl: null as string | null,
  avatarUrl: null as string | null,
};

// PNG 1x1 — conteúdo não importa, só precisa ser um arquivo de imagem real.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

test("company: envia logo e símbolo junto dos dados da empresa", async ({
  page,
}) => {
  let sentInput: Record<string, unknown> | null = null;

  await mockGraphql(page, {
    MyCompany: () => ({
      my_company: { status: true, message: "ok", data: company },
    }),
    UpdateCompany: (variables) => {
      sentInput = (variables.input ?? {}) as Record<string, unknown>;
      return {
        updateCompany: {
          status: true,
          message: "ok",
          data: { ...company, logoUrl: "/media/logos/nova.png" },
        },
      };
    },
  });

  await grantRole(page, "OWNER");
  await page.goto("/company");

  // O título do card de edição.
  await expect(
    page.getByRole("heading", { name: "Dados da empresa" })
  ).toBeVisible();

  // Dois campos de imagem: [0] logo completa (PDF), [1] símbolo (avatar).
  const inputs = page.locator('input[type="file"]');
  await expect(inputs).toHaveCount(2);
  await inputs.nth(0).setInputFiles({
    name: "marca.png",
    mimeType: "image/png",
    buffer: PNG_1X1,
  });
  await inputs.nth(1).setInputFiles({
    name: "simbolo.png",
    mimeType: "image/png",
    buffer: PNG_1X1,
  });

  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Dados da empresa atualizados")).toBeVisible();
  expect(sentInput).not.toBeNull();
  expect(sentInput!.logoFileName).toBe("marca.png");
  expect(String(sentInput!.logoBase64 ?? "").length).toBeGreaterThan(0);
  // As duas imagens viajam na MESMA mutation — enviar uma não pode descartar
  // a outra.
  expect(sentInput!.avatarFileName).toBe("simbolo.png");
  expect(String(sentInput!.avatarBase64 ?? "").length).toBeGreaterThan(0);
});

test("company: salvar sem alterações avisa em vez de ficar mudo", async ({
  page,
}) => {
  let called = false;

  await mockGraphql(page, {
    MyCompany: () => ({
      my_company: { status: true, message: "ok", data: company },
    }),
    UpdateCompany: () => {
      called = true;
      return {
        updateCompany: { status: true, message: "ok", data: company },
      };
    },
  });

  await grantRole(page, "OWNER");
  await page.goto("/company");
  await expect(
    page.getByRole("heading", { name: "Dados da empresa" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Salvar" }).click();

  // Sem isso o botão parecia quebrado: nada acontecia e o usuário concluía que
  // a logo tinha sido salva.
  await expect(page.getByText("Nada para salvar")).toBeVisible();
  expect(called).toBe(false);
});
