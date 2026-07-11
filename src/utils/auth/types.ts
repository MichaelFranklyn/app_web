/**
 * Claims do JWT emitido pelo backend.
 *
 * Os campos conhecidos são opcionais (o token pode não trazê-los); claims
 * extras chegam como `unknown` via a index signature — nunca `any` — para
 * quem lê o token não perder a checagem de tipo em `sub`, `role`, `seller_id`
 * etc. (o `JSON.parse` cru devolveria `any` e contaminaria todo o path de auth).
 */
export interface JwtPayload {
  sub?: string;
  role?: string;
  seller_id?: string;
  company_id?: string;
  exp?: number;
  [claim: string]: unknown;
}
