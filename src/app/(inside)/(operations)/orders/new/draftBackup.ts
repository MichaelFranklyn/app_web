import { DraftItem } from "../../_shared/orderDraftItems";

/**
 * Cópia dos itens do pedido que ainda não foi criado, guardada no aparelho.
 *
 * O pedido NÃO vai para a fila offline (ver `@/services/offlineQueue`): enviado
 * mais tarde ele gravaria preço e piso sem ninguém conferir. O que se evita é
 * perder o trabalho — trinta itens digitados na loja, o sinal cai, o celular
 * bloqueia, a aba é descartada. A cópia devolve os itens à tela para a pessoa
 * conferir e criar com sinal.
 *
 * Uma cópia por pessoa × fábrica × cliente: é o que define o pedido. Os dados
 * do pedido (condição, frete) não entram — são poucos campos, e a condição
 * depende da tabela da fábrica, que pode ter mudado.
 */
export interface DraftBackup {
  items: DraftItem[];
  /** Quando foi guardada (ISO) — a tela mostra, para a pessoa reconhecer. */
  savedAt: string;
}

const PREFIX = "girus:order-draft:v1";

/** Uma semana: depois disso o preço guardado já não diz nada. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function draftBackupKey(
  userId: string,
  factoryId: string,
  clientId: string
): string {
  return `${PREFIX}:${userId}:${factoryId}:${clientId}`;
}

export function readDraftBackup(
  key: string,
  now = Date.now()
): DraftBackup | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const backup = JSON.parse(raw) as DraftBackup;
    if (!backup.items?.length) return null;
    if (now - new Date(backup.savedAt).getTime() > MAX_AGE_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return backup;
  } catch {
    return null;
  }
}

export function writeDraftBackup(
  key: string,
  items: DraftItem[],
  now = new Date()
) {
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        items,
        savedAt: now.toISOString(),
      } satisfies DraftBackup)
    );
  } catch {
    // Sem armazenamento (aba anônima, cota cheia): o pedido segue só na tela.
  }
}

export function clearDraftBackup(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignora
  }
}
