import { describe, expect, it } from "vitest";

import { GET } from "./route";

/**
 * O manifesto decide como o app INSTALADO se comporta, e quase todo erro aqui é
 * silencioso: ninguém vê exceção, o aparelho só deixa de oferecer a instalação
 * ou abre no lugar errado. Daí prender o conteúdo.
 */
interface Manifest {
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: { src: string; sizes: string; purpose: string }[];
  shortcuts: { name: string; url: string }[];
}

const manifesto = async (): Promise<Manifest> =>
  (await GET().json()) as Manifest;

describe("manifest.webmanifest", () => {
  it("é servido com o tipo que o navegador espera", async () => {
    // Com o content-type errado o navegador ignora o manifesto e o botão
    // "instalar aplicativo" simplesmente não aparece.
    expect(GET().headers.get("Content-Type")).toBe("application/manifest+json");
  });

  it("o cache dura uma hora: eterno prenderia o ícone antigo no aparelho", async () => {
    expect(GET().headers.get("Cache-Control")).toBe("public, max-age=3600");
  });

  it("abre sem barra de endereço — é o ponto de instalar", async () => {
    expect((await manifesto()).display).toBe("standalone");
  });

  it("o nome curto cabe sob o ícone do Android", async () => {
    // Acima de 12 caracteres o Android trunca com reticências no meio do nome.
    expect((await manifesto()).short_name.length).toBeLessThanOrEqual(12);
  });

  it("abre no dashboard, não na landing", async () => {
    // A raiz é marketing e não tem nada a dizer a quem já instalou; quem não
    // estiver logado é levado ao login pelo proxy de sessão.
    expect((await manifesto()).start_url).toBe("/dashboard");
  });

  it("o escopo é a raiz, para o portal e o login não pularem para o navegador", async () => {
    expect((await manifesto()).scope).toBe("/");
  });

  it("os caminhos são relativos: a origem é a de onde o manifesto veio", async () => {
    // Um caminho absoluto fixaria uma origem só, e instalar a partir de um
    // preview abriria produção.
    const dados = await manifesto();
    const caminhos = [
      dados.start_url,
      dados.scope,
      ...dados.icons.map((i) => i.src),
      ...dados.shortcuts.map((s) => s.url),
    ];

    for (const caminho of caminhos) {
      expect(caminho, caminho).toMatch(/^\//);
      expect(caminho, caminho).not.toMatch(/^https?:/);
    }
  });

  it("a tela de abertura usa a cor do tema, não branco", async () => {
    // Branco daria um flash claro em cima do fundo bege do app.
    const dados = await manifesto();

    expect(dados.background_color).toBe("#f5f4f0");
    expect(dados.theme_color).toBe("#c97f0a");
  });

  it("tem os dois tamanhos de ícone que a instalação exige", async () => {
    const any = (await manifesto()).icons.filter((i) => i.purpose === "any");

    expect(any.map((i) => i.sizes).sort()).toEqual(["192x192", "512x512"]);
  });

  it("tem ícone maskable à parte do comum", async () => {
    // O Android recorta em círculo e só garante os 80% centrais: sem a versão
    // com margem, as pontas da seta são cortadas.
    const maskable = (await manifesto()).icons.filter(
      (i) => i.purpose === "maskable"
    );

    expect(maskable).toHaveLength(1);
    expect(maskable[0]!.sizes).toBe("512x512");
  });

  it("os atalhos apontam só para rotas que existem", async () => {
    // Atalho quebrado no menu do sistema é pior que atalho ausente — e o
    // wizard de criar pedido é modal, sem URL própria.
    const { shortcuts } = await manifesto();

    expect(shortcuts.map((s) => s.url)).toEqual(["/routines", "/orders"]);
  });
});
