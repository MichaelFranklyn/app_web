import { FlowDefinition } from "../../../interface";
import { productDetailFlow } from "./productDetail";

// Fluxos da rota /factories/[id]/products/[productId].
export const productDetailFlows: FlowDefinition[] = [productDetailFlow];
