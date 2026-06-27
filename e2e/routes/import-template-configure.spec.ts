import { expect, test } from "../support/fixtures";
import { mockGraphql } from "../support/graphql";

/**
 * Cauda longa — configurar o modelo de pedido da fábrica
 * (factories/[id]/import-template → ConfigureTemplateModal). Página SSR (stub).
 *
 * Fluxo PDF (o único determinístico no E2E): upload de PDF → preset entra em
 * "auto" → "Pré-visualizar" chama ExtractOrderFilePreview (mockado) → com itens
 * + detectedPreset o botão vira "Salvar modelo" → CreateImportTemplate.
 *
 * GOTCHA: há DOIS botões "Configurar modelo" (Modelo de pedido = este modal;
 * Modelo de tabela de preço = um link). O do modal é o 1º no DOM → .first().
 * canSave exige preview.length>0 E detectedPreset truthy.
 */
const base = "/factories/factory-1";

test("fábrica/import: configura o modelo de pedido por PDF (preview → salvar)", async ({
  page,
}) => {
  await mockGraphql(page, {
    ImportTemplates: () => ({ importTemplates: { edges: [] } }),
    ExtractOrderFilePreview: () => ({
      extractOrderFile: {
        status: true,
        message: "ok",
        data: {
          fileType: "PDF",
          detectedPreset: "prefix_dash",
          items: [
            {
              sku: "ABC-1",
              name: "Produto Exemplo",
              quantity: "10",
              unitPrice: "100.00",
              priceOptions: [],
            },
          ],
        },
      },
    }),
    CreateImportTemplate: () => ({
      createImportTemplate: {
        status: true,
        message: "ok",
        data: { id: "tpl-novo-1" },
      },
    }),
  });

  await page.goto(`${base}/import-template`);
  await page.getByRole("button", { name: "Configurar modelo" }).first().click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.locator("input[type=file]").setInputFiles({
    name: "pedido-exemplo.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 conteudo irrelevante (mutation mockada)"),
  });

  await dialog.getByRole("button", { name: "Pré-visualizar" }).click();

  // Após o preview com itens, o botão de ação vira "Salvar modelo".
  await dialog.getByRole("button", { name: "Salvar modelo" }).click();

  await expect(page.getByText("Modelo de pedido salvo")).toBeVisible();
});
