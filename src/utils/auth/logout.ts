import { removeCookie } from "../cookies/clientCookie";

// Cookies gravados no login (app/(auth)/login/page.tsx)
const AUTH_COOKIES = ["token", "refresh_token", "remember", "userData"];

export const clearAuthCookies = () => {
  AUTH_COOKIES.forEach((name) => removeCookie(name));
};

export const logout = () => {
  clearAuthCookies();
  // Recarrega na rota pública: limpa cache do Apollo e estado em memória
  window.location.replace("/login");
};
