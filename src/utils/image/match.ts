/**
 * Casamento de foto com produto pelo NOME DO ARQUIVO.
 *
 * É o que torna o envio em massa viável: a fábrica manda as fotos nomeadas com
 * o código do produto, o usuário arrasta as 50 de uma vez e não escolhe nada.
 * A comparação precisa perdoar o que muda entre o arquivo do fornecedor e o SKU
 * digitado no cadastro — caixa, acento, espaço, hífen, ponto, sublinhado e o
 * sufixo que o celular/Windows acrescenta em cópias ("CP-M-001 (1).jpg").
 */

/** Remove diretório, extensão e sufixo de cópia do nome do arquivo. */
export const fileNameStem = (fileName: string): string =>
  fileName
    .split(/[\\/]/)
    .pop()!
    .replace(/\.[^.]+$/, "")
    .replace(/[\s_-]*\(\d+\)$/, "")
    .trim();

/**
 * Chave de comparação: minúsculas, sem acento e só com letras e números.
 *
 * "CP-M 001.jpg" e "cp_m_001" viram ambos "cpm001", que é o que permite o
 * casamento acontecer sem o usuário renomear arquivo nenhum.
 */
export const matchKey = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export interface MatchTarget {
  id: string;
  sku: string;
}

export interface FileMatch<T extends MatchTarget> {
  file: File;
  /** Produto correspondente, ou null quando o nome não bateu com nenhum SKU. */
  target: T | null;
}

/**
 * Associa cada arquivo ao produto cujo SKU casa com o nome.
 *
 * Dois arquivos podem apontar para o mesmo produto (o usuário mandou a foto
 * repetida em formatos diferentes) — resolver isso é decisão da tela, não daqui;
 * esta função só relata o que casou.
 */
export function matchFilesToTargets<T extends MatchTarget>(
  files: File[],
  targets: T[]
): FileMatch<T>[] {
  const byKey = new Map<string, T>();
  for (const target of targets) {
    const key = matchKey(target.sku);
    // Primeiro a entrar vence: SKUs que colidem depois de normalizados são
    // ambíguos, e escolher o último seria igualmente arbitrário e menos estável.
    if (key && !byKey.has(key)) byKey.set(key, target);
  }

  return files.map((file) => ({
    file,
    target: byKey.get(matchKey(fileNameStem(file.name))) ?? null,
  }));
}
