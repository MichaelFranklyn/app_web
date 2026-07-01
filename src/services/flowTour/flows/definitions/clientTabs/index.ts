import { FlowDefinition } from "../../../interface";
import {
  clientFactoriesFlow,
  clientOrdersFlow,
  clientScoreFlow,
  clientStockFlow,
  clientVisitsFlow,
} from "./clientTabs";

// Fluxos das abas internas do cliente, sob demanda.
export const clientTabsFlows: FlowDefinition[] = [
  clientFactoriesFlow,
  clientOrdersFlow,
  clientVisitsFlow,
  clientStockFlow,
  clientScoreFlow,
];
