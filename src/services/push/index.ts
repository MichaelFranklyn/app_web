// API pública do aviso no aparelho (Web Push).
//
// Mora em `services/` e não dentro de uma rota porque tem dois consumidores em
// lugares distantes: o card do perfil (ativar/desativar) e a saída do sistema,
// que descarta a inscrição para o próximo usuário daquele celular não receber
// aviso alheio.
export { usePushNotifications } from "./usePushNotifications";
export { forgetDeviceOnLogout } from "./forgetDevice";
export type { PushStatus } from "./interface";
