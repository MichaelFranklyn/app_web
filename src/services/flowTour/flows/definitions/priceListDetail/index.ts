import { FlowDefinition } from "../../../interface";
import { priceListDetailFlow } from "./priceListDetail";

// Fluxos da rota /factories/[id]/price-lists/[priceListId].
export const priceListDetailFlows: FlowDefinition[] = [priceListDetailFlow];
