import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";
import { grantRole } from "../support/role";

/**
 * /settings/company — dados e LOGO da empresa. É só do dono da conta
 * (updateCompany é @is_owner no backend), por isso o grantRole("OWNER").
 *
 * A tela tem a mesma forma do perfil da pessoa: cards em leitura, com o botão
 * âmbar do cabeçalho abrindo o modal daquele assunto.
 *
 * O que estes testes protegem: a logo escolhida precisa chegar na mutation como
 * `logoBase64`. É o caminho que, se quebrar, deixa a empresa sem logo no menu e
 * no PDF do pedido sem qualquer aviso — a tela salva "com sucesso" do mesmo
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
  await page.goto("/settings/company");

  // As imagens têm card próprio ("Marca da empresa"), e a troca é num modal.
  await expect(
    page.getByRole("heading", { name: "Marca da empresa" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Trocar imagens" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Dois campos de imagem: [0] logo completa (PDF), [1] símbolo (avatar).
  const inputs = dialog.locator('input[type="file"]');
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

  await dialog.getByRole("button", { name: "Salvar imagens" }).click();

  await expect(page.getByText("Dados da empresa atualizados")).toBeVisible();
  expect(sentInput).not.toBeNull();
  expect(sentInput!.logoFileName).toBe("marca.png");
  expect(String(sentInput!.logoBase64 ?? "").length).toBeGreaterThan(0);
  // As duas imagens viajam na MESMA mutation — enviar uma não pode descartar
  // a outra.
  expect(sentInput!.avatarFileName).toBe("simbolo.png");
  expect(String(sentInput!.avatarBase64 ?? "").length).toBeGreaterThan(0);
});

test("company: salvar sem alterar fecha o modal sem ir ao servidor", async ({
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
  await page.goto("/settings/company");
  await expect(
    page.getByRole("heading", { name: "Identificação da empresa" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Editar segmento" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();

  // Fechar já é o retorno visível — e um "salvo com sucesso" sem mudança nenhuma
  // seria mentira.
  await expect(dialog).toBeHidden();
  expect(called).toBe(false);
});

test("company: edita o contato pelo modal do card", async ({ page }) => {
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
          data: { ...company, whatsapp: "71988887777" },
        },
      };
    },
  });

  await grantRole(page, "OWNER");
  await page.goto("/settings/company");

  await page.getByRole("button", { name: "Editar contato" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('input[name="whatsapp"]').fill("71988887777");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByText("Dados da empresa atualizados")).toBeVisible();
  // Só o assunto do card viaja: o modal de contato não manda endereço nem marca.
  expect(Object.keys(sentInput!)).toEqual(["whatsapp"]);
});
