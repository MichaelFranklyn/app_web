/**
 * Papel do usuário: a cor e o rótulo são os mesmos na tabela desta lista e no
 * cabeçalho do perfil — que hoje é montado em duas rotas (/settings/users/[id] e
 * /settings/user/[id]). A fonte única mora em `_shared/userProfile/roles`; aqui
 * só reexportamos para não reescrever os imports desta pasta.
 */
export { ROLE_COLOR, ROLE_LABEL } from "../../_shared/userProfile/roles";
export type { UserRole } from "../../_shared/userProfile/roles";

/**
 * Colunas por onde a lista de pessoas pode ser ordenada.
 *
 * As três são colunas de `users`, e o `sortKey` de cada `Table.Head` repete
 * estes nomes. A lista é METADE de um contrato: o backend resolve a coluna com
 * `getattr(model, campo)`, e um nome que exista só aqui faria a lista se
 * ordenar por `created_at` em silêncio.
 *
 * Fica de fora o que a coluna mostra mas o banco não alcança: o resumo de campo
 * (fábricas e clientes atendidos) é contado por DataLoader depois da consulta.
 */
export const USER_SORTABLE_FIELDS = ["name", "created_at", "is_active"];
