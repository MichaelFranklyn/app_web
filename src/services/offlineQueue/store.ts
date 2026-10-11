import { OfflineEntry, OfflineFailure, OfflineQueueState } from "./interface";
import { dropExpired, sameSubject, upsertEntry } from "./utils";

/**
 * A fila mora no `localStorage`, e não na memória, porque o caso real é o
 * vendedor bloquear o celular, sair da loja e só abrir o app de novo no carro:
 * a aba pode ter sido descartada pelo sistema no meio.
 *
 * O que fica gravado é o mínimo — ids, status, dias de estoque e o nome do
 * cliente para a pessoa reconhecer o registro. Nenhum dado de sessão. Cada
 * entrada tem dono (`userId`): outra pessoa que entre no mesmo aparelho não
 * envia o que não é dela, e o que passa de 7 dias é descartado.
 */
const STORAGE_KEY = "girus:offline-queue:v1";

const EMPTY: OfflineQueueState = { entries: [], failures: [] };

type Listener = () => void;
const listeners = new Set<Listener>();

// O snapshot precisa ser o MESMO objeto enquanto nada muda — é o contrato do
// `useSyncExternalStore`, senão o React re-renderiza em laço.
let cached: OfflineQueueState | null = null;

// A última gravação não coube no armazenamento (bloqueado ou cheio): a fila
// vive só na memória desta aba, e reler o disco a apagaria.
let memoryOnly = false;

function read(): OfflineQueueState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<OfflineQueueState>;
    return {
      entries: dropExpired(parsed.entries ?? [], Date.now()),
      failures: parsed.failures ?? [],
    };
  } catch {
    // Armazenamento bloqueado (aba anônima de alguns navegadores) ou valor
    // corrompido: sem fila, o app segue como antes dela existir.
    return EMPTY;
  }
}

function write(next: OfflineQueueState) {
  cached = next;
  try {
    if (next.entries.length === 0 && next.failures.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    memoryOnly = false;
  } catch {
    memoryOnly = true;
    // Sem armazenamento a fila vive só nesta aba — melhor que perder o toque.
  }
  listeners.forEach((listener) => listener());
}

export function getQueueState(): OfflineQueueState {
  if (cached === null) cached = read();
  return cached;
}

/**
 * Relê o armazenamento, ignorando a cópia em memória. A descarga chama antes
 * de enviar: outra aba pode ter mandado (ou trocado) entradas, e o evento
 * `storage` só atualiza quem tem tela inscrita.
 */
export function refreshQueueState(): OfflineQueueState {
  if (memoryOnly) return getQueueState();
  const fresh = read();
  const changed = JSON.stringify(fresh) !== JSON.stringify(cached);
  if (changed) {
    cached = fresh;
    listeners.forEach((listener) => listener());
  }
  return getQueueState();
}

/** Estado vazio para o render do servidor (sem `localStorage`). */
export function getServerQueueState(): OfflineQueueState {
  return EMPTY;
}

export function subscribeQueue(listener: Listener): () => void {
  listeners.add(listener);
  // Outra aba do app mexeu na fila: relê para as duas mostrarem o mesmo.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cached = read();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Nome da trava de gravação entre abas (Web Locks). Não é a da descarga. */
export const WRITE_LOCK = "girus:offline-queue:write";

/**
 * Toda alteração da fila passa por aqui, e parte do que está GRAVADO, nunca da
 * cópia em memória da aba.
 *
 * Com o app em duas abas (ou aba + PWA instalado), cada uma tinha a sua cópia:
 * uma guardava a visita A, a outra guardava a B por cima da lista que conhecia
 * — e a A sumia sem aviso. Reler dentro de uma trava compartilhada faz a
 * segunda gravação enxergar a primeira.
 *
 * A trava é própria, e não a da descarga: aquela fica presa durante o envio
 * inteiro (rede incluída), e um toque não pode esperar por isso. Esta só dura
 * o ler-alterar-gravar, que é síncrono.
 */
function mutate(
  change: (state: OfflineQueueState) => OfflineQueueState
): Promise<void> {
  // Sem armazenamento, a memória desta aba é tudo o que existe.
  const apply = () => write(change(memoryOnly ? getQueueState() : read()));
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  // Navegador sem Web Locks: ainda relê antes de gravar, que já fecha o caso
  // da cópia velha; só não há fila de espera entre as abas.
  if (!locks) {
    apply();
    return Promise.resolve();
  }
  return locks.request(WRITE_LOCK, apply);
}

export function enqueue(entry: OfflineEntry): Promise<void> {
  return mutate((state) => ({
    entries: upsertEntry(state.entries, entry),
    // Uma resposta nova sobre o mesmo assunto torna a recusa antiga irrelevante.
    failures: state.failures.filter((f) => !sameSubject(f, entry)),
  }));
}

/** Esta pessoa tem algo esperando o sinal? Confere o gravado: pode ser de outra aba. */
export function hasEntriesOf(userId: string): boolean {
  return refreshQueueState().entries.some((e) => e.userId === userId);
}

/** Tira a entrada da fila — enviada, ou recusada (aí com o motivo). */
export function settle(
  entry: OfflineEntry,
  failure?: OfflineFailure
): Promise<void> {
  return mutate((state) => ({
    // Só sai se ainda for a MESMA entrada: se a pessoa respondeu de novo
    // enquanto esta estava a caminho, a resposta nova fica para o próximo envio.
    entries: state.entries.filter(
      (e) => !(sameSubject(e, entry) && e.createdAt === entry.createdAt)
    ),
    failures: failure ? [...state.failures, failure] : state.failures,
  }));
}

/**
 * Pede uma descarga já — usado quando a ação entrou na fila com a rede de pé
 * (havia registro anterior do mesmo assunto esperando a vez).
 */
export const FLUSH_REQUEST_EVENT = "girus:offline-queue:flush";

export function requestFlush() {
  window.dispatchEvent(new Event(FLUSH_REQUEST_EVENT));
}

/** "Entendi": some com as recusas desta pessoa (as de outra ficam para ela). */
export function dismissFailures(userId: string): Promise<void> {
  return mutate((state) => ({
    ...state,
    failures: state.failures.filter((f) => f.userId !== userId),
  }));
}

/** Só para testes: volta ao estado de fábrica. */
export function resetQueueForTests() {
  cached = null;
  memoryOnly = false;
  listeners.clear();
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignora
  }
}
