import { FlowDefinition, FlowStep } from "../interface";
import { clientDetailFlows } from "./definitions/clientDetail";
import { clientTabsFlows } from "./definitions/clientTabs";
import { clientsFlows } from "./definitions/clients";
import { factoriesFlows } from "./definitions/factories";
import { factoryDetailFlows } from "./definitions/factoryDetail";
import { factoryPricesFlows } from "./definitions/factoryPrices";
import { factoryProductsFlows } from "./definitions/factoryProducts";
import { factoryTabsFlows } from "./definitions/factoryTabs";
import { orderDetailFlows } from "./definitions/orderDetail";
import { ordersFlows } from "./definitions/orders";
import { priceListDetailFlows } from "./definitions/priceListDetail";
import { productDetailFlows } from "./definitions/productDetail";
import { profileFlows } from "./definitions/profile";
import { routineDayFlows } from "./definitions/routineDay";
import { routinesFlows } from "./definitions/routines";
import { sellerDetailFlows } from "./definitions/sellerDetail";
import { sellersFlows } from "./definitions/sellers";
import { settingsCatalogFlows } from "./definitions/settingsCatalog";
import { settingsRoutineFlows } from "./definitions/settingsRoutine";
import { systemFlows } from "./definitions/system";
import { usersFlows } from "./definitions/users";

export * from "./keys";
export { FLOW_ROUTES } from "./routes";

// Catálogo por rota. A ordem aqui define a ordem dos grupos e dos cards na
// biblioteca do lançador (o agrupamento preserva a 1ª aparição de cada grupo).
const FLOW_LIST: FlowDefinition[] = [
  ...systemFlows,
  ...routinesFlows,
  ...routineDayFlows,
  ...clientsFlows,
  ...clientDetailFlows,
  ...clientTabsFlows,
  ...ordersFlows,
  ...orderDetailFlows,
  ...factoriesFlows,
  ...factoryDetailFlows,
  ...factoryProductsFlows,
  ...productDetailFlows,
  ...factoryPricesFlows,
  ...priceListDetailFlows,
  ...factoryTabsFlows,
  ...usersFlows,
  ...sellersFlows,
  ...sellerDetailFlows,
  ...settingsCatalogFlows,
  ...settingsRoutineFlows,
  ...profileFlows,
];

// Catálogo indexado por key. Bump em `version` (na definição) re-exibe o tutorial
// mesmo para quem já concluiu (o back compara as versões).
export const FLOWS: Record<string, FlowDefinition> = Object.fromEntries(
  FLOW_LIST.map((flow) => [flow.key, flow])
);

export const getFlow = (flowKey: string): FlowDefinition | undefined =>
  FLOWS[flowKey];

const isDynamicSegment = (segment: string): boolean =>
  segment.startsWith("[") && segment.endsWith("]");

// Casa o pathname com o pattern do fluxo, suportando segmentos dinâmicos do Next
// (ex.: "[id]"). Mesmo número de segmentos e dinâmicos casam com tudo.
const matchRoute = (pattern: string, pathname: string): boolean => {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return false;
  return patternParts.every(
    (part, index) => isDynamicSegment(part) || part === pathParts[index]
  );
};

// Precedência tipo Next entre rotas de mesmo tamanho: segmento estático vence o
// dinâmico no 1º índice em que diferem.
const isMoreSpecific = (routeA: string, routeB: string): boolean => {
  const a = routeA.split("/").filter(Boolean);
  const b = routeB.split("/").filter(Boolean);
  for (let i = 0; i < a.length; i += 1) {
    const aDyn = isDynamicSegment(a[i]);
    const bDyn = isDynamicSegment(b[i]);
    if (aDyn !== bDyn) return !aDyn;
  }
  return false;
};

// Regra única de role: sem `roles` → liberado para todos; com `roles` → só os listados.
const roleAllows = (
  roles: string[] | undefined,
  role: string | null
): boolean =>
  !roles || roles.length === 0 || (role != null && roles.includes(role));

// Resolve o texto do step para a role atual: se houver um `roleText` cuja lista
// inclui a role, sobrescreve título/descrição (campos omitidos caem no padrão).
const resolveStepText = (step: FlowStep, role: string | null): FlowStep => {
  const variant = step.roleText?.find(
    (v) => role != null && v.roles.includes(role)
  );
  if (!variant) return step;
  return {
    ...step,
    title: variant.title ?? step.title,
    description: variant.description ?? step.description,
  };
};

// Steps visíveis de um fluxo para o role atual — pula os steps gateados por role e
// resolve variações de texto por role. O motor opera só sobre estes.
export const getVisibleSteps = (
  flow: FlowDefinition,
  role: string | null = null
): FlowStep[] =>
  flow.steps
    .filter((step) => roleAllows(step.roles, role))
    .map((step) => resolveStepText(step, role));

// Fluxos disponíveis para uma rota (na ordem do catálogo). Resolve a rota mais
// específica (precedência tipo Next) para o pathname e filtra pelo role (precisa
// permitir E sobrar ao menos 1 step visível).
export const getFlowsForRoute = (
  pathname: string,
  role: string | null = null
): FlowDefinition[] => {
  const routeMatches = FLOW_LIST.filter((flow) =>
    matchRoute(flow.route, pathname)
  );
  if (routeMatches.length === 0) return [];

  // Rota vencedora = a mais específica entre as que casaram (estática > dinâmica).
  const best = routeMatches.reduce(
    (acc, flow) => (isMoreSpecific(flow.route, acc.route) ? flow : acc),
    routeMatches[0]
  );

  return routeMatches.filter(
    (flow) =>
      !isMoreSpecific(best.route, flow.route) &&
      roleAllows(flow.roles, role) &&
      getVisibleSteps(flow, role).length > 0
  );
};
