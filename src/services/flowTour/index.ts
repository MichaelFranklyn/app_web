// API pública do serviço de fluxos guiados (flow tour).
// - FlowTourProvider: provê o contexto e renderiza o lançador (FAB) + a camada do tour.
// - useFlowTourLauncher: inicia um fluxo e consulta o progresso a partir de qualquer lugar.
export { FlowTourProvider, useFlowTourLauncher } from "./FlowTourProvider";
export type {
  FlowDefinition,
  FlowStep,
  FlowStatus,
  FlowProgressStatus,
} from "./interface";
// Constantes de flow_key, caso seja preciso disparar um fluxo específico por código.
export * from "./flows/keys";
