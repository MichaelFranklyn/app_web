import { FlowDefinition } from "../../../interface";
import { profileFlow } from "./profile";

// Fluxos do "Meu perfil" (/settings/user/[id]).
export const profileFlows: FlowDefinition[] = [profileFlow];
