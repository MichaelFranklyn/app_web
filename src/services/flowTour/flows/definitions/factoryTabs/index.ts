import { FlowDefinition } from "../../../interface";
import {
  factoryClientsFlow,
  factoryImportTemplateFlow,
  factoryOrdersFlow,
  factorySellersFlow,
  factoryTiersFlow,
} from "./factoryTabs";

// Fluxos das abas internas da fábrica (sellers / clients / orders / import-template / níveis).
export const factoryTabsFlows: FlowDefinition[] = [
  factorySellersFlow,
  factoryClientsFlow,
  factoryOrdersFlow,
  factoryImportTemplateFlow,
  factoryTiersFlow,
];
