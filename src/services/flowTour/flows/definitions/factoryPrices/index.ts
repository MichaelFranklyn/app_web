import { FlowDefinition } from "../../../interface";
import { factoryPricesFlow } from "./factoryPrices";

// Fluxos da rota /factories/[id]/price-lists.
export const factoryPricesFlows: FlowDefinition[] = [factoryPricesFlow];
