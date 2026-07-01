import { FlowDefinition } from "../../../interface";
import { clientDetailFlow } from "./clientDetail";

// Fluxos da rota /clients/[id]/overview.
export const clientDetailFlows: FlowDefinition[] = [clientDetailFlow];
