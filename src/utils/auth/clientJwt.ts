import { getCookie } from "../cookies/clientCookie";
import { JwtPayload } from "./types";

export const parseJwt = (token: string): JwtPayload | null => {
  if (typeof window !== "undefined") {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
      return null;
    }
  }
  return null;
};

export const getDecodedToken = (): JwtPayload | null => {
  const token = getCookie<string>("token");
  if (!token) return null;
  return parseJwt(token);
};
