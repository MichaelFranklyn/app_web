import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * GUARDA DE ÂMBAR PARADO — âmbar é só do que é interativo.
 *
 * O âmbar diz "isto se toca". Texto parado em âmbar (título de tooltip,
 * rótulo de seção, aviso) ensina a pessoa a clicar no que não responde. A
 * Leva 10 (14/11/2026) passou os títulos de tooltip para a cor padrão e os
 * avisos para `color="warning"`; a Leva 11 fez o mesmo com selo, ícone em
 * forma e valor de card.
 *
 * A trava recusa `color="amber"` (ou `tone="amber"`) em `Title`, `Badge`,
 * `IconTile`, `Card.Item.Value` e `DetailLine` fora de `(marketing)`, onde o
 * eyebrow âmbar é identidade da marca. `Button` e `Avatar` de marca ficam de
 * fora: o botão é a própria ação. Um texto que mora DENTRO de algo
 * clicável (uma linha de menu, um botão) ou que ecoa um estado de seleção
 * pode ficar âmbar: o arquivo entra em KNOWN, com o motivo.
 */

const ROOT = process.cwd();
const SRC = resolve(ROOT, "src");

/** Arquivos com âmbar parado legítimo, com o motivo. */
const KNOWN: Record<string, string> = {
  "src/app/(inside)/_components/NotificationCenter/PushInviteRow/index.tsx":
    "o texto é o rótulo de uma Dropdown.PanelRow clicável (tone amber)",
  "src/app/(inside)/_components/OfficeSwitcher/index.tsx":
    "contador de convites dentro do botão de trocar escritório",
  "src/app/(inside)/(operations)/commissions/_components/FactoryCommissionGroup/index.tsx":
    "eco da seleção em massa — seleção é estado interativo e é âmbar no DS",
  "src/components/Input/InputSelect.tsx":
    "chip da opção escolhida, removível — seleção é estado interativo",
  "src/components/OptionCard/index.tsx": "ícone dentro do <button> da opção",
};

const AMBER_TITLE =
  /<(?:Title|Badge(?:\.Root)?|IconTile|Card\.Item\.Value|DetailLine)\b[^>]*?\s(?:color|tone)="amber"/g;

function* sourceFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "(marketing)") yield* sourceFiles(path);
    } else if (/\.tsx$/.test(entry.name) && !/\.test\./.test(entry.name))
      yield path;
  }
}

const count = (source: string) => source.match(AMBER_TITLE)?.length ?? 0;

describe("guarda de âmbar parado", () => {
  it("o detector acha o âmbar em uma ou várias linhas", () => {
    expect(count(`<Title variant="label" color="amber">`)).toBe(1);
    expect(count(`<Title\n  variant="caption"\n  color="amber"\n>`)).toBe(1);
    expect(count(`<Title variant="label">`)).toBe(0);
    expect(count(`<Button.Root color="amber">`)).toBe(0);
    expect(count(`<Title color="warning">`)).toBe(0);
    expect(count(`<Badge.Root appearance="tinted" color="amber">`)).toBe(1);
    expect(count(`<IconTile color="amber" size="xs">`)).toBe(1);
    expect(count(`<Card.Item.Value color="amber">`)).toBe(1);
    expect(count(`<DetailLine label="x" tone="amber" />`)).toBe(1);
    expect(count(`<Avatar color="amber">`)).toBe(0);
  });

  it("nenhum âmbar parado fora do marketing e de KNOWN", () => {
    const found: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const rel = relative(ROOT, file);
      if (rel in KNOWN) continue;
      const n = count(readFileSync(file, "utf8"));
      if (n) found.push(`${rel}: ${n}`);
    }
    expect(found).toEqual([]);
  });

  it("KNOWN não guarda arquivo que já se resolveu", () => {
    const stale = Object.keys(KNOWN).filter(
      (rel) => count(readFileSync(resolve(ROOT, rel), "utf8")) === 0
    );
    expect(stale).toEqual([]);
  });
});
