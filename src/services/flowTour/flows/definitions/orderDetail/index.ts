import { FlowDefinition } from "../../../interface";
import { orderDetailFlow } from "./orderDetail";

// Fluxos da rota /orders/[id].
export const orderDetailFlows: FlowDefinition[] = [orderDetailFlow];
