import { clientDisplayName } from "./client";

/**
 * Nome de exibição de uma fábrica/empresa: o apelido que a empresa deu à
 * fábrica vem primeiro (é como ela a chama no dia a dia), depois nome fantasia,
 * razão social e, por fim, "—". O apelido mora no vínculo company_factory, mas
 * o backend o resolve dentro de `FactoryType` para o tenant do contexto — basta
 * a query pedir `nickname` junto dos outros campos.
 */
export const factoryName = (
  factory?: {
    nickname?: string | null;
    nomeFantasia?: string | null;
    razaoSocial?: string | null;
  } | null
): string => {
  if (!factory) return "—";
  return factory.nickname ?? factory.nomeFantasia ?? factory.razaoSocial ?? "—";
};

/**
 * Nome de exibição de um cliente. Delega ao canônico {@link clientDisplayName}
 * (razão social primeiro — o identificador que a carteira e a busca priorizam),
 * apenas mantendo o fallback "—" desta camada. Antes divergia (nome fantasia
 * primeiro), fazendo o mesmo cliente aparecer com nomes diferentes conforme a
 * tela importava um helper ou o outro.
 */
export const clientName = (
  client?: { nomeFantasia?: string | null; razaoSocial?: string | null } | null
): string => clientDisplayName(client, "—");

/**
 * Iniciais para o avatar de uma empresa.
 *
 * Ignora tokens sem letra: "CONTATO - REPRESENTACOES LTDA." rendia "C-", com o
 * hífen fazendo as vezes de inicial.
 */
export const companyInitials = (name?: string | null): string =>
  (name ?? "")
    .split(/\s+/)
    .filter((part) => /\p{L}/u.test(part))
    .slice(0, 2)
    .map((part) => part.match(/\p{L}/u)?.[0].toUpperCase() ?? "")
    .join("");

/** Palavras que ficam minúsculas no meio do nome ("Comércio de Tintas"). */
const NAME_CONNECTORS = new Set(["de", "da", "do", "das", "dos", "e"]);
/** Siglas societárias que continuam em caixa alta ("Menezes Ltda" não). */
const NAME_ACRONYMS = new Set([
  "LTDA",
  "ME",
  "EPP",
  "EIRELI",
  "SA",
  "S/A",
  "S.A",
  "S.A.",
]);

/**
 * Nome de empresa para exibição. A razão social vem da Receita em CAIXA ALTA
 * ("MENEZES REPRESENTACOES") e no topo do sistema parecia um grito; vira
 * "Menezes Representacoes". Só mexe em nome TODO maiúsculo: o que a empresa
 * digitou com caixa própria (apelido, "iFood Repres.") fica como está.
 */
export const companyDisplayName = (name?: string | null): string => {
  const trimmed = (name ?? "").trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed !== trimmed.toLocaleUpperCase("pt-BR"))
    return trimmed;
  return trimmed
    .split(" ")
    .map((word, index) => {
      if (NAME_ACRONYMS.has(word)) return word;
      const lower = word.toLocaleLowerCase("pt-BR");
      if (index > 0 && NAME_CONNECTORS.has(lower)) return lower;
      return lower.replace(/\p{L}/u, (letter) =>
        letter.toLocaleUpperCase("pt-BR")
      );
    })
    .join(" ");
};
