export type FlowStatus = "pending" | "completed" | "skipped";

export type FlowStepSide = "top" | "bottom" | "left" | "right";
export type FlowStepAlign = "start" | "center" | "end";

// Sobrescreve o texto (título/descrição) de um step para roles específicas. Útil
// quando o passo existe para todos, mas o que cada role enxerga muda. A 1ª entrada
// cuja lista inclui a role atual vence; sem match, usa o título/descrição padrão.
export interface FlowStepRoleText {
  roles: string[];
  title?: string;
  description?: string;
}

// Um passo do fluxo guiado. `element` é um seletor CSS do alvo (ausente = caixa
// centralizada, estilo modal de boas-vindas).
export interface FlowStep {
  element?: string;
  title: string;
  description: string;
  side?: FlowStepSide;
  align?: FlowStepAlign;
  // Seletor(es) clicado(s) em sequência antes do step aparecer (ex.: trocar de aba).
  // Cada um é aguardado até existir antes do clique.
  clickBefore?: string | string[];
  // Só exibe o step se este seletor de CONTEÚDO existir/estiver visível no momento de
  // mirar o alvo. Use quando `element` é um container que sempre renderiza: sem o
  // conteúdo (ex.: as linhas da lista), o step é pulado em vez de iluminar uma box vazia.
  requireSelector?: string;
  // Inverso de `requireSelector`: pula o step se ESTE seletor existir no DOM. Útil para
  // um step de "empty state" que só deve aparecer quando a lista NÃO tem itens.
  skipIfSelector?: string;
  // Roles que veem este step. Ausente = todos. Use os MESMOS roles do gating do alvo:
  // se o alvo não renderiza para o role, o step é pulado e a numeração é recalculada.
  roles?: string[];
  // Variações de texto por role (resolvidas em getVisibleSteps). Diferente de `roles`,
  // que pula o step inteiro: aqui o step continua visível, só o título/descrição muda.
  roleText?: FlowStepRoleText[];
}

// Espelha o tipo UserFlowLayoutType do back (progresso por usuário/fluxo).
export interface UserFlowLayout {
  id: string;
  flowKey: string;
  status: FlowStatus;
  lastStep: number;
  version: number;
}

export interface UserFlowLayoutQueryData {
  userFlowLayout: {
    status: boolean;
    code: number;
    message: string;
    data: UserFlowLayout[] | null;
  };
}

export interface UpsertUserFlowLayoutData {
  upsertUserFlowLayout: {
    status: boolean;
    code: number;
    message: string;
    data: UserFlowLayout | null;
  };
}

export interface UpsertUserFlowLayoutInput {
  flowKey: string;
  status?: FlowStatus;
  lastStep?: number;
  version?: number;
}

// Definição de um fluxo guiado: os steps ficam no front; o back só guarda o
// progresso. `version` permite re-exibir quando os steps mudam.
export interface FlowDefinition {
  key: string;
  // Nome exibido no menu do lançador (FAB).
  label: string;
  // Resumo curto exibido no card da biblioteca de fluxos.
  description?: string;
  // Categoria usada para agrupar os fluxos na biblioteca. Sem grupo → "Outros".
  group?: string;
  // Roles que podem ver/rodar o fluxo. Ausente = disponível para todos.
  roles?: string[];
  // Rota onde o fluxo se aplica (match com o pathname, com segmentos dinâmicos).
  route: string;
  version: number;
  // Dispara sozinho na 1ª visita à rota. Sem isso, só roda pelo lançador.
  autoStart?: boolean;
  steps: FlowStep[];
}

// Status agregado de um fluxo para o usuário atual, exibido na biblioteca.
export type FlowProgressStatus = "new" | "pending" | "completed";
