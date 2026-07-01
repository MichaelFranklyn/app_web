import { FlowDefinition } from "../../../interface";
import {
  factoryClientsFlow,
  factoryImportTemplateFlow,
  factoryOrdersFlow,
  factorySellersFlow,
} from "./factoryTabs";

// Fluxos das abas internas da fábrica (sellers / clients / orders / import-template).
export const factoryTabsFlows: FlowDefinition[] = [
  factorySellersFlow,
  factoryClientsFlow,
  factoryOrdersFlow,
  factoryImportTemplateFlow,
];
