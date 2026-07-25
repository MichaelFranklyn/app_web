/**
 * Campos pessoais que viajam numa edição. Os dois caminhos mandam exatamente
 * estes: o dono do perfil por `updateMyProfile` e o gestor por `updateUser`.
 */
export interface PersonDataInput {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  birthDate?: string;
  addressZip?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
}
