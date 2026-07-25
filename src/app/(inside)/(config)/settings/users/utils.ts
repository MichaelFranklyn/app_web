/**
 * Papel do usuário: a cor e o rótulo são os mesmos na tabela desta lista e no
 * cabeçalho do perfil — que hoje é montado em duas rotas (/settings/users/[id] e
 * /settings/user/[id]). A fonte única mora em `_shared/userProfile/roles`; aqui
 * só reexportamos para não reescrever os imports desta pasta.
 */
export { ROLE_COLOR, ROLE_LABEL } from "../../_shared/userProfile/roles";
export type { UserRole } from "../../_shared/userProfile/roles";
